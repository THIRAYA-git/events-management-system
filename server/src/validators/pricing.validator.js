// ─────────────────────────────────────────────────────────────────────────────
//  src/validators/pricing.validator.js
// ─────────────────────────────────────────────────────────────────────────────
const { body, query, param } = require('express-validator');

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/pricing/event-types
// ─────────────────────────────────────────────────────────────────────────────
const validateGetEventPricing = [
  query('include_inactive')
    .optional()
    .isBoolean().withMessage('include_inactive must be true or false')
    .toBoolean(),
];

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/pricing/calculate
// ─────────────────────────────────────────────────────────────────────────────
const validateCalculatePrice = [
  body('event_type')
    .notEmpty().withMessage('event_type is required')
    .isString().trim()
    .isLength({ max: 80 }).withMessage('event_type must not exceed 80 characters'),

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
];

// ─────────────────────────────────────────────────────────────────────────────
//  PUT /api/pricing/event-types/:eventType   (FR-023, admin only)
// ─────────────────────────────────────────────────────────────────────────────
const validateUpdateEventPricing = [
  param('eventType').isString().trim().notEmpty().isLength({ max: 80 }),

  body('base_price')
    .exists().withMessage('base_price is required')
    .isFloat({ min: 0, max: 99999999.99 }).withMessage('base_price must be a number of 0 or more')
    .toFloat(),

  body('both_halls_price')
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 99999999.99 }).withMessage('both_halls_price must be a number of 0 or more')
    .toFloat(),

  body('description')
    .optional({ nullable: true })
    .isString().trim()
    .isLength({ max: 500 }).withMessage('description must not exceed 500 characters'),

  body('is_active')
    .optional()
    .isBoolean().withMessage('is_active must be true or false')
    .toBoolean(),
];

module.exports = {
  validateUpdateEventPricing,
  validateGetEventPricing,
  validateCalculatePrice,
};
