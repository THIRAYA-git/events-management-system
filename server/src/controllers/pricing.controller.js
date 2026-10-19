// ─────────────────────────────────────────────────────────────────────────────
//  src/controllers/pricing.controller.js
// ─────────────────────────────────────────────────────────────────────────────
const {
  listEventPricing,
  calculateBookingTotal,
} = require('../services/pricing.service');

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

//  POST /api/pricing/calculate
//  Body: { event_type, use_both_halls?, room_count?, extra_addons?, discount_amount?, tax_amount? }
const calculatePrice = async (req, res, next) => {
  try {
    const {
      event_type,
      use_both_halls  = false,
      room_count      = 0,
      extra_addons    = 0,
      discount_amount = 0,
      tax_amount      = 0,
    } = req.body;

    const result = await calculateBookingTotal({
      eventType:      event_type,
      useBothHalls:   use_both_halls === true || use_both_halls === 'true',
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

const SERVICE_ERROR_PATTERNS = [
  'unknown event_type', 'currently not available', 'not currently available',
  'must be between', 'must not be negative', 'cannot exceed',
];
const isServiceError = (err) =>
  SERVICE_ERROR_PATTERNS.some((p) => err.message?.toLowerCase().includes(p));

module.exports = {
  getEventPricing,
  calculatePrice,
};
