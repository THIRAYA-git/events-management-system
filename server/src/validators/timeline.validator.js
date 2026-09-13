// ─────────────────────────────────────────────────────────────────────────────
//  src/validators/timeline.validator.js
// ─────────────────────────────────────────────────────────────────────────────
const { body, param } = require('express-validator');

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;

const validateListTimeline = [
  param('bookingId').notEmpty().isInt({ min: 1 }).toInt(),
];

const validateCreateTimeline = [
  param('bookingId').notEmpty().isInt({ min: 1 }).toInt(),

  body('activity_name')
    .notEmpty().withMessage('activity_name is required')
    .isString().trim()
    .isLength({ max: 100 }).withMessage('activity_name must not exceed 100 characters'),

  body('start_time')
    .notEmpty().withMessage('start_time is required')
    .matches(TIME_REGEX).withMessage('start_time must be HH:MM or HH:MM:SS'),

  body('end_time')
    .notEmpty().withMessage('end_time is required')
    .matches(TIME_REGEX).withMessage('end_time must be HH:MM or HH:MM:SS'),

  body('assigned_to')
    .optional()
    .isString().trim()
    .isLength({ max: 100 }).withMessage('assigned_to must not exceed 100 characters'),

  body('notes').optional().isString().trim(),

  body('sequence_order')
    .optional()
    .isInt({ min: 1 }).withMessage('sequence_order must be a positive integer')
    .toInt(),
];

const validateUpdateTimeline = [
  param('timelineId').notEmpty().isInt({ min: 1 }).toInt(),

  body('activity_name').optional().isString().trim().isLength({ max: 100 }),
  body('start_time').optional().matches(TIME_REGEX),
  body('end_time').optional().matches(TIME_REGEX),
  body('assigned_to').optional().isString().trim().isLength({ max: 100 }),
  body('notes').optional().isString().trim(),
  body('sequence_order').optional().isInt({ min: 1 }).toInt(),
];

const validateDeleteTimeline = [
  param('timelineId').notEmpty().isInt({ min: 1 }).toInt(),
];

module.exports = {
  validateListTimeline,
  validateCreateTimeline,
  validateUpdateTimeline,
  validateDeleteTimeline,
};