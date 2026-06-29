// ─────────────────────────────────────────────────────────────────────────────
//  src/routes/pricing.routes.js
// ─────────────────────────────────────────────────────────────────────────────
const express = require('express');

const { authenticate, restrictTo } = require('../middleware/auth.middleware');
const { validate }                 = require('../middleware/validate');
const {
  validateGetEventPricing,
  validateCalculatePrice,
} = require('../validators/pricing.validator');
const {
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
  restrictTo('admin', 'manager', 'front_desk', 'customer'),
  validateGetEventPricing,
  validate,
  getEventPricing
);

// ─────────────────────────────────────────────────────────────────────────────
//  CALCULATE — compute a price quote without creating a booking
//  POST /api/pricing/calculate
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  '/calculate',
  restrictTo('admin', 'manager', 'front_desk', 'customer'),
  validateCalculatePrice,
  validate,
  calculatePrice
);

module.exports = router;
