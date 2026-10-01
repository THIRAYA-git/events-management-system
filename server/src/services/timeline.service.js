// ─────────────────────────────────────────────────────────────────────────────
//  src/services/timeline.service.js
// ─────────────────────────────────────────────────────────────────────────────
const { query } = require('../config/db');

const CATEGORIES = ['setup', 'catering', 'decoration', 'cleanup', 'other'];
const TIME_RE = /^\d{2}:\d{2}(:\d{2})?$/;

const httpError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const hhmm = (t) => String(t).slice(0, 5);

// ── Validation helpers ──────────────────────────────────────────────────────
const assertValidTimes = (startTime, endTime) => {
  if (!TIME_RE.test(String(startTime)) || !TIME_RE.test(String(endTime))) {
    throw httpError('startTime and endTime must be in HH:MM format.', 400);
  }
  if (hhmm(startTime) >= hhmm(endTime)) {
    throw httpError('startTime must be before endTime.', 400);
  }
};

const assertValidCategory = (category) => {
  if (!CATEGORIES.includes(category)) {
    throw httpError(`category must be one of: ${CATEGORIES.join(', ')}.`, 400);
  }
};

const normaliseHallId = (hallId) => {
  if (hallId === null || hallId === undefined || hallId === '') return null;
  const n = Number(hallId);
  if (!Number.isInteger(n) || n <= 0) throw httpError('hallId is invalid.', 400);
  return n;
};

const assertHallInBooking = async (bookingId, hallId) => {
  const result = await query(
    `SELECT 1 FROM hall_bookings WHERE booking_id = $1 AND hall_id = $2`,
    [bookingId, hallId]
  );
  if (result.rows.length === 0) {
    throw httpError('Selected hall is not part of this booking.', 400);
  }
};

// ── Lookups ─────────────────────────────────────────────────────────────────
const getBookingOrThrow = async (bookingId) => {
  const result = await query(
    `SELECT booking_id, user_id FROM bookings WHERE booking_id = $1`,
    [bookingId]
  );
  if (result.rows.length === 0) {
    throw httpError(`Booking ID ${bookingId} not found.`, 404);
  }
  return result.rows[0];
};

// event_date is cast to text so a JS Date / timezone shift can't move it a day
const getBookingSummary = async (bookingId) => {
  const bookingResult = await query(
    `SELECT booking_id, booking_ref, event_date::text AS event_date,
            event_start_time, event_end_time, event_type, custom_event_type,
            guest_count, status
       FROM bookings WHERE booking_id = $1`,
    [bookingId]
  );
  if (bookingResult.rows.length === 0) {
    throw httpError(`Booking ID ${bookingId} not found.`, 404);
  }

  const hallsResult = await query(
    `SELECT h.hall_id, h.hall_name, hb.is_complimentary
       FROM hall_bookings hb
       JOIN halls h ON h.hall_id = hb.hall_id
      WHERE hb.booking_id = $1
      ORDER BY hb.is_complimentary, h.hall_id`,
    [bookingId]
  );

  return { ...bookingResult.rows[0], halls: hallsResult.rows };
};

const ACTIVITY_SELECT = `
  SELECT t.timeline_id, t.booking_id, t.activity_name, t.category, t.hall_id,
         h.hall_name, t.start_time, t.end_time, t.assigned_to, t.notes,
         t.sequence_order, t.created_at
    FROM event_timelines t
    LEFT JOIN halls h ON h.hall_id = t.hall_id`;

const getActivity = async (timelineId, bookingId) => {
  const result = await query(
    `${ACTIVITY_SELECT} WHERE t.timeline_id = $1 AND t.booking_id = $2`,
    [timelineId, bookingId]
  );
  return result.rows[0] || null;
};

// ── List: booking context + activities in chronological order ───────────────
const listTimelineForBooking = async (bookingId) => {
  const booking = await getBookingSummary(bookingId);
  const result = await query(
    `${ACTIVITY_SELECT}
      WHERE t.booking_id = $1
      ORDER BY t.start_time, t.sequence_order, t.timeline_id`,
    [bookingId]
  );
  return { booking, activities: result.rows };
};

// ── Create ──────────────────────────────────────────────────────────────────
const createTimelineActivity = async ({
  bookingId,
  activityName,
  category = 'other',
  hallId = null,
  startTime,
  endTime,
  assignedTo = null,
  notes = null,
  sequenceOrder = null,
}) => {
  await getBookingOrThrow(bookingId);

  if (!activityName || !String(activityName).trim()) {
    throw httpError('activityName is required.', 400);
  }
  if (!startTime || !endTime) {
    throw httpError('startTime and endTime are required.', 400);
  }
  assertValidTimes(startTime, endTime);
  assertValidCategory(category);

  const hall = normaliseHallId(hallId);
  if (hall !== null) await assertHallInBooking(bookingId, hall);

  let order = sequenceOrder;
  if (order == null) {
    const maxResult = await query(
      `SELECT COALESCE(MAX(sequence_order), 0) AS max_order
         FROM event_timelines WHERE booking_id = $1`,
      [bookingId]
    );
    order = maxResult.rows[0].max_order + 1;
  }

  const inserted = await query(
    `INSERT INTO event_timelines
       (booking_id, activity_name, category, hall_id, start_time, end_time,
        assigned_to, notes, sequence_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING timeline_id`,
    [
      bookingId,
      String(activityName).trim(),
      category,
      hall,
      startTime,
      endTime,
      assignedTo,
      notes,
      order,
    ]
  );
  return getActivity(inserted.rows[0].timeline_id, bookingId);
};

// ── Partial update (scoped to the booking in the URL) ───────────────────────
const updateTimelineActivity = async (bookingId, timelineId, updates) => {
  const existing = await query(
    `SELECT * FROM event_timelines WHERE timeline_id = $1 AND booking_id = $2`,
    [timelineId, bookingId]
  );
  if (existing.rows.length === 0) {
    throw httpError(`Timeline activity ${timelineId} not found.`, 404);
  }
  const current = existing.rows[0];

  // NOT NULL columns can't be cleared
  for (const key of ['activityName', 'category', 'startTime', 'endTime', 'sequenceOrder']) {
    if (updates[key] === null) throw httpError(`${key} cannot be empty.`, 400);
  }

  const cleaned = { ...updates };

  if (cleaned.activityName !== undefined) {
    if (!String(cleaned.activityName).trim()) {
      throw httpError('activityName is required.', 400);
    }
    cleaned.activityName = String(cleaned.activityName).trim();
  }
  if (cleaned.category !== undefined) assertValidCategory(cleaned.category);

  if (cleaned.hallId !== undefined) {
    cleaned.hallId = normaliseHallId(cleaned.hallId);
    if (cleaned.hallId !== null) await assertHallInBooking(bookingId, cleaned.hallId);
  }

  // Validate the resulting time range even when only one side is changing
  if (cleaned.startTime !== undefined || cleaned.endTime !== undefined) {
    assertValidTimes(
      cleaned.startTime ?? current.start_time,
      cleaned.endTime ?? current.end_time
    );
  }

  const fieldMap = {
    activityName: 'activity_name',
    category: 'category',
    hallId: 'hall_id',
    startTime: 'start_time',
    endTime: 'end_time',
    assignedTo: 'assigned_to',
    notes: 'notes',
    sequenceOrder: 'sequence_order',
  };

  const fields = [];
  const values = [];
  let idx = 1;

  for (const [key, column] of Object.entries(fieldMap)) {
    if (cleaned[key] !== undefined) {
      fields.push(`${column} = $${idx}`);
      values.push(cleaned[key]);
      idx++;
    }
  }

  if (fields.length === 0) {
    throw httpError('No valid fields provided to update.', 400);
  }

  values.push(timelineId, bookingId);
  await query(
    `UPDATE event_timelines SET ${fields.join(', ')}
      WHERE timeline_id = $${idx} AND booking_id = $${idx + 1}`,
    values
  );
  return getActivity(timelineId, bookingId);
};

// ── Delete (scoped to the booking in the URL) ───────────────────────────────
const deleteTimelineActivity = async (bookingId, timelineId) => {
  const result = await query(
    `DELETE FROM event_timelines
      WHERE timeline_id = $1 AND booking_id = $2
      RETURNING timeline_id`,
    [timelineId, bookingId]
  );
  if (result.rows.length === 0) {
    throw httpError(`Timeline activity ${timelineId} not found.`, 404);
  }
  return result.rows[0];
};

const getBookingOwnerId = async (bookingId) => {
  const booking = await getBookingOrThrow(bookingId);
  return booking.user_id;
};

// Organizers may only read timelines of bookings they are assigned to
const isOrganizerAssignedToBooking = async (bookingId, userId) => {
  const result = await query(
    `SELECT 1
       FROM booking_organizers bo
       JOIN organizers o ON o.organizer_id = bo.organizer_id
      WHERE bo.booking_id = $1 AND o.user_id = $2`,
    [bookingId, userId]
  );
  return result.rows.length > 0;
};

module.exports = {
  CATEGORIES,
  listTimelineForBooking,
  createTimelineActivity,
  updateTimelineActivity,
  deleteTimelineActivity,
  getBookingOwnerId,
  isOrganizerAssignedToBooking,
};