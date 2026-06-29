// ─────────────────────────────────────────────────────────────────────────────
//  src/controllers/booking.controller.js
// ─────────────────────────────────────────────────────────────────────────────
const {
  createBooking,
  getBookingById,
} = require('../services/booking.service');

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/bookings
//  Body: { hall_id, event_date, start_time, end_time, event_type,
//          guest_count, room_count?, extra_addons?, discount_amount?,
//          tax_amount?, special_requests? }
//
//  userId is read from req.user.id, matching the { id, email, role }
//  payload set by auth.middleware.js's verifyToken().
const createBookingHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const {
      hall_id,
      event_date,
      start_time,
      end_time,
      event_type,
      guest_count,
      room_count       = 0,
      extra_addons     = 0,
      discount_amount  = 0,
      tax_amount       = 0,
      special_requests = null,
    } = req.body;

    const result = await createBooking({
      userId,
      hallId:          hall_id,
      eventDate:       event_date,
      startTime:       start_time,
      endTime:         end_time,
      eventType:       event_type,
      guestCount:      guest_count,
      roomCount:       room_count,
      extraAddons:     extra_addons,
      discountAmount:  discount_amount,
      taxAmount:       tax_amount,
      specialRequests: special_requests,
    });

    return res.status(201).json({
      success: true,
      data:    result,
    });
  } catch (err) {
    if (isServiceError(err)) {
      const status = isConflictError(err) ? 409 : 400;
      return res.status(status).json({ success: false, message: err.message });
    }
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/bookings/:bookingId
// ─────────────────────────────────────────────────────────────────────────────
const getBookingHandler = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const result = await getBookingById(bookingId);

    return res.status(200).json({
      success: true,
      data:    result,
    });
  } catch (err) {
    if (isServiceError(err)) {
      return res.status(404).json({ success: false, message: err.message });
    }
    next(err);
  }
};

// ── Only treat known business-rule errors as 4xx ──────────────────────────────
const SERVICE_ERROR_PATTERNS = [
  'required', 'not found', 'inactive', 'exceeds', 'no longer available',
  'would exceed', 'unknown event_type', 'not currently available',
  'must be between', 'must not be negative', 'cannot exceed',
  'booked by another request',
];
const isServiceError = (err) =>
  SERVICE_ERROR_PATTERNS.some((p) => err.message?.toLowerCase().includes(p));

const isConflictError = (err) =>
  err.message?.includes('no longer available') ||
  err.message?.includes('exceeds') ||
  err.message?.includes('would exceed') ||
  err.message?.includes('booked by another request');

module.exports = {
  createBookingHandler,
  getBookingHandler,
};