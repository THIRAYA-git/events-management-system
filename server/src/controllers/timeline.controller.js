// ─────────────────────────────────────────────────────────────────────────────
//  src/controllers/timeline.controller.js
// ─────────────────────────────────────────────────────────────────────────────
const {
  listTimelineForBooking,
  createTimelineActivity,
  updateTimelineActivity,
  deleteTimelineActivity,
  getBookingOwnerId,
} = require('../services/timeline.service');

// ── GET /api/bookings/:bookingId/timeline ────────────────────────────────────
const listTimelineHandler = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    if (req.user.role === 'customer') {
      const ownerId = await getBookingOwnerId(bookingId);
      if (ownerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this booking.',
        });
      }
    }

    const activities = await listTimelineForBooking(bookingId);
    return res.status(200).json({ success: true, data: activities });
  } catch (err) {
    if (isServiceError(err)) {
      return res.status(404).json({ success: false, message: err.message });
    }
    next(err);
  }
};

// ── POST /api/bookings/:bookingId/timeline ───────────────────────────────────
const createTimelineHandler = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const {
      activity_name,
      start_time,
      end_time,
      assigned_to,
      notes,
      sequence_order,
    } = req.body;

    const activity = await createTimelineActivity({
      bookingId,
      activityName: activity_name,
      startTime: start_time,
      endTime: end_time,
      assignedTo: assigned_to,
      notes,
      sequenceOrder: sequence_order,
    });

    return res.status(201).json({ success: true, data: activity });
  } catch (err) {
    if (isServiceError(err)) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
};

// ── PATCH /api/bookings/:bookingId/timeline/:timelineId ──────────────────────
const updateTimelineHandler = async (req, res, next) => {
  try {
    const { timelineId } = req.params;
    const {
      activity_name,
      start_time,
      end_time,
      assigned_to,
      notes,
      sequence_order,
    } = req.body;

    const activity = await updateTimelineActivity(timelineId, {
      activityName: activity_name,
      startTime: start_time,
      endTime: end_time,
      assignedTo: assigned_to,
      notes,
      sequenceOrder: sequence_order,
    });

    return res.status(200).json({ success: true, data: activity });
  } catch (err) {
    if (isServiceError(err)) {
      const status = err.message.includes('not found') ? 404 : 400;
      return res.status(status).json({ success: false, message: err.message });
    }
    next(err);
  }
};

// ── DELETE /api/bookings/:bookingId/timeline/:timelineId ─────────────────────
const deleteTimelineHandler = async (req, res, next) => {
  try {
    const { timelineId } = req.params;
    await deleteTimelineActivity(timelineId);
    return res.status(200).json({ success: true, message: 'Timeline activity deleted.' });
  } catch (err) {
    if (isServiceError(err)) {
      return res.status(404).json({ success: false, message: err.message });
    }
    next(err);
  }
};

const SERVICE_ERROR_PATTERNS = [
  'required', 'not found', 'must be before', 'no valid fields',
];
const isServiceError = (err) =>
  SERVICE_ERROR_PATTERNS.some((p) => err.message?.toLowerCase().includes(p));

module.exports = {
  listTimelineHandler,
  createTimelineHandler,
  updateTimelineHandler,
  deleteTimelineHandler,
};