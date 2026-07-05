// ─────────────────────────────────────────────────────────────────────────────
//  src/routes/booking.routes.js
// ─────────────────────────────────────────────────────────────────────────────
const express = require('express');

const { authenticate, authorize, restrictTo } = require('../middleware/auth.middleware');
const { validate }                 = require('../middleware/validate');
const {
  validateCreateBooking,
  validateGetBooking,
} = require('../validators/booking.validator');
const {
  createBookingHandler,
  getBookingHandler,
} = require('../controllers/booking.controller');
const {
  listOrganizersForBookingHandler,
  assignOrganizerHandler,
} = require('../controllers/organizer.controller');

const router = express.Router();

// All booking routes require a valid token
router.use(authenticate);

// ─────────────────────────────────────────────────────────────────────────────
//  CREATE — customer (or staff, on a customer's behalf) creates a booking
//  POST /api/bookings
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  '/',
  restrictTo('admin', 'manager', 'front_desk', 'customer'),
  validateCreateBooking,
  validate,
  createBookingHandler
);

// ─────────────────────────────────────────────────────────────────────────────
//  READ — fetch a single booking with hall + pricing details
//  GET /api/bookings/:bookingId
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  '/:bookingId',
  restrictTo('admin', 'manager', 'front_desk', 'customer'),
  validateGetBooking,
  validate,
  getBookingHandler
);

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/bookings/:bookingId/organizers — organizers assigned to a booking
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  '/:bookingId/organizers',
  restrictTo('admin', 'manager', 'front_desk', 'customer'),
  listOrganizersForBookingHandler
);

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/bookings/:bookingId/organizers — staff assigns an organizer
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  '/:bookingId/organizers',
  authorize('organizer:manage'),
  assignOrganizerHandler
);

module.exports = router;

