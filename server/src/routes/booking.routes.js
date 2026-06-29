// ─────────────────────────────────────────────────────────────────────────────
//  src/routes/booking.routes.js
// ─────────────────────────────────────────────────────────────────────────────
const express = require('express');

const { authenticate, restrictTo } = require('../middleware/auth.middleware');
const { validate }                 = require('../middleware/validate');
const {
  validateCreateBooking,
  validateGetBooking,
} = require('../validators/booking.validator');
const {
  createBookingHandler,
  getBookingHandler,
} = require('../controllers/booking.controller');

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

module.exports = router;
