// ─────────────────────────────────────────────────────────────────────────────
//  src/validators/hall.validator.js
// ─────────────────────────────────────────────────────────────────────────────
const { body, query, param } = require('express-validator');
const { OPEN_TIME, CLOSE_TIME } = require('../services/hall.availability.service');

// ── Shared: validate a time string 'HH:MM' or 'HH:MM:SS' ────────────────────
const isValidTime = (value) => {
  return /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value);
};

// ── Shared: normalize to 'HH:MM:SS' ─────────────────────────────────────────
const normalizeTime = (value) => (value.length === 5 ? `${value}:00` : value);

// ── Shared time fields used across multiple validators ───────────────────────
const timeFields = (source = query) => [
  source('start_time')
    .notEmpty()
    .withMessage('start_time is required (format: HH:MM or HH:MM:SS)')
    .custom(isValidTime)
    .withMessage('start_time must be a valid time (HH:MM or HH:MM:SS)')
    .customSanitizer(normalizeTime)
    .custom((v) => v >= OPEN_TIME)
    .withMessage(`start_time cannot be before ${OPEN_TIME}`),

  source('end_time')
    .notEmpty()
    .withMessage('end_time is required (format: HH:MM or HH:MM:SS)')
    .custom(isValidTime)
    .withMessage('end_time must be a valid time (HH:MM or HH:MM:SS)')
    .customSanitizer(normalizeTime)
    .custom((v) => v <= CLOSE_TIME)
    .withMessage(`end_time cannot be after ${CLOSE_TIME}`)
    .custom((endTime, { req }) => {
      const start = req.query?.start_time ?? req.body?.start_time;
      if (start && normalizeTime(endTime) <= normalizeTime(start)) {
        throw new Error('end_time must be after start_time');
      }
      return true;
    }),
];

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/halls/availability  — check one hall on a date+slot
// ─────────────────────────────────────────────────────────────────────────────
const validateCheckAvailability = [
  query('hall_id')
    .notEmpty().withMessage('hall_id is required')
    .isInt({ min: 1 }).withMessage('hall_id must be a positive integer')
    .toInt(),

  query('event_date')
    .notEmpty().withMessage('event_date is required')
    .isISO8601().withMessage('event_date must be YYYY-MM-DD')
    .toDate()
    .custom((date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) throw new Error('event_date cannot be in the past');
      return true;
    }),

  ...timeFields(query),
];

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/halls/available  — list all free halls for a slot
// ─────────────────────────────────────────────────────────────────────────────
const validateGetAvailableHalls = [
  query('event_date')
    .notEmpty().withMessage('event_date is required')
    .isISO8601().withMessage('event_date must be YYYY-MM-DD')
    .toDate()
    .custom((date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) throw new Error('event_date cannot be in the past');
      return true;
    }),

  ...timeFields(query),

  query('floor_number')
    .optional()
    .isInt({ min: 1, max: 2 }).withMessage('floor_number must be 1 or 2')
    .toInt(),

  query('guest_count')
    .optional()
    .isInt({ min: 1 }).withMessage('guest_count must be a positive integer')
    .toInt(),
];

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/halls/:hallId/schedule  — full day schedule for a hall
// ─────────────────────────────────────────────────────────────────────────────
const validateGetSchedule = [
  param('hallId')
    .isInt({ min: 1 }).withMessage('hallId must be a positive integer')
    .toInt(),

  query('event_date')
    .notEmpty().withMessage('event_date is required')
    .isISO8601().withMessage('event_date must be YYYY-MM-DD')
    .toDate(),
];

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/halls/assign  — assign hall to a confirmed booking
// ─────────────────────────────────────────────────────────────────────────────
const validateAssignHall = [
  body('hall_id')
    .notEmpty().withMessage('hall_id is required')
    .isInt({ min: 1 }).withMessage('hall_id must be a positive integer')
    .toInt(),

  body('booking_id')
    .notEmpty().withMessage('booking_id is required')
    .isInt({ min: 1 }).withMessage('booking_id must be a positive integer')
    .toInt(),

  body('event_date')
    .notEmpty().withMessage('event_date is required')
    .isISO8601().withMessage('event_date must be YYYY-MM-DD')
    .toDate()
    .custom((date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) throw new Error('event_date cannot be in the past');
      return true;
    }),

  ...timeFields(body),

  body('notes')
    .optional()
    .isString().trim()
    .isLength({ max: 500 }).withMessage('notes must not exceed 500 characters'),
];

// ─────────────────────────────────────────────────────────────────────────────
//  DELETE /api/halls/assign/:hallBookingId  — cancel a hall assignment
// ─────────────────────────────────────────────────────────────────────────────
const validateReleaseHall = [
  param('hallBookingId')
    .isInt({ min: 1 }).withMessage('hallBookingId must be a positive integer')
    .toInt(),
];

module.exports = {
  validateCheckAvailability,
  validateGetAvailableHalls,
  validateGetSchedule,
  validateAssignHall,
  validateReleaseHall,
};
