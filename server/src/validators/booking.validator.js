// ─────────────────────────────────────────────────────────────────────────────
//  src/validators/booking.validator.js
// ─────────────────────────────────────────────────────────────────────────────
const { body, param } = require('express-validator');

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/bookings
// ─────────────────────────────────────────────────────────────────────────────
const validateCreateBooking = [
  body('hall_id')
    .notEmpty().withMessage('hall_id is required')
    .isInt({ min: 1 }).withMessage('hall_id must be a positive integer')
    .toInt(),

  body('event_date')
    .notEmpty().withMessage('event_date is required')
    .isISO8601().withMessage('event_date must be a valid date (YYYY-MM-DD)'),

  body('start_time')
    .notEmpty().withMessage('start_time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/).withMessage('start_time must be HH:MM or HH:MM:SS'),

  body('end_time')
    .notEmpty().withMessage('end_time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/).withMessage('end_time must be HH:MM or HH:MM:SS'),

  body('event_type')
    .notEmpty().withMessage('event_type is required')
    .isString().trim()
    .isLength({ max: 80 }).withMessage('event_type must not exceed 80 characters'),

  body('custom_event_type')
    .optional({ nullable: true })
    .isString().trim()
    .isLength({ max: 100 }).withMessage('custom_event_type must not exceed 100 characters'),

  body('use_both_halls')
    .optional()
    .isBoolean().withMessage('use_both_halls must be true or false')
    .toBoolean(),

  body('guest_count')
    .notEmpty().withMessage('guest_count is required')
    .isInt({ min: 1, max: 1200 }).withMessage('guest_count must be between 1 and 1200')
    .toInt(),

  body('room_count')
    .optional()
    .isInt({ min: 0, max: 5 }).withMessage('room_count must be between 0 and 5')
    .toInt(),

  body('extra_addons')
    .optional()
    .isFloat({ min: 0 }).withMessage('extra_addons must not be negative')
    .toFloat(),

  body('discount_amount')
    .optional()
    .isFloat({ min: 0 }).withMessage('discount_amount must not be negative')
    .toFloat(),

  body('tax_amount')
    .optional()
    .isFloat({ min: 0 }).withMessage('tax_amount must not be negative')
    .toFloat(),

  body('special_requests')
    .optional()
    .isString().trim()
    .isLength({ max: 2000 }).withMessage('special_requests must not exceed 2000 characters'),
];

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/bookings/:bookingId
// ─────────────────────────────────────────────────────────────────────────────
const validateGetBooking = [
  param('bookingId')
    .notEmpty().withMessage('bookingId is required')
    .isInt({ min: 1 }).withMessage('bookingId must be a positive integer')
    .toInt(),
];

module.exports = {
  validateCreateBooking,
  validateGetBooking,
};