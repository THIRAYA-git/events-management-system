// ─────────────────────────────────────────────────────────────────────────────
//  src/controllers/hall.controller.js
// ─────────────────────────────────────────────────────────────────────────────
const {
  checkAvailability,
  getAvailableHalls,
  getHallSchedule,
  assignHallToBooking,
  releaseHallBooking,
} = require('../services/hall.availability.service');

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/halls/availability?hall_id=&event_date=&start_time=&end_time=
// ─────────────────────────────────────────────────────────────────────────────
const checkHallAvailability = async (req, res, next) => {
  try {
    const { hall_id, event_date, start_time, end_time } = req.query;

    const result = await checkAvailability({
      hallId:    hall_id,
      eventDate: typeof event_date === 'string' ? event_date : event_date.toISOString().split('T')[0],
      startTime: start_time,
      endTime:   end_time,
    });

    return res.status(200).json({
      success: true,
      data:    result,
    });
  } catch (err) {
    if (isServiceError(err)) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/halls/available?event_date=&start_time=&end_time=&floor_number=&guest_count=
// ─────────────────────────────────────────────────────────────────────────────
const listAvailableHalls = async (req, res, next) => {
  try {
    const { event_date, start_time, end_time, floor_number, guest_count } = req.query;

    const result = await getAvailableHalls({
      eventDate:   typeof event_date === 'string' ? event_date : event_date.toISOString().split('T')[0],
      startTime:   start_time,
      endTime:     end_time,
      floorNumber: floor_number  ?? null,
      guestCount:  guest_count   ?? null,
    });

    return res.status(200).json({
      success: true,
      data:    result,
    });
  } catch (err) {
    if (isServiceError(err)) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/halls/:hallId/schedule?event_date=
// ─────────────────────────────────────────────────────────────────────────────
const getSchedule = async (req, res, next) => {
  try {
    const { hallId }     = req.params;
    const { event_date } = req.query;

    const result = await getHallSchedule({
      hallId:    hallId,
      eventDate: typeof event_date === 'string' ? event_date : event_date.toISOString().split('T')[0],
    });

    return res.status(200).json({
      success: true,
      data:    result,
    });
  } catch (err) {
    if (isServiceError(err)) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/halls/assign
//  Body: { hall_id, booking_id, event_date, start_time, end_time, notes? }
// ─────────────────────────────────────────────────────────────────────────────
const assignHall = async (req, res, next) => {
  try {
    const { hall_id, booking_id, event_date, start_time, end_time, notes } = req.body;

    const hallBooking = await assignHallToBooking({
      hallId:     hall_id,
      bookingId:  booking_id,
      eventDate:  typeof event_date === 'string' ? event_date : event_date.toISOString().split('T')[0],
      startTime:  start_time,
      endTime:    end_time,
      assignedBy: req.user.id,
      notes,
    });

    return res.status(201).json({
      success: true,
      message: 'Hall successfully assigned to booking.',
      data:    hallBooking,
    });
  } catch (err) {
    if (isServiceError(err)) {
      // Conflict / capacity errors should return 409
      const isConflict =
        err.message.includes('no longer available') ||
        err.message.includes('exceeds') ||
        err.message.includes('would exceed');
      const status = isConflict ? 409 : 400;
      return res.status(status).json({ success: false, message: err.message });
    }
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  DELETE /api/halls/assign/:hallBookingId
// ─────────────────────────────────────────────────────────────────────────────
const releaseHall = async (req, res, next) => {
  try {
    const { hallBookingId } = req.params;

    const updated = await releaseHallBooking({
      hallBookingId: hallBookingId,
      cancelledBy:   req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: 'Hall booking cancelled successfully.',
      data:    updated,
    });
  } catch (err) {
    if (isServiceError(err)) {
      const status = err.message.includes('not found') ? 404 : 409;
      return res.status(status).json({ success: false, message: err.message });
    }
    next(err);
  }
};

// ── Only treat known business-rule errors as 4xx ──────────────────────────────
const SERVICE_ERROR_PATTERNS = [
  'cannot', 'must', 'not found', 'no longer available',
  'already cancelled', 'past date', 'before', 'after',
  'exceeds', 'would exceed',
];
const isServiceError = (err) =>
  SERVICE_ERROR_PATTERNS.some((p) => err.message?.toLowerCase().includes(p));

module.exports = {
  checkHallAvailability,
  listAvailableHalls,
  getSchedule,
  assignHall,
  releaseHall,
};

