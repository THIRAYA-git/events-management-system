// ─────────────────────────────────────────────────────────────────────────────
//  src/services/pricing.service.js
//  Single source of truth for booking pricing — replaces the old
//  `packages` table. Reads from event_pricing (see migration_003).
// ─────────────────────────────────────────────────────────────────────────────
const { query } = require('../config/db');

// ─────────────────────────────────────────────────────────────────────────────
//  getEventPrice
//  Look up the base LKR rate for a given event_type.
//  Throws if the event_type is unknown or has been deactivated —
//  callers should surface this as a 400, not silently default to 0.
// ─────────────────────────────────────────────────────────────────────────────
const getEventPrice = async (eventType) => {
  const result = await query(
    `SELECT event_type, base_price, is_active
       FROM event_pricing
      WHERE event_type = $1`,
    [eventType]
  );

  if (result.rows.length === 0) {
    throw new Error(
      `Unknown event_type "${eventType}". Must match an active row in event_pricing.`
    );
  }

  const row = result.rows[0];

  if (!row.is_active) {
    throw new Error(`event_type "${eventType}" is currently not available for booking.`);
  }

  return {
    eventType: row.event_type,
    basePrice: parseFloat(row.base_price),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
//  listEventPricing
//  All active event types + rates — for populating booking-form
//  dropdowns on the frontend.
// ─────────────────────────────────────────────────────────────────────────────
const listEventPricing = async ({ includeInactive = false } = {}) => {
  const result = await query(
    includeInactive
      ? `SELECT event_type, base_price, description, is_active FROM event_pricing ORDER BY base_price`
      : `SELECT event_type, base_price, description, is_active FROM event_pricing WHERE is_active = true ORDER BY base_price`
  );

  return result.rows.map((r) => ({
    eventType:   r.event_type,
    basePrice:   parseFloat(r.base_price),
    description: r.description,
    isActive:    r.is_active,
  }));
};

// ─────────────────────────────────────────────────────────────────────────────
//  calculateBookingTotal
//  Composes base event-type price + optional accommodation rooms
//  + optional addon/discount/tax inputs into the same fields
//  bookings already has (base_amount, addon_amount, discount_amount,
//  tax_amount, total_amount). Pure calculation — does not write to DB.
//
//  roomCount: number of accommodation rooms (LKR 5,000/room/day —
//  per AZATH_PLAZA FR-009). Billed as part of addon_amount.
// ─────────────────────────────────────────────────────────────────────────────
const ROOM_RATE_PER_DAY = 5000;
const MAX_ROOMS = 5;

const calculateBookingTotal = async ({
  eventType,
  roomCount      = 0,
  extraAddons    = 0,
  discountAmount = 0,
  taxAmount      = 0,
}) => {
  if (roomCount < 0 || roomCount > MAX_ROOMS) {
    throw new Error(`roomCount must be between 0 and ${MAX_ROOMS} (only ${MAX_ROOMS} rooms exist).`);
  }
  if (discountAmount < 0 || extraAddons < 0 || taxAmount < 0) {
    throw new Error('extraAddons, discountAmount, and taxAmount must not be negative.');
  }

  const { basePrice } = await getEventPrice(eventType);

  const roomCost     = roomCount * ROOM_RATE_PER_DAY;
  const addonAmount  = roomCost + extraAddons;
  const totalAmount  = basePrice + addonAmount + taxAmount - discountAmount;

  if (totalAmount < 0) {
    throw new Error('discountAmount cannot exceed base_amount + addon_amount + tax_amount.');
  }

  return {
    eventType,
    baseAmount:     basePrice,
    roomCount,
    roomCost,
    addonAmount,
    discountAmount,
    taxAmount,
    totalAmount,
  };
};

module.exports = {
  getEventPrice,
  listEventPricing,
  calculateBookingTotal,
  ROOM_RATE_PER_DAY,
  MAX_ROOMS,
};