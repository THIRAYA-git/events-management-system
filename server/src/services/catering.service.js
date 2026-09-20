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
  const { menu_items, guest_count, special_notes = null, delivery_time = null } = data;

  if (!bookingId || !Array.isArray(menu_items) || menu_items.length === 0) {
    const err = new Error("booking_id and at least one menu item are required.");
    err.statusCode = 400;
    throw err;
  }

  // Ownership check: customer may only order for their own booking
  const ownerId = await getBookingOwnerId(bookingId);
  if (ownerId === null) {
    const err = new Error("Booking not found");
    err.statusCode = 404;
    throw err;
  }
  if (requestingUser.role === "customer" && ownerId !== requestingUser.id) {
    const err = new Error("You do not own this booking");
    err.statusCode = 403;
    throw err;
  }

  // Fetch and validate each menu item; snapshot real name/price server-side
  // rather than trusting client-supplied unit_price.
  const itemIds = menu_items.map((i) => i.item_id);
  const menuResult = await db.query(
    `SELECT item_id, item_name, price, is_available
     FROM menu_items
     WHERE item_id = ANY($1::int[])`,
    [itemIds]
  );
  const menuMap = new Map(menuResult.rows.map((r) => [r.item_id, r]));

  const snapshotItems = menu_items.map(({ item_id, quantity, discount = 0 }) => {
    const menuItem = menuMap.get(item_id);
    if (!menuItem) {
      const err = new Error(`Menu item ${item_id} not found.`);
      err.statusCode = 404;
      throw err;
    }
    if (!menuItem.is_available) {
      const err = new Error(`"${menuItem.item_name}" is currently unavailable.`);
      err.statusCode = 409;
      throw err;
    }
    if (!quantity || quantity <= 0) {
      const err = new Error(`Invalid quantity for "${menuItem.item_name}".`);
      err.statusCode = 400;
      throw err;
    }
    const unit_price = Number(menuItem.price);
    const subtotal = unit_price * quantity - discount;
    return {
      item_id: menuItem.item_id,
      item_name: menuItem.item_name,
      quantity,
      unit_price,
      discount,
      subtotal,
    };
  });

  const totalCost = snapshotItems.reduce((sum, line) => sum + line.subtotal, 0);

  const result = await db.query(
    `INSERT INTO catering_orders
       (booking_id, menu_items, total_cost, guest_count, status, special_notes, delivery_time)
     VALUES ($1, $2, $3, $4, 'pending', $5, $6)
     RETURNING order_id, booking_id, menu_items, total_cost, guest_count, status,
               special_notes, delivery_time, confirmed_at, delivered_at, created_at, updated_at`,
    [bookingId, JSON.stringify(snapshotItems), totalCost, guest_count, special_notes, delivery_time]
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

// Admin/manager/front_desk/restaurant view across every booking — used by
// the admin Catering Orders table, not scoped to a single customer.
const listAllCateringOrders = async ({ status, limit = 20, offset = 0 } = {}) => {
  const conditions = ["1=1"];
  const params = [];

  if (status) {
    params.push(status);
    conditions.push(`co.status = $${params.length}`);
  }

  const where = conditions.join(" AND ");

  params.push(limit);
  const limitParam = `$${params.length}`;
  params.push(offset);
  const offsetParam = `$${params.length}`;

  const result = await db.query(
    `SELECT co.order_id, co.booking_id, co.menu_items, co.total_cost, co.guest_count, co.status,
            co.special_notes, co.delivery_time, co.confirmed_at, co.delivered_at,
            co.created_at, co.updated_at,
            b.booking_ref, b.event_type, u.full_name AS customer_name
     FROM catering_orders co
     JOIN bookings b ON b.booking_id = co.booking_id
     JOIN users u ON u.user_id = b.user_id
     WHERE ${where}
     ORDER BY co.created_at DESC
     LIMIT ${limitParam} OFFSET ${offsetParam}`,
    params
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS count FROM catering_orders co WHERE ${where}`,
    params.slice(0, params.length - 2)
  );

  return {
    orders: result.rows,
    total: countResult.rows[0].count,
    limit,
    offset,
  };
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
  listAllCateringOrders,
  getCateringOrderById,
  updateCateringOrderStatus,
};