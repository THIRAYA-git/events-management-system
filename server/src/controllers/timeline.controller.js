// ─────────────────────────────────────────────────────────────────────────────
//  src/controllers/timeline.controller.js
// ─────────────────────────────────────────────────────────────────────────────
const {
  listTimelineForBooking,
  createTimelineActivity,
  updateTimelineActivity,
  deleteTimelineActivity,
  getBookingOwnerId,
  isOrganizerAssignedToBooking,
} = require('../services/timeline.service');

const parseId = (value, label) => {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    const err = new Error(`Invalid ${label}.`);
    err.statusCode = 400;
    throw err;
  }
  return n;
};

// Service errors carry a statusCode; anything else goes to the error middleware
const handleError = (err, res, next) => {
  if (err.statusCode) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }
  return next(err);
};

// ── GET /api/bookings/:bookingId/timeline ────────────────────────────────────
const listTimelineHandler = async (req, res, next) => {
  try {
    const bookingId = parseId(req.params.bookingId, 'booking ID');

    if (req.user.role === 'customer') {
      const ownerId = await getBookingOwnerId(bookingId);
      if (ownerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this booking.',
        });
      }
    }

    if (req.user.role === 'organizer') {
      const assigned = await isOrganizerAssignedToBooking(bookingId, req.user.id);
      if (!assigned) {
        return res.status(403).json({
          success: false,
          message: 'You are not assigned to this booking.',
        });
      }
    }

    const { booking, activities } = await listTimelineForBooking(bookingId);
    return res.status(200).json({ success: true, data: activities, meta: { booking } });
  } catch (err) {
    return handleError(err, res, next);
  }
};

// ── POST /api/bookings/:bookingId/timeline ───────────────────────────────────
const createTimelineHandler = async (req, res, next) => {
  try {
    const bookingId = parseId(req.params.bookingId, 'booking ID');
    const {
      activity_name,
      category,
      hall_id,
      start_time,
      end_time,
      assigned_to,
      notes,
      sequence_order,
    } = req.body;

    const activity = await createTimelineActivity({
      bookingId,
      activityName: activity_name,
      category,
      hallId: hall_id,
      startTime: start_time,
      endTime: end_time,
      assignedTo: assigned_to,
      notes,
      sequenceOrder: sequence_order,
    });

    return res.status(201).json({ success: true, data: activity });
  } catch (err) {
    return handleError(err, res, next);
  }
};

// ── PATCH /api/bookings/:bookingId/timeline/:timelineId ──────────────────────
const updateTimelineHandler = async (req, res, next) => {
  try {
    const bookingId = parseId(req.params.bookingId, 'booking ID');
    const timelineId = parseId(req.params.timelineId, 'timeline ID');
    const {
      activity_name,
      category,
      hall_id,
      start_time,
      end_time,
      assigned_to,
      notes,
      sequence_order,
    } = req.body;

    const activity = await updateTimelineActivity(bookingId, timelineId, {
      activityName: activity_name,
      category,
      hallId: hall_id,
      startTime: start_time,
      endTime: end_time,
      assignedTo: assigned_to,
      notes,
      sequenceOrder: sequence_order,
    });

    return res.status(200).json({ success: true, data: activity });
  } catch (err) {
    return handleError(err, res, next);
  }
};

// ── DELETE /api/bookings/:bookingId/timeline/:timelineId ─────────────────────
const deleteTimelineHandler = async (req, res, next) => {
  try {
    const bookingId = parseId(req.params.bookingId, 'booking ID');
    const timelineId = parseId(req.params.timelineId, 'timeline ID');
    await deleteTimelineActivity(bookingId, timelineId);
    return res.status(200).json({ success: true, message: 'Timeline activity deleted.' });
  } catch (err) {
    return handleError(err, res, next);
  }
};

module.exports = {
  listTimelineHandler,
  createTimelineHandler,
  updateTimelineHandler,
  deleteTimelineHandler,
};