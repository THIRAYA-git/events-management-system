// ─────────────────────────────────────────────────────────────────────────────
//  src/services/booking.service.js
//  Orchestrates booking creation: pricing (pricing.service.js) + hall
//  assignment/conflict check (hall.availability.service.js) into a
//  persisted booking.
//
//  IMPORTANT — no client-side transactions here:
//  config/db.js uses @neondatabase/serverless's HTTP driver (sql.query()
//  per call, no pool.connect(), no BEGIN/COMMIT session). Every query()
//  call is a separate stateless HTTP request — wrapping them in
//  BEGIN/COMMIT from the application would do nothing, since there is
//  no persistent connection for Postgres to hold the transaction on.
//
//  Instead, correctness here relies on:
//    1. DB-level constraints doing the real atomic enforcement:
//       - hall_bookings_no_overlap (EXCLUDE USING gist) catches
//         conflicting time slots at the instant of INSERT.
//       - trg_hall_bookings_capacity_cap (trigger) catches the
//         1,200-seat venue-wide breach at the instant of INSERT.
//       Both fire regardless of what an earlier SELECT in this same
//       request saw — so they're safe even under concurrent requests.
//    2. Insert order is FK-forced: hall_bookings.booking_id REFERENCES
//       bookings, so bookings must be inserted first. If the
//       hall_bookings insert then fails (conflict/capacity), the now-
//       orphaned bookings row is explicitly deleted in the catch block
//       below — this is application-level cleanup, not a DB rollback,
//       since there is no transaction to roll back.
//
//  Practical implication: a crash between the two inserts (process
//  killed, network drop) can leave an orphaned 'pending' bookings row
//  with no hall_bookings row. There is no transaction safety net for
//  that case on Neon's HTTP driver. Acceptable for this project's scale
//  and traffic; flagged here so it isn't a silent assumption. If this
//  ever needs hardening, the standard fix is a periodic cleanup job
//  that cancels 'pending' bookings older than N minutes with no
//  matching hall_bookings row.
//
//  listBookings / updateBookingStatus (added for admin management):
//  updateBookingStatus updates bookings + hall_bookings together in a
//  single data-modifying CTE — one statement, one HTTP round trip to
//  Neon, so it's atomic at the Postgres level without needing an
//  application-managed transaction.
// ─────────────────────────────────────────────────────────────────────────────
const { query } = require('../config/db');
const { calculateBookingTotal } = require('./pricing.service');

const VENUE_COMBINED_CAPACITY = 1200;
const BUFFER_MINUTES = 60;
const ACTIVE_STATUSES = ['pending', 'confirmed'];

// ─────────────────────────────────────────────────────────────────────────────
//  createBooking
// ─────────────────────────────────────────────────────────────────────────────
const createBooking = async ({
  userId,
  hallId,
  eventDate,
  startTime,
  endTime,
  eventType,
  guestCount,
  roomCount       = 0,
  extraAddons     = 0,
  discountAmount  = 0,
  taxAmount       = 0,
  specialRequests = null,
}) => {
  if (!userId)    throw new Error('userId is required.');
  if (!hallId)    throw new Error('hallId is required.');
  if (!eventDate) throw new Error('eventDate is required.');
  if (!startTime || !endTime) throw new Error('startTime and endTime are required.');
  if (!eventType) throw new Error('eventType is required.');
  if (!guestCount || guestCount < 1) throw new Error('guestCount must be at least 1.');

  const pricing = await calculateBookingTotal({
    eventType,
    roomCount,
    extraAddons,
    discountAmount,
    taxAmount,
  });

  const hallResult = await query(
    `SELECT hall_id, hall_name, capacity
       FROM halls
      WHERE hall_id = $1 AND is_active = true`,
    [hallId]
  );
  if (hallResult.rows.length === 0) {
    throw new Error(`Hall with ID ${hallId} not found or is inactive.`);
  }
  const hall = hallResult.rows[0];

  if (guestCount > hall.capacity) {
    throw new Error(
      `Guest count (${guestCount}) exceeds ${hall.hall_name}'s capacity of ${hall.capacity} seats.`
    );
  }

  const conflictResult = await query(
    `SELECT hall_booking_id
       FROM hall_bookings
      WHERE hall_id    = $1
        AND event_date = $2
        AND status     = ANY($3)
        AND event_start_time - INTERVAL '${BUFFER_MINUTES} minutes' < $4::time
        AND event_end_time   + INTERVAL '${BUFFER_MINUTES} minutes' > $5::time`,
    [hallId, eventDate, ACTIVE_STATUSES, endTime, startTime]
  );
  if (conflictResult.rows.length > 0) {
    throw new Error(
      `${hall.hall_name} is no longer available for the requested slot on ${eventDate}.`
    );
  }

  const combinedResult = await query(
    `SELECT COALESCE(SUM(b.guest_count), 0) AS total_guests
       FROM hall_bookings hb
       JOIN bookings b ON b.booking_id = hb.booking_id
      WHERE hb.event_date = $1
        AND hb.status     = ANY($2)`,
    [eventDate, ACTIVE_STATUSES]
  );
  const existingGuests  = parseInt(combinedResult.rows[0].total_guests, 10);
  const projectedGuests = existingGuests + guestCount;
  if (projectedGuests > VENUE_COMBINED_CAPACITY) {
    throw new Error(
      `Combined guest count (${projectedGuests}) across both halls on ${eventDate} ` +
      `would exceed the venue-wide cap of ${VENUE_COMBINED_CAPACITY} seats. ` +
      `${existingGuests} seats already committed for this date.`
    );
  }

  const bookingResult = await query(
    `INSERT INTO bookings
       (user_id, event_date, event_start_time, event_end_time, event_type,
        guest_count, status, base_amount, addon_amount, discount_amount,
        tax_amount, total_amount, special_requests)
     VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8, $9, $10, $11, $12)
     RETURNING booking_id, booking_ref, status, total_amount`,
    [
      userId, eventDate, startTime, endTime, eventType,
      guestCount, pricing.baseAmount, pricing.addonAmount,
      pricing.discountAmount, pricing.taxAmount, pricing.totalAmount,
      specialRequests,
    ]
  );
  const booking = bookingResult.rows[0];

  try {
    const hallBookingResult = await query(
      `INSERT INTO hall_bookings
         (hall_id, booking_id, event_date, event_start_time, event_end_time, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING hall_booking_id`,
      [hallId, booking.booking_id, eventDate, startTime, endTime]
    );

    return {
      bookingId:      booking.booking_id,
      bookingRef:     booking.booking_ref,
      hallBookingId:  hallBookingResult.rows[0].hall_booking_id,
      hallId,
      hallName:       hall.hall_name,
      status:         booking.status,
      eventType:      pricing.eventType,
      guestCount,
      pricing,
    };
  } catch (err) {
    try {
      await query(`DELETE FROM bookings WHERE booking_id = $1`, [booking.booking_id]);
    } catch (cleanupErr) {
      console.error(
        `CRITICAL: orphaned bookings row ${booking.booking_id} could not be cleaned up after hall_bookings insert failed.`,
        cleanupErr
      );
    }

    if (err.code === '23P01' || err.message?.includes('hall_bookings_no_overlap')) {
      throw new Error(
        `${hall.hall_name} was booked by another request for this slot just now. Please choose a different time or hall.`
      );
    }
    throw err;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  getBookingById
// ─────────────────────────────────────────────────────────────────────────────
const getBookingById = async (bookingId) => {
  const result = await query(
    `SELECT
        b.booking_id, b.booking_ref, b.user_id, b.event_date,
        b.event_start_time, b.event_end_time, b.event_type, b.guest_count,
        b.status, b.base_amount, b.addon_amount, b.discount_amount,
        b.tax_amount, b.total_amount, b.special_requests, b.created_at,
        hb.hall_booking_id, hb.hall_id, h.hall_name, h.floor_number
     FROM bookings b
     LEFT JOIN hall_bookings hb ON hb.booking_id = b.booking_id
     LEFT JOIN halls h          ON h.hall_id     = hb.hall_id
     WHERE b.booking_id = $1`,
    [bookingId]
  );

  if (result.rows.length === 0) {
    throw new Error(`Booking ID ${bookingId} not found.`);
  }

  return result.rows[0];
};

// ─────────────────────────────────────────────────────────────────────────────
//  listBookings
//  Staff/admin view — filterable, paginated list joining bookings +
//  hall_bookings + halls + users. Two separate query() calls (list +
//  count) since this is read-only; no atomicity concern here.
//
//  NOTE: users.full_name is the real column (confirmed via
//  information_schema) — aliased here to customer_name so the frontend
//  gets a stable field name regardless of what the users table itself
//  calls it.
// ─────────────────────────────────────────────────────────────────────────────
const listBookings = async ({ status, hallId, dateFrom, dateTo, customerId, limit = 20, offset = 0 }) => {
  const rowsResult = await query(
    `
    SELECT
      b.booking_id, b.booking_ref, b.event_date, b.event_start_time,
      b.event_end_time, b.event_type, b.guest_count, b.status,
      b.total_amount, b.special_requests, b.created_at,
      u.user_id AS customer_id, u.full_name AS customer_name,
      u.email   AS customer_email, u.phone AS customer_phone,
      hb.hall_booking_id, h.hall_id, h.hall_name
    FROM bookings b
    JOIN users u          ON u.user_id = b.user_id
    JOIN hall_bookings hb ON hb.booking_id = b.booking_id
    JOIN halls h          ON h.hall_id = hb.hall_id
    WHERE ($1::booking_status IS NULL OR b.status = $1::booking_status)
      AND ($2::integer IS NULL OR h.hall_id = $2::integer)
      AND ($3::date IS NULL OR b.event_date >= $3::date)
      AND ($4::date IS NULL OR b.event_date <= $4::date)
      AND ($7::integer IS NULL OR u.user_id = $7::integer)
    ORDER BY b.event_date DESC, b.created_at DESC
    LIMIT $5::integer OFFSET $6::integer
    `,
    [status || null, hallId || null, dateFrom || null, dateTo || null, limit, offset, customerId || null]
  );

  const countResult = await query(
    `
    SELECT COUNT(*)::integer AS total
    FROM bookings b
    JOIN hall_bookings hb ON hb.booking_id = b.booking_id
    WHERE ($1::booking_status IS NULL OR b.status = $1::booking_status)
      AND ($2::integer IS NULL OR hb.hall_id = $2::integer)
      AND ($3::date IS NULL OR b.event_date >= $3::date)
      AND ($4::date IS NULL OR b.event_date <= $4::date)
      AND ($5::integer IS NULL OR b.user_id = $5::integer)
    `,
    [status || null, hallId || null, dateFrom || null, dateTo || null, customerId || null]
  );

  return {
    bookings: rowsResult.rows,
    total:    countResult.rows[0].total,
    limit,
    offset,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
//  updateBookingStatus
//  Single statement, single query() call — updates bookings and
//  hall_bookings together via a data-modifying CTE.
// ─────────────────────────────────────────────────────────────────────────────
const updateBookingStatus = async (bookingId, { status, staffId, cancelReason }) => {
  const result = await query(
    `
    WITH updated_booking AS (
      UPDATE bookings
      SET
        status        = $1::booking_status,
        confirmed_by  = CASE WHEN $1 = 'confirmed' THEN $2::integer ELSE confirmed_by END,
        confirmed_at  = CASE WHEN $1 = 'confirmed' THEN NOW() ELSE confirmed_at END,
        cancelled_at  = CASE WHEN $1 = 'cancelled' THEN NOW() ELSE cancelled_at END,
        cancel_reason = CASE WHEN $1 = 'cancelled' THEN $3::text ELSE cancel_reason END,
        updated_at    = NOW()
      WHERE booking_id = $4::integer
      RETURNING *
    )
    UPDATE hall_bookings hb
    SET
      status     = $1::booking_status,
      updated_at = NOW()
    FROM updated_booking ub
    WHERE hb.booking_id = ub.booking_id
    RETURNING ub.*, hb.hall_id, hb.hall_booking_id
    `,
    [status, staffId || null, cancelReason || null, bookingId]
  );

  if (result.rows.length === 0) {
    throw new Error(`Booking ID ${bookingId} not found.`);
  }

  return result.rows[0];
};

// ─────────────────────────────────────────────────────────────────────────────
//  getUpcomingConfirmedBookingsPublic
//  Sponsor-facing "Browse Events" — no PII (no customer name/email/phone),
//  confirmed bookings only, future dates only.
// ─────────────────────────────────────────────────────────────────────────────
const getUpcomingConfirmedBookingsPublic = async () => {
  const result = await query(
    `SELECT
        b.booking_id, b.event_type, b.event_date, b.guest_count,
        h.hall_id, h.hall_name
     FROM bookings b
     JOIN hall_bookings hb ON hb.booking_id = b.booking_id
     JOIN halls h          ON h.hall_id = hb.hall_id
     WHERE b.status = 'confirmed'
       AND b.event_date >= CURRENT_DATE
     ORDER BY b.event_date ASC`
  );
  return result.rows;
};

module.exports = {
  createBooking,
  getBookingById,
  listBookings,
  updateBookingStatus,
  getUpcomingConfirmedBookingsPublic,
  VENUE_COMBINED_CAPACITY,
};
