// ─────────────────────────────────────────────────────────────────────────────
//  src/services/timeline.service.js
// ─────────────────────────────────────────────────────────────────────────────
const { query } = require('../config/db');

const getBookingOrThrow = async (bookingId) => {
  const result = await query(
    `SELECT booking_id, user_id FROM bookings WHERE booking_id = $1`,
    [bookingId]
  );
  if (result.rows.length === 0) {
    throw new Error(`Booking ID ${bookingId} not found.`);
  }
  return result.rows[0];
};

// ── List all timeline activities for a booking, in run order ────────────────
const listTimelineForBooking = async (bookingId) => {
  await getBookingOrThrow(bookingId);

  const result = await query(
    `SELECT timeline_id, booking_id, activity_name, start_time, end_time,
            assigned_to, notes, sequence_order, created_at
       FROM event_timelines
      WHERE booking_id = $1
      ORDER BY sequence_order, start_time`,
    [bookingId]
  );
  return result.rows;
};

// ── Create a new activity. Auto-assigns sequence_order if not given ─────────
const createTimelineActivity = async ({
  bookingId,
  activityName,
  startTime,
  endTime,
  assignedTo = null,
  notes = null,
  sequenceOrder = null,
}) => {
  await getBookingOrThrow(bookingId);

  if (!activityName) throw new Error('activityName is required.');
  if (!startTime || !endTime) throw new Error('startTime and endTime are required.');
  if (startTime >= endTime) throw new Error('startTime must be before endTime.');

  let order = sequenceOrder;
  if (order == null) {
    const maxResult = await query(
      `SELECT COALESCE(MAX(sequence_order), 0) AS max_order
         FROM event_timelines WHERE booking_id = $1`,
      [bookingId]
    );
    order = maxResult.rows[0].max_order + 1;
  }

  const result = await query(
    `INSERT INTO event_timelines
       (booking_id, activity_name, start_time, end_time, assigned_to, notes, sequence_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [bookingId, activityName, startTime, endTime, assignedTo, notes, order]
  );
  return result.rows[0];
};

// ── Partial update. Only re-validates time ordering if both are being set ───
const updateTimelineActivity = async (timelineId, updates) => {
  const existing = await query(
    `SELECT timeline_id FROM event_timelines WHERE timeline_id = $1`,
    [timelineId]
  );
  if (existing.rows.length === 0) {
    throw new Error(`Timeline activity ${timelineId} not found.`);
  }

  const fieldMap = {
    activityName: 'activity_name',
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
    if (updates[key] !== undefined) {
      fields.push(`${column} = $${idx}`);
      values.push(updates[key]);
      idx++;
    }
  }

  if (fields.length === 0) {
    throw new Error('No valid fields provided to update.');
  }

  if (updates.startTime !== undefined && updates.endTime !== undefined) {
    if (updates.startTime >= updates.endTime) {
      throw new Error('startTime must be before endTime.');
    }
  }

  values.push(timelineId);
  const result = await query(
    `UPDATE event_timelines SET ${fields.join(', ')} WHERE timeline_id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0];
};

const deleteTimelineActivity = async (timelineId) => {
  const result = await query(
    `DELETE FROM event_timelines WHERE timeline_id = $1 RETURNING timeline_id`,
    [timelineId]
  );
  if (result.rows.length === 0) {
    throw new Error(`Timeline activity ${timelineId} not found.`);
  }
  return result.rows[0];
};

const getBookingOwnerId = async (bookingId) => {
  const booking = await getBookingOrThrow(bookingId);
  return booking.user_id;
};

module.exports = {
  listTimelineForBooking,
  createTimelineActivity,
  updateTimelineActivity,
  deleteTimelineActivity,
  getBookingOwnerId,
};
