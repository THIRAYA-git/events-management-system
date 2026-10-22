// ─────────────────────────────────────────────────────────────────────────────
//  src/services/pricing.service.js
//  Single source of truth for booking pricing — replaces the old
//  `packages` table. Reads from event_pricing (see migration_003).
//  both_halls_price (nullable) overrides base_price when the customer
//  books both halls; NULL means the price is the same for one or two halls.
// ─────────────────────────────────────────────────────────────────────────────
const { query } = require('../config/db');

const getEventPrice = async (eventType, { useBothHalls = false } = {}) => {
  const result = await query(
    `SELECT event_type, base_price, both_halls_price, is_active
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

  const singlePrice = parseFloat(row.base_price);
  const bothPrice =
    row.both_halls_price !== null ? parseFloat(row.both_halls_price) : null;

  return {
    eventType: row.event_type,
    basePrice: useBothHalls && bothPrice !== null ? bothPrice : singlePrice,
  };
};

const listEventPricing = async ({ includeInactive = false } = {}) => {
  const result = await query(
    includeInactive
      ? `SELECT event_type, base_price, both_halls_price, description, is_active
           FROM event_pricing ORDER BY base_price, event_type`
      : `SELECT event_type, base_price, both_halls_price, description, is_active
           FROM event_pricing WHERE is_active = true ORDER BY base_price, event_type`
  );

  return result.rows.map((r) => ({
    eventType:     r.event_type,
    basePrice:     parseFloat(r.base_price),
    bothHallsPrice: r.both_halls_price !== null ? parseFloat(r.both_halls_price) : null,
    description:   r.description,
    isActive:      r.is_active,
  }));
};

const ROOM_RATE_PER_DAY = 5000;
const MAX_ROOMS = 5;

const calculateBookingTotal = async ({
  eventType,
  useBothHalls   = false,
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

  const { basePrice } = await getEventPrice(eventType, { useBothHalls });

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

// FR-023 — admin edits a price. Old row + new row are written to audit_log in the
// same transaction-less pair of statements (audit failure must not block the update).
// Existing bookings are unaffected: bookings.base_amount/total_amount are stored at creation.
const updateEventPricing = async (
  eventType,
  { basePrice, bothHallsPrice, description, isActive },
  { userId, ip } = {}
) => {
  const before = await query(
    `SELECT event_type, base_price, both_halls_price, description, is_active
       FROM event_pricing WHERE event_type = $1`,
    [eventType]
  );
  if (before.rows.length === 0) {
    const e = new Error(`Unknown event_type "${eventType}".`);
    e.statusCode = 404;
    throw e;
  }
  const old = before.rows[0];

  const next = {
    base_price:       basePrice,
    both_halls_price: bothHallsPrice === undefined ? old.both_halls_price : bothHallsPrice,
    description:      description === undefined ? old.description : description,
    is_active:        isActive === undefined ? old.is_active : isActive,
  };

  if (next.both_halls_price !== null && Number(next.both_halls_price) < Number(next.base_price)) {
    const e = new Error('both_halls_price cannot be lower than base_price.');
    e.statusCode = 400;
    throw e;
  }

  const res = await query(
    `UPDATE event_pricing
        SET base_price = $2, both_halls_price = $3, description = $4, is_active = $5
      WHERE event_type = $1
      RETURNING event_type, base_price, both_halls_price, description, is_active`,
    [eventType, next.base_price, next.both_halls_price, next.description, next.is_active]
  );
  const row = res.rows[0];

  try {
    await query(
      `INSERT INTO audit_log (user_id, action, table_name, old_values, new_values, ip_address)
       VALUES ($1, 'PRICING_UPDATED', 'event_pricing', $2, $3, $4)`,
      [userId || null, JSON.stringify(old), JSON.stringify(row), ip || null]
    );
  } catch (e) {
    console.error('[audit_log]', e.message);
  }

  return {
    eventType:      row.event_type,
    basePrice:      parseFloat(row.base_price),
    bothHallsPrice: row.both_halls_price !== null ? parseFloat(row.both_halls_price) : null,
    description:    row.description,
    isActive:       row.is_active,
  };
};

module.exports = {
  getEventPrice,
  updateEventPricing,
  listEventPricing,
  calculateBookingTotal,
  ROOM_RATE_PER_DAY,
  MAX_ROOMS,
};