// ─────────────────────────────────────────────────────────────────────────────
//  src/validators/timeline.validator.js
// ─────────────────────────────────────────────────────────────────────────────
const { body, param } = require('express-validator');
const { CATEGORIES } = require('../services/timeline.service');

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;

const bookingIdParam = param('bookingId').notEmpty().isInt({ min: 1 }).toInt();
const timelineIdParam = param('timelineId').notEmpty().isInt({ min: 1 }).toInt();

const validateListTimeline = [bookingIdParam];

const validateCreateTimeline = [
  bookingIdParam,

  body('activity_name')
    .isString().trim()
    .notEmpty().withMessage('activity_name is required')
    .isLength({ max: 100 }).withMessage('activity_name must not exceed 100 characters'),

  body('category')
    .optional()
    .isIn(CATEGORIES).withMessage(`category must be one of: ${CATEGORIES.join(', ')}`),

  // null / omitted = applies to the whole event (all halls)
  body('hall_id')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('hall_id must be a positive integer')
    .toInt(),

  body('start_time')
    .notEmpty().withMessage('start_time is required')
    .matches(TIME_REGEX).withMessage('start_time must be HH:MM or HH:MM:SS'),

  body('end_time')
    .notEmpty().withMessage('end_time is required')
    .matches(TIME_REGEX).withMessage('end_time must be HH:MM or HH:MM:SS'),

  body('assigned_to')
    .optional({ nullable: true })
    .isString().trim()
    .isLength({ max: 100 }).withMessage('assigned_to must not exceed 100 characters'),

  body('notes').optional({ nullable: true }).isString().trim(),

  body('sequence_order')
    .optional()
    .isInt({ min: 1 }).withMessage('sequence_order must be a positive integer')
    .toInt(),
];

const validateUpdateTimeline = [
  bookingIdParam,
  timelineIdParam,

  body('activity_name').optional().isString().trim().notEmpty().isLength({ max: 100 }),
  body('category').optional().isIn(CATEGORIES),
  body('hall_id').optional({ nullable: true }).isInt({ min: 1 }).toInt(),
  body('start_time').optional().matches(TIME_REGEX),
  body('end_time').optional().matches(TIME_REGEX),
  body('assigned_to').optional({ nullable: true }).isString().trim().isLength({ max: 100 }),
  body('notes').optional({ nullable: true }).isString().trim(),
  body('sequence_order').optional().isInt({ min: 1 }).toInt(),
];

const validateDeleteTimeline = [bookingIdParam, timelineIdParam];

module.exports = {
  validateListTimeline,
  validateCreateTimeline,
  validateUpdateTimeline,
  validateDeleteTimeline,
};