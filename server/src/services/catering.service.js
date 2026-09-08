const db = require("../config/db");

// pending -> confirmed -> preparing -> delivered
// cancelled is reachable from pending/confirmed/preparing, never from delivered.
const ALLOWED_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

const getBookingOwnerId = async (bookingId) => {
  const result = await db.query(`SELECT user_id FROM bookings WHERE booking_id = $1`, [bookingId]);
  return result.rows.length ? result.rows[0].user_id : null;
};

const computeMenuItemsWithSubtotals = (menuItems) =>
  menuItems.map((line) => {
    const discount = line.discount || 0;
    const subtotal = line.unit_price * line.quantity - discount;
    return { ...line, discount, subtotal };
  });

const computeTotalCost = (menuItemsWithSubtotals) =>
  menuItemsWithSubtotals.reduce((sum, line) => sum + line.subtotal, 0);

const assertCanAccessOrder = async (order, requestingUser) => {
  if (["admin", "manager", "front_desk", "restaurant"].includes(requestingUser.role)) {
    return;
  }
  // customer: only their own order, via booking ownership
  const ownerId = await getBookingOwnerId(order.booking_id);
  if (ownerId !== requestingUser.id) {
    const err = new Error("You do not have permission to access this catering order");
    err.statusCode = 403;
    throw err;
  }
};

// Customers must own the booking; staff/restaurant can create on a
// customer's behalf (e.g. phone-in orders).
const createCateringOrder = async (bookingId, data, requestingUser) => {
  if (requestingUser.role === "customer") {
    const ownerId = await getBookingOwnerId(bookingId);
    if (ownerId === null) {
      const err = new Error("Booking not found");
      err.statusCode = 404;
      throw err;
    }
    if (ownerId !== requestingUser.id) {
      const err = new Error("You do not own this booking");
      err.statusCode = 403;
      throw err;
    }
  }

  const { menu_items, guest_count, special_notes = null, delivery_time = null } = data;

  const itemsWithSubtotals = computeMenuItemsWithSubtotals(menu_items);
  const totalCost = computeTotalCost(itemsWithSubtotals);

  const result = await db.query(
    `INSERT INTO catering_orders
       (booking_id, menu_items, total_cost, guest_count, status, special_notes, delivery_time)
     VALUES ($1, $2, $3, $4, 'pending', $5, $6)
     RETURNING order_id, booking_id, menu_items, total_cost, guest_count, status,
               special_notes, delivery_time, confirmed_at, delivered_at, created_at, updated_at`,
    [bookingId, JSON.stringify(itemsWithSubtotals), totalCost, guest_count, special_notes, delivery_time]
  );

  return result.rows[0];
};

const listCateringOrdersForBooking = async (bookingId, requestingUser) => {
  if (requestingUser.role === "customer") {
    const ownerId = await getBookingOwnerId(bookingId);
    if (ownerId !== requestingUser.id) {
      const err = new Error("You do not have permission to view these catering orders");
      err.statusCode = 403;
      throw err;
    }
  }

  const result = await db.query(
    `SELECT order_id, booking_id, menu_items, total_cost, guest_count, status,
            special_notes, delivery_time, confirmed_at, delivered_at, created_at, updated_at
     FROM catering_orders
     WHERE booking_id = $1
     ORDER BY created_at DESC`,
    [bookingId]
  );

  return result.rows;
};

const getCateringOrderById = async (orderId, requestingUser) => {
  const result = await db.query(
    `SELECT order_id, booking_id, menu_items, total_cost, guest_count, status,
            special_notes, delivery_time, confirmed_at, delivered_at, created_at, updated_at
     FROM catering_orders
     WHERE order_id = $1`,
    [orderId]
  );

  const order = result.rows[0];
  if (!order) {
    const err = new Error("Catering order not found");
    err.statusCode = 404;
    throw err;
  }

  await assertCanAccessOrder(order, requestingUser);
  return order;
};

// Enforces the order_status enum's state machine and stamps
// confirmed_at / delivered_at when those states are reached.
const updateCateringOrderStatus = async (orderId, newStatus, requestingUser) => {
  const current = await getCateringOrderById(orderId, requestingUser);

  const allowedNext = ALLOWED_TRANSITIONS[current.status] || [];
  if (!allowedNext.includes(newStatus)) {
    const err = new Error(`Cannot transition catering order from '${current.status}' to '${newStatus}'`);
    err.statusCode = 409;
    throw err;
  }

  const timestampField =
    newStatus === "confirmed" ? "confirmed_at" : newStatus === "delivered" ? "delivered_at" : null;

  const setClause = timestampField
    ? `status = $1, ${timestampField} = NOW(), updated_at = NOW()`
    : `status = $1, updated_at = NOW()`;

  const result = await db.query(
    `UPDATE catering_orders
     SET ${setClause}
     WHERE order_id = $2
     RETURNING order_id, booking_id, menu_items, total_cost, guest_count, status,
               special_notes, delivery_time, confirmed_at, delivered_at, created_at, updated_at`,
    [newStatus, orderId]
  );

  return result.rows[0];
};

module.exports = {
  getBookingOwnerId,
  createCateringOrder,
  listCateringOrdersForBooking,
  getCateringOrderById,
  updateCateringOrderStatus,
};