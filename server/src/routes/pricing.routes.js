// ─────────────────────────────────────────────────────────────────────────────
//  src/routes/pricing.routes.js
// ─────────────────────────────────────────────────────────────────────────────
const express = require('express');

const { authenticate, authorize, restrictTo } = require('../middleware/auth.middleware');
const { validate }                 = require('../middleware/validate');
const {
  validateUpdateEventPricing,
  validateGetEventPricing,
  validateCalculatePrice,
} = require('../validators/pricing.validator');
const {
  updateEventPricingHandler,
  getEventPricing,
  calculatePrice,
} = require('../controllers/pricing.controller');

const router = express.Router();

// All pricing routes require a valid token
router.use(authenticate);

// ─────────────────────────────────────────────────────────────────────────────
//  READ — list active event types + rates (customer-facing + staff)
//  GET /api/pricing/event-types
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  '/event-types',
  restrictTo('admin', 'front_desk', 'customer'),
  validateGetEventPricing,
  validate,
  getEventPricing
);

// ─────────────────────────────────────────────────────────────────────────────
//  UPDATE — admin changes a price (FR-023). Applies to NEW bookings only.
//  PUT /api/pricing/event-types/:eventType
// ─────────────────────────────────────────────────────────────────────────────
router.put(
  '/event-types/:eventType',
  authorize('pricing:update'),
  validateUpdateEventPricing,
  validate,
  updateEventPricingHandler
);

// ─────────────────────────────────────────────────────────────────────────────
//  CALCULATE — compute a price quote without creating a booking
//  POST /api/pricing/calculate
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  '/calculate',
  restrictTo('admin', 'front_desk', 'customer'),
  validateCalculatePrice,
  validate,
  calculatePrice
);

module.exports = router;
