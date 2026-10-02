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
const { getBookingById } = require('../services/booking.service');
const { findUserById } = require('../models/user.model');
const { sendEventUpdateEmail } = require('../services/email.service');

// Set to false to stop emailing customers about schedule changes.
const NOTIFY_CUSTOMER_ON_TIMELINE = true;

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

const clock = (t) => (t ? String(t).slice(0, 5) : '');

// FR-017: tell the customer their event schedule changed. Only for confirmed
// bookings whose event hasn't happened yet. Called AFTER the response is
// sent and fully isolated: it can never fail or slow the staff request.
const notifyCustomerOfScheduleChange = async (bookingId, change, details) => {
  if (!NOTIFY_CUSTOMER_ON_TIMELINE) return;
  try {
    const booking = await getBookingById(bookingId);
    if (booking.status !== 'confirmed') return;

    const endOfEventDay = new Date(booking.event_date);
    endOfEventDay.setHours(23, 59, 59, 999);
    if (endOfEventDay.getTime() < Date.now()) return;

    const customer = await findUserById(booking.user_id);
    if (!customer?.email) return;

    await sendEventUpdateEmail(customer.email, {
      customerName: customer.full_name,
      bookingRef: booking.booking_ref,
      hallName: booking.second_hall_name
        ? `${booking.hall_name} + ${booking.second_hall_name}`
        : booking.hall_name || 'Aazath Plaza',
      eventDate: new Date(booking.event_date).toLocaleDateString('en-GB'),
      change,
      activityName: details.activityName,
      category: details.category,
      startTime: clock(details.startTime),
      endTime: clock(details.endTime),
    });
  } catch (err) {
    console.error('[timeline.controller] Schedule-change email failed:', err.message);
  }
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

    res.status(201).json({ success: true, data: activity });

    notifyCustomerOfScheduleChange(bookingId, 'added', {
      activityName: activity_name,
      category,
      startTime: start_time,
      endTime: end_time,
    });
    return;
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

    res.status(200).json({ success: true, data: activity });

    // Only customer-visible changes trigger an email. Internal edits
    // (notes, assignee, ordering) stay silent.
    const customerVisible =
      activity_name !== undefined ||
      category !== undefined ||
      hall_id !== undefined ||
      start_time !== undefined ||
      end_time !== undefined;
    if (customerVisible) {
      notifyCustomerOfScheduleChange(bookingId, 'updated', {
        activityName: activity_name ?? activity?.activity_name,
        category: category ?? activity?.category,
        startTime: start_time ?? activity?.start_time,
        endTime: end_time ?? activity?.end_time,
      });
    }
    return;
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