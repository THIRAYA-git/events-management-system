// ─────────────────────────────────────────────────────────────────────────────
//  src/services/hall.availability.service.js
//  Rewritten for raw Neon SQL (@neondatabase/serverless)
//  Uses { query } from config/db.js  →  query(text, params) → { rows }
// ─────────────────────────────────────────────────────────────────────────────
const { query } = require("../config/db");

// ── Constants ─────────────────────────────────────────────────────────────────
const BUFFER_MINUTES = 60;
const OPEN_TIME = "08:00:00";
const CLOSE_TIME = "22:00:00";
const ACTIVE_STATUSES = ["pending", "confirmed"];

// ─────────────────────────────────────────────────────────────────────────────
//  1. checkAvailability
//  Is a specific hall free for the requested date + time slot?
// ─────────────────────────────────────────────────────────────────────────────
const checkAvailability = async ({
  hallId,
  eventDate,
  startTime,
  endTime,
  excludeHallBookingId = null,
}) => {
  if (startTime >= endTime)
    throw new Error("start_time must be before end_time.");
  if (startTime < OPEN_TIME)
    throw new Error(`Events cannot start before ${OPEN_TIME}.`);
  if (endTime > CLOSE_TIME)
    throw new Error(`Events must end by ${CLOSE_TIME}.`);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (new Date(eventDate) < today)
    throw new Error("Cannot check availability for a past date.");

  // Confirm hall exists and is active
  const hallResult = await query(
    `SELECT hall_id, hall_name, floor_number, capacity, base_price
       FROM halls
      WHERE hall_id = $1 AND is_active = true`,
    [hallId]
  );

  if (hallResult.rows.length === 0) {
    throw new Error(`Hall with ID ${hallId} not found or is inactive.`);
  }

  const hall = hallResult.rows[0];

  // Find conflicting bookings (with buffer on both sides)
  const excludeClause = excludeHallBookingId
    ? `AND hb.hall_booking_id <> ${parseInt(excludeHallBookingId)}`
    : "";

  const conflictResult = await query(
    `SELECT hb.hall_booking_id,
            hb.booking_id,
            b.booking_ref,
            hb.event_start_time,
            hb.event_end_time,
            hb.status,
            b.event_type
       FROM hall_bookings hb
       JOIN bookings b ON b.booking_id = hb.booking_id
      WHERE hb.hall_id = $1
        AND hb.event_date = $2
        AND hb.status = ANY($3)
        AND hb.event_start_time - INTERVAL '${BUFFER_MINUTES} minutes' < $4::time
        AND hb.event_end_time   + INTERVAL '${BUFFER_MINUTES} minutes' > $5::time
        ${excludeClause}`,
    [hallId, eventDate, ACTIVE_STATUSES, endTime, startTime]
  );

  const isAvailable = conflictResult.rows.length === 0;

  return {
    isAvailable,
    hall: {
      hall_id: hall.hall_id,
      hall_name: hall.hall_name,
      floor_number: hall.floor_number,
      capacity: hall.capacity,
      base_price: parseFloat(hall.base_price),
    },
    requested: { eventDate, startTime, endTime },
    bufferMinutes: BUFFER_MINUTES,
    conflicts: isAvailable
      ? []
      : conflictResult.rows.map((c) => ({
          hall_booking_id: c.hall_booking_id,
          booking_ref: c.booking_ref,
          event_type: c.event_type,
          occupied_from: c.event_start_time,
          occupied_until: c.event_end_time,
          blocked_from: subtractMinutes(c.event_start_time, BUFFER_MINUTES),
          blocked_until: addMinutes(c.event_end_time, BUFFER_MINUTES),
          status: c.status,
        })),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
//  2. getAvailableHalls   (REPLACE the whole existing function with this one)
//  Return all halls that are free for a given date + time slot.
//
//  migration_004: when the guest count is larger than any single hall but fits
//  both halls together (601–1200), the response also carries `bothHalls`, the
//  two-hall option (second hall complimentary). Capacity is no longer filtered
//  in SQL — it is needed to detect that case — but halls too small for the
//  guest count are still left out of `available`, exactly as before.
// ─────────────────────────────────────────────────────────────────────────────
const getAvailableHalls = async ({
  eventDate,
  startTime,
  endTime,
  floorNumber = null,
  guestCount = null,
}) => {
  if (startTime >= endTime)
    throw new Error("start_time must be before end_time.");
  if (startTime < OPEN_TIME || endTime > CLOSE_TIME) {
    throw new Error(`Events must be between ${OPEN_TIME} and ${CLOSE_TIME}.`);
  }

  const hallParams = [];
  const hallFilters = ["is_active = true"];

  if (floorNumber) {
    hallParams.push(floorNumber);
    hallFilters.push(`floor_number = $${hallParams.length}`);
  }

  const allHallsResult = await query(
    `SELECT hall_id, hall_name, floor_number, capacity,
            base_price, amenities, image_url
       FROM halls
      WHERE ${hallFilters.join(" AND ")}
      ORDER BY floor_number, hall_name`,
    hallParams
  );

  if (allHallsResult.rows.length === 0) {
    return {
      eventDate,
      startTime,
      endTime,
      available: [],
      unavailable: [],
      bothHalls: null,
    };
  }

  const bookedResult = await query(
    `SELECT DISTINCT hall_id
       FROM hall_bookings
      WHERE event_date = $1
        AND status = ANY($2)
        AND event_start_time - INTERVAL '${BUFFER_MINUTES} minutes' < $3::time
        AND event_end_time   + INTERVAL '${BUFFER_MINUTES} minutes' > $4::time`,
    [eventDate, ACTIVE_STATUSES, endTime, startTime]
  );

  const bookedSet = new Set(bookedResult.rows.map((r) => r.hall_id));

  const toEntry = (hall) => ({
    hall_id: hall.hall_id,
    hall_name: hall.hall_name,
    floor_number: hall.floor_number,
    capacity: hall.capacity,
    base_price: parseFloat(hall.base_price),
    amenities: hall.amenities ? JSON.parse(hall.amenities) : [],
    image_url: hall.image_url,
  });

  const available = [];
  const unavailable = [];

  for (const hall of allHallsResult.rows) {
    if (guestCount && hall.capacity < guestCount) continue; // too small on its own

    if (bookedSet.has(hall.hall_id)) {
      unavailable.push(toEntry(hall));
    } else {
      available.push(toEntry(hall));
    }
  }

  // Two-hall option: needs the venue's two halls, both free, and a guest count
  // that no single hall can hold but the pair can.
  let bothHalls = null;
  const halls = allHallsResult.rows;
  if (guestCount && !floorNumber && halls.length === 2) {
    const maxSingle = Math.max(...halls.map((h) => h.capacity));
    const combined = halls[0].capacity + halls[1].capacity;
    const bothFree = halls.every((h) => !bookedSet.has(h.hall_id));

    if (guestCount > maxSingle && guestCount <= combined && bothFree) {
      bothHalls = {
        primary: toEntry(halls[0]),
        secondary: toEntry(halls[1]),
        combined_capacity: combined,
        second_hall_complimentary: true,
      };
    }
  }

  return {
    eventDate,
    startTime,
    endTime,
    bufferMinutes: BUFFER_MINUTES,
    totalAvailable: available.length,
    totalUnavailable: unavailable.length,
    available,
    unavailable,
    bothHalls,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
//  3. getHallSchedule
//  Full day schedule for a hall — booked slots + computed free slots.
// ─────────────────────────────────────────────────────────────────────────────
const getHallSchedule = async ({ hallId, eventDate }) => {
  const hallResult = await query(
    `SELECT hall_id, hall_name, floor_number, capacity
       FROM halls WHERE hall_id = $1`,
    [hallId]
  );

  if (hallResult.rows.length === 0) {
    throw new Error(`Hall with ID ${hallId} not found.`);
  }

  const hall = hallResult.rows[0];

  const bookingsResult = await query(
    `SELECT hb.hall_booking_id,
            b.booking_ref,
            b.event_type,
            b.guest_count,
            hb.event_start_time,
            hb.event_end_time,
            hb.status,
            u.full_name AS customer_name
       FROM hall_bookings hb
       JOIN bookings b ON b.booking_id = hb.booking_id
       JOIN users    u ON u.user_id    = b.user_id
      WHERE hb.hall_id    = $1
        AND hb.event_date = $2
      ORDER BY hb.event_start_time`,
    [hallId, eventDate]
  );

  const activeBookings = bookingsResult.rows.filter((b) =>
    ACTIVE_STATUSES.includes(b.status)
  );

  const freeSlots = computeFreeSlots(
    activeBookings,
    OPEN_TIME,
    CLOSE_TIME,
    BUFFER_MINUTES
  );

  return {
    hall: {
      hall_id: hall.hall_id,
      hall_name: hall.hall_name,
      floor_number: hall.floor_number,
      capacity: hall.capacity,
    },
    eventDate,
    operatingHours: { open: OPEN_TIME, close: CLOSE_TIME },
    bookings: bookingsResult.rows,
    freeSlots,
    summary: {
      totalBookings: bookingsResult.rows.length,
      activeBookings: activeBookings.length,
      freeSlotCount: freeSlots.length,
    },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
//  4. assignHallToBooking
//  Atomically check conflict, capacity, and combined-cap, then insert.
// ─────────────────────────────────────────────────────────────────────────────
const VENUE_COMBINED_CAPACITY = 1200;

const assignHallToBooking = async ({
  hallId,
  bookingId,
  eventDate,
  startTime,
  endTime,
  assignedBy = null,
  notes = null,
}) => {
  // Confirm the hall exists, is active, and fetch its capacity
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

  // Confirm the booking exists and fetch its guest_count
  const bookingCheck = await query(
    `SELECT booking_id, guest_count FROM bookings WHERE booking_id = $1`,
    [bookingId]
  );

  if (bookingCheck.rows.length === 0) {
    throw new Error(`Booking ID ${bookingId} not found.`);
  }
  const booking = bookingCheck.rows[0];

  // Guest count must fit inside the chosen hall's own capacity
  if (booking.guest_count > hall.capacity) {
    throw new Error(
      `Guest count (${booking.guest_count}) exceeds ${hall.hall_name}'s capacity ` +
        `of ${hall.capacity} seats. Choose the other hall or reduce guest_count.`
    );
  }

  // Check for time-slot conflicts on this hall
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
      `Hall is no longer available for the requested slot. ` +
        `${conflictResult.rows.length} conflicting booking(s) found.`
    );
  }

  // Combined guest count across BOTH halls for this date must not exceed
  // the venue-wide 1,200-seat cap (defense in depth — the DB trigger
  // check_combined_hall_capacity() also enforces this as a last resort).
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
  const projectedGuests = existingGuests + booking.guest_count;

  if (projectedGuests > VENUE_COMBINED_CAPACITY) {
    throw new Error(
      `Combined guest count (${projectedGuests}) across both halls on ${eventDate} ` +
        `would exceed the venue-wide cap of ${VENUE_COMBINED_CAPACITY} seats. ` +
        `${existingGuests} seats already committed for this date.`
    );
  }

  // Insert the hall booking
  const insertResult = await query(
    `INSERT INTO hall_bookings
       (hall_id, booking_id, event_date, event_start_time, event_end_time,
        status, assigned_by, notes)
     VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7)
     RETURNING *`,
    [hallId, bookingId, eventDate, startTime, endTime, assignedBy, notes]
  );

  return insertResult.rows[0];
};

// ─────────────────────────────────────────────────────────────────────────────
//  5. releaseHallBooking
//  Soft-cancel: set status = 'cancelled'. Never hard-deletes.
// ─────────────────────────────────────────────────────────────────────────────
const releaseHallBooking = async ({ hallBookingId, cancelledBy = null }) => {
  const existing = await query(
    `SELECT hall_booking_id, status FROM hall_bookings WHERE hall_booking_id = $1`,
    [hallBookingId]
  );

  if (existing.rows.length === 0) {
    throw new Error(`Hall booking ID ${hallBookingId} not found.`);
  }
  if (existing.rows[0].status === "cancelled") {
    throw new Error("Hall booking is already cancelled.");
  }

  const updated = await query(
    `UPDATE hall_bookings
        SET status = 'cancelled',
            notes = CASE
                      WHEN $2::int IS NULL THEN notes
                      ELSE COALESCE(notes || ' | ', '') || 'Cancelled by user_id ' || $2::int
                    END,
            updated_at = NOW()
      WHERE hall_booking_id = $1
      RETURNING *`,
    [hallBookingId, cancelledBy]
  );

  return updated.rows[0];
};

// ─────────────────────────────────────────────────────────────────────────────
//  Internal time helpers (pure JS — no DB calls)
// ─────────────────────────────────────────────────────────────────────────────
const timeToMinutes = (t) => {
  const [h, m] = t.toString().split(":").map(Number);
  return h * 60 + m;
};

const minutesToTime = (mins) => {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}:00`;
};

const addMinutes = (t, m) => minutesToTime(timeToMinutes(t) + m);
const subtractMinutes = (t, m) =>
  minutesToTime(Math.max(0, timeToMinutes(t) - m));
const timeDiff = (from, to) => timeToMinutes(to) - timeToMinutes(from);

const computeFreeSlots = (activeBookings, open, close, buffer) => {
  if (activeBookings.length === 0) {
    return [
      { from: open, until: close, durationMinutes: timeDiff(open, close) },
    ];
  }

  const slots = [];
  let cursor = open;

  for (const booking of activeBookings) {
    const blockStart = subtractMinutes(booking.event_start_time, buffer);
    if (timeToMinutes(cursor) < timeToMinutes(blockStart)) {
      const duration = timeDiff(cursor, blockStart);
      if (duration >= 60)
        slots.push({
          from: cursor,
          until: blockStart,
          durationMinutes: duration,
        });
    }
    cursor = addMinutes(booking.event_end_time, buffer);
  }

  if (timeToMinutes(cursor) < timeToMinutes(close)) {
    const duration = timeDiff(cursor, close);
    if (duration >= 60)
      slots.push({ from: cursor, until: close, durationMinutes: duration });
  }

  return slots;
};

module.exports = {
  checkAvailability,
  getAvailableHalls,
  getHallSchedule,
  assignHallToBooking,
  releaseHallBooking,
  BUFFER_MINUTES,
  OPEN_TIME,
  CLOSE_TIME,
  VENUE_COMBINED_CAPACITY,
};
