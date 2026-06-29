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
// ─────────────────────────────────────────────────────────────────────────────
const { query } = require('../config/db');
const { calculateBookingTotal } = require('./pricing.service');

const VENUE_COMBINED_CAPACITY = 1200;
const BUFFER_MINUTES = 60;
const ACTIVE_STATUSES = ['pending', 'confirmed'];

// ─────────────────────────────────────────────────────────────────────────────
//  createBooking
//  Single entry point for "customer wants to book a hall."
//
//  Params:
//    userId        - the customer placing the booking (req.user.id /
//                     req.user.user_id — confirm against your actual
//                     auth.middleware.js, see note in controller)
//    hallId        - which hall (1 or 2)
//    eventDate     - 'YYYY-MM-DD'
//    startTime/endTime - 'HH:MM' or 'HH:MM:SS'
//    eventType     - must match a row in event_pricing
//    guestCount    - integer
//    roomCount, extraAddons, discountAmount, taxAmount - pricing inputs,
//                     see pricing.service.js
//    specialRequests - optional free text
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

  // ── 1. Price the booking first. ────────────────────────────────────
  // Validates eventType against event_pricing and throws a clear error
  // if unknown/inactive — fail fast before touching any table.
  const pricing = await calculateBookingTotal({
    eventType,
    roomCount,
    extraAddons,
    discountAmount,
    taxAmount,
  });

  // ── 2. Confirm hall exists, is active, fetch capacity. ─────────────
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

  // ── 3. Application-level pre-checks (fast, friendly error messages). ──
  // These are NOT the source of truth — they exist so a normal booking
  // attempt gets a clear 4xx instead of a raw Postgres constraint error.
  // The DB constraints hit in step 5 are what actually guarantee
  // correctness under concurrent requests.
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

  // ── 4. Insert the booking row FIRST — forced by the FK: ─────────────
  // hall_bookings.booking_id is NOT NULL UNIQUE REFERENCES bookings, so
  // a bookings row must exist before hall_bookings can reference it.
  //
  // booking_ref is intentionally omitted — it has a DB-level DEFAULT
  // (AP-YYYYMMDD-NNNN via nextval) defined in ems_database_schema.sql.
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

  // ── 5. Insert hall_bookings. THIS is where conflict/capacity are ───
  //      actually, atomically enforced by the DB:
  //        - hall_bookings_no_overlap (EXCLUDE USING gist) on overlap
  //        - trg_hall_bookings_capacity_cap (trigger) on >1200 combined
  //      If either fires, catch it below and clean up the now-orphaned
  //      bookings row from step 4.
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
    // hall_bookings insert failed — most likely a concurrent request
    // won the race past the application-level checks in step 3, and the
    // DB exclusion constraint or capacity trigger caught it for real.
    // Without a transaction, the bookings row from step 4 is now
    // orphaned: delete it explicitly so it doesn't sit as a phantom
    // 'pending' booking with no hall assigned.
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
//  Fetch a single booking with its hall assignment + pricing, for
//  confirmation screens / receipts.
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

module.exports = {
  createBooking,
  getBookingById,
  VENUE_COMBINED_CAPACITY,
};
