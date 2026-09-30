// ─────────────────────────────────────────────────────────────────────────────
//  src/services/booking.service.js
//  Orchestrates booking creation: pricing (pricing.service.js) + hall
//  assignment/conflict check into a persisted booking.
//
//  No client-side transactions: config/db.js uses Neon's stateless HTTP driver,
//  so every query() is its own request. Correctness relies on DB constraints
//  (trg_hall_bookings_capacity_cap, idx_no_double_booking) plus explicit
//  cleanup of the bookings row if the hall_bookings insert fails. Deleting the
//  bookings row cascades to its hall_bookings rows.
//
//  migration_004 — two halls:
//  An event of 601–1200 guests uses BOTH halls. hall_bookings then holds two
//  rows for one booking: the primary hall (is_complimentary = false) and the
//  other hall (is_complimentary = true, free of charge). Because both rows
//  exist, every per-hall conflict query blocks both halls automatically.
//  Queries that must see ONE row per booking filter is_complimentary = false.
//
//  migration_004 — custom event type:
//  bookings.event_type has an FK to event_pricing, so a typed-in event is stored
//  as event_type = 'Other' with the customer's wording in custom_event_type.
// ─────────────────────────────────────────────────────────────────────────────
const { query } = require("../config/db");
const { calculateBookingTotal } = require("./pricing.service");

const VENUE_COMBINED_CAPACITY = 1200;
const BUFFER_MINUTES = 60;
const ACTIVE_STATUSES = ["pending", "confirmed"];
const OTHER_EVENT_TYPE = "Other";
const MAX_CUSTOM_EVENT_TYPE_LENGTH = 100;

// ─────────────────────────────────────────────────────────────────────────────
//  createBooking
// ─────────────────────────────────────────────────────────────────────────────
const createBooking = async ({
  userId,
  hallId,
  useBothHalls = false,
  eventDate,
  startTime,
  endTime,
  eventType,
  customEventType = null,
  guestCount,
  roomCount = 0,
  extraAddons = 0,
  discountAmount = 0,
  taxAmount = 0,
  specialRequests = null,
}) => {
  if (!userId) throw new Error("userId is required.");
  if (!hallId) throw new Error("hallId is required.");
  if (!eventDate) throw new Error("eventDate is required.");
  if (!startTime || !endTime)
    throw new Error("startTime and endTime are required.");
  if (!eventType) throw new Error("eventType is required.");
  if (!guestCount || guestCount < 1)
    throw new Error("guestCount must be at least 1.");

  // Custom (typed) event type
  let customType = null;
  if (eventType === OTHER_EVENT_TYPE) {
    customType = String(customEventType || "").trim();
    if (!customType) throw new Error("Please type your event type.");
    if (customType.length > MAX_CUSTOM_EVENT_TYPE_LENGTH) {
      throw new Error(
        `Event type must be ${MAX_CUSTOM_EVENT_TYPE_LENGTH} characters or fewer.`
      );
    }
  }

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

  // Capacity: one hall, or both halls (second hall free) for larger events
  let secondHall = null;
  if (useBothHalls) {
    if (guestCount <= hall.capacity) {
      throw new Error(
        `${hall.hall_name} already seats ${guestCount} guests. Using both halls is only for events above ${hall.capacity} guests.`
      );
    }
    const othersResult = await query(
      `SELECT hall_id, hall_name, capacity
         FROM halls
        WHERE is_active = true AND hall_id <> $1
        ORDER BY floor_number, hall_name`,
      [hallId]
    );
    if (othersResult.rows.length !== 1) {
      throw new Error(
        "Booking both halls needs exactly one other active hall."
      );
    }
    secondHall = othersResult.rows[0];
    const combinedCapacity = hall.capacity + secondHall.capacity;
    if (guestCount > combinedCapacity) {
      throw new Error(
        `Guest count (${guestCount}) exceeds the combined capacity of both halls (${combinedCapacity} seats).`
      );
    }
  } else if (guestCount > hall.capacity) {
    throw new Error(
      `Guest count (${guestCount}) exceeds ${hall.hall_name}'s capacity of ${hall.capacity} seats. Choose both halls for larger events.`
    );
  }

  // Time-slot conflict on every hall this booking will occupy
  for (const h of [hall, secondHall].filter(Boolean)) {
    const conflictResult = await query(
      `SELECT hall_booking_id
         FROM hall_bookings
        WHERE hall_id    = $1
          AND event_date = $2
          AND status     = ANY($3)
          AND event_start_time - INTERVAL '${BUFFER_MINUTES} minutes' < $4::time
          AND event_end_time   + INTERVAL '${BUFFER_MINUTES} minutes' > $5::time`,
      [h.hall_id, eventDate, ACTIVE_STATUSES, endTime, startTime]
    );
    if (conflictResult.rows.length > 0) {
      throw new Error(
        `${h.hall_name} is no longer available for the requested slot on ${eventDate}.`
      );
    }
  }

  // Venue-wide cap: count each booking's guests once (skip the free-hall rows)
  const combinedResult = await query(
    `SELECT COALESCE(SUM(b.guest_count), 0) AS total_guests
       FROM hall_bookings hb
       JOIN bookings b ON b.booking_id = hb.booking_id
      WHERE hb.event_date = $1
        AND hb.status     = ANY($2)
        AND NOT hb.is_complimentary`,
    [eventDate, ACTIVE_STATUSES]
  );
  const existingGuests = parseInt(combinedResult.rows[0].total_guests, 10);
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
        custom_event_type, guest_count, status, base_amount, addon_amount,
        discount_amount, tax_amount, total_amount, special_requests, room_count)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8, $9, $10, $11, $12, $13, $14)
     RETURNING booking_id, booking_ref, status, total_amount`,
    [
      userId,
      eventDate,
      startTime,
      endTime,
      eventType,
      customType,
      guestCount,
      pricing.baseAmount,
      pricing.addonAmount,
      pricing.discountAmount,
      pricing.taxAmount,
      pricing.totalAmount,
      specialRequests,
      pricing.roomCount,
    ]
  );
  const booking = bookingResult.rows[0];

  try {
    const hallBookingResult = await query(
      `INSERT INTO hall_bookings
         (hall_id, booking_id, event_date, event_start_time, event_end_time,
          status, is_complimentary)
       VALUES ($1, $2, $3, $4, $5, 'pending', false)
       RETURNING hall_booking_id`,
      [hallId, booking.booking_id, eventDate, startTime, endTime]
    );

    if (secondHall) {
      await query(
        `INSERT INTO hall_bookings
           (hall_id, booking_id, event_date, event_start_time, event_end_time,
            status, is_complimentary)
         VALUES ($1, $2, $3, $4, $5, 'pending', true)`,
        [secondHall.hall_id, booking.booking_id, eventDate, startTime, endTime]
      );
    }

    return {
      bookingId: booking.booking_id,
      bookingRef: booking.booking_ref,
      hallBookingId: hallBookingResult.rows[0].hall_booking_id,
      hallId,
      hallName: secondHall
        ? `${hall.hall_name} + ${secondHall.hall_name}`
        : hall.hall_name,
      secondHall: secondHall
        ? { hallId: secondHall.hall_id, hallName: secondHall.hall_name }
        : null,
      status: booking.status,
      eventType: pricing.eventType,
      customEventType: customType,
      guestCount,
      pricing,
    };
  } catch (err) {
    try {
      await query(`DELETE FROM bookings WHERE booking_id = $1`, [
        booking.booking_id,
      ]);
    } catch (cleanupErr) {
      console.error(
        `CRITICAL: orphaned bookings row ${booking.booking_id} could not be cleaned up after hall_bookings insert failed.`,
        cleanupErr
      );
    }

    if (
      err.code === "23P01" ||
      err.message?.includes("hall_bookings_no_overlap")
    ) {
      throw new Error(
        `${hall.hall_name} was booked by another request for this slot just now. Please choose a different time or hall.`
      );
    }
    throw err;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  getBookingById
//  hall_id / hall_name = the primary hall; second_hall_name is set only for
//  two-hall bookings. event_type_label shows the customer's own wording for
//  'Other' events.
// ─────────────────────────────────────────────────────────────────────────────
const getBookingById = async (bookingId) => {
  const result = await query(
    `SELECT
        b.booking_id, b.booking_ref, b.user_id, b.event_date,
        b.event_start_time, b.event_end_time, b.event_type, b.custom_event_type,
        COALESCE(b.custom_event_type, b.event_type) AS event_type_label,
        b.guest_count,
        b.status, b.base_amount, b.addon_amount, b.discount_amount,
        b.tax_amount, b.total_amount, b.special_requests, b.created_at, b.room_count,
        hb.hall_booking_id, hb.hall_id, h.hall_name, h.floor_number,
        (SELECT h2.hall_name
           FROM hall_bookings hb2
           JOIN halls h2 ON h2.hall_id = hb2.hall_id
          WHERE hb2.booking_id = b.booking_id AND hb2.is_complimentary) AS second_hall_name
     FROM bookings b
     LEFT JOIN hall_bookings hb ON hb.booking_id = b.booking_id AND NOT hb.is_complimentary
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
// ─────────────────────────────────────────────────────────────────────────────
const listBookings = async ({
  status,
  hallId,
  dateFrom,
  dateTo,
  customerId,
  limit = 20,
  offset = 0,
}) => {
  const rowsResult = await query(
    `
    SELECT
      b.booking_id, b.booking_ref, b.event_date, b.event_start_time,
      b.event_end_time, b.event_type, b.custom_event_type,
      COALESCE(b.custom_event_type, b.event_type) AS event_type_label,
      b.guest_count, b.status,
      b.total_amount, b.special_requests, b.created_at, b.room_count,
      u.user_id AS customer_id, u.full_name AS customer_name,
      u.email   AS customer_email, u.phone AS customer_phone,
      hb.hall_booking_id, h.hall_id, h.hall_name,
      (SELECT h2.hall_name
         FROM hall_bookings hb2
         JOIN halls h2 ON h2.hall_id = hb2.hall_id
        WHERE hb2.booking_id = b.booking_id AND hb2.is_complimentary) AS second_hall_name
    FROM bookings b
    JOIN users u          ON u.user_id = b.user_id
    JOIN hall_bookings hb ON hb.booking_id = b.booking_id AND NOT hb.is_complimentary
    JOIN halls h          ON h.hall_id = hb.hall_id
    WHERE ($1::booking_status IS NULL OR b.status = $1::booking_status)
      AND ($2::integer IS NULL OR h.hall_id = $2::integer)
      AND ($3::date IS NULL OR b.event_date >= $3::date)
      AND ($4::date IS NULL OR b.event_date <= $4::date)
      AND ($7::integer IS NULL OR u.user_id = $7::integer)
    ORDER BY b.event_date DESC, b.created_at DESC
    LIMIT $5::integer OFFSET $6::integer
    `,
    [
      status || null,
      hallId || null,
      dateFrom || null,
      dateTo || null,
      limit,
      offset,
      customerId || null,
    ]
  );

  const countResult = await query(
    `
    SELECT COUNT(*)::integer AS total
    FROM bookings b
    JOIN hall_bookings hb ON hb.booking_id = b.booking_id AND NOT hb.is_complimentary
    WHERE ($1::booking_status IS NULL OR b.status = $1::booking_status)
      AND ($2::integer IS NULL OR hb.hall_id = $2::integer)
      AND ($3::date IS NULL OR b.event_date >= $3::date)
      AND ($4::date IS NULL OR b.event_date <= $4::date)
      AND ($5::integer IS NULL OR b.user_id = $5::integer)
    `,
    [
      status || null,
      hallId || null,
      dateFrom || null,
      dateTo || null,
      customerId || null,
    ]
  );

  return {
    bookings: rowsResult.rows,
    total: countResult.rows[0].total,
    limit,
    offset,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
//  updateBookingStatus
//  One statement: updates bookings and ALL of its hall_bookings rows (both
//  halls for a two-hall booking), then returns a single row with the primary
//  hall's ids so callers see the same shape as before.
// ─────────────────────────────────────────────────────────────────────────────
const updateBookingStatus = async (
  bookingId,
  { status, staffId, cancelReason }
) => {
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
    ),
    updated_halls AS (
      UPDATE hall_bookings hb
      SET
        status     = $1::booking_status,
        updated_at = NOW()
      FROM updated_booking ub
      WHERE hb.booking_id = ub.booking_id
      RETURNING hb.booking_id, hb.hall_id, hb.hall_booking_id, hb.is_complimentary
    )
    SELECT ub.*, uh.hall_id, uh.hall_booking_id
      FROM updated_booking ub
      JOIN updated_halls uh ON uh.booking_id = ub.booking_id
     ORDER BY uh.is_complimentary ASC
     LIMIT 1
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
//  Sponsor-facing "Browse Events" — no PII, confirmed + future only.
// ─────────────────────────────────────────────────────────────────────────────
const getUpcomingConfirmedBookingsPublic = async () => {
  const result = await query(
    `SELECT
        b.booking_id,
        COALESCE(b.custom_event_type, b.event_type) AS event_type,
        b.event_date, b.guest_count,
        h.hall_id, h.hall_name
     FROM bookings b
     JOIN hall_bookings hb ON hb.booking_id = b.booking_id AND NOT hb.is_complimentary
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
  OTHER_EVENT_TYPE,
};
