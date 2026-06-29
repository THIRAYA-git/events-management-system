// ─────────────────────────────────────────────────────────────────────────────
//  src/controllers/pricing.controller.js
// ─────────────────────────────────────────────────────────────────────────────
const {
  listEventPricing,
  calculateBookingTotal,
} = require('../services/pricing.service');

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/pricing/event-types
//  List all active event types + rates — populates the booking form's
//  event-type dropdown and the calculator's rate display.
// ─────────────────────────────────────────────────────────────────────────────
const getEventPricing = async (req, res, next) => {
  try {
    const { include_inactive } = req.query;

    const result = await listEventPricing({
      includeInactive: include_inactive === 'true',
    });

    return res.status(200).json({
      success: true,
      data:    result,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/pricing/calculate
//  Body: { event_type, room_count?, extra_addons?, discount_amount?, tax_amount? }
//  Pure calculation — does not create a booking or write to the DB.
//  Used by both the customer-facing calculator widget and the
//  booking-creation flow (to populate base_amount/total_amount before insert).
// ─────────────────────────────────────────────────────────────────────────────
const calculatePrice = async (req, res, next) => {
  try {
    const {
      event_type,
      room_count      = 0,
      extra_addons    = 0,
      discount_amount = 0,
      tax_amount      = 0,
    } = req.body;

    const result = await calculateBookingTotal({
      eventType:      event_type,
      roomCount:      room_count,
      extraAddons:    extra_addons,
      discountAmount: discount_amount,
      taxAmount:      tax_amount,
    });

    return res.status(200).json({
      success: true,
      data:    result,
    });
  } catch (err) {
    if (isServiceError(err)) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
};

// ── Only treat known business-rule errors as 4xx ──────────────────────────────
const SERVICE_ERROR_PATTERNS = [
  'unknown event_type', 'not currently available', 'must be between',
  'must not be negative', 'cannot exceed',
];
const isServiceError = (err) =>
  SERVICE_ERROR_PATTERNS.some((p) => err.message?.toLowerCase().includes(p));

module.exports = {
  getEventPricing,
  calculatePrice,
};
