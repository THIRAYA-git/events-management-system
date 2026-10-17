const cateringService = require("../services/catering.service");
const { getBookingById } = require("../services/booking.service");
const { findUserById } = require("../models/user.model");
const {
  sendCateringOrderPlacedEmail,
  sendCateringStatusEmail,
} = require("../services/email.service");

// FR-017: email the booking's customer about a catering order. Called AFTER
// the response is sent and fully isolated, so it can never fail or slow the
// request that triggered it.
const notifyCustomer = async (kind, order, status) => {
  try {
    const booking = await getBookingById(order.booking_id);
    const customer = await findUserById(booking.user_id);
    if (!customer?.email) return;

    if (kind === "placed") {
      const items =
        typeof order.menu_items === "string"
          ? JSON.parse(order.menu_items)
          : order.menu_items;
      await sendCateringOrderPlacedEmail(customer.email, {
        customerName: customer.full_name,
        bookingRef: booking.booking_ref,
        orderId: order.order_id,
        items,
        totalCost: order.total_cost,
        guestCount: order.guest_count,
        deliveryTime: order.delivery_time
          ? String(order.delivery_time).slice(0, 16)
          : "",
      });
    } else if (kind === "status") {
      await sendCateringStatusEmail(customer.email, {
        customerName: customer.full_name,
        bookingRef: booking.booking_ref,
        orderId: order.order_id,
        status,
      });
    }
  } catch (err) {
    console.error("[catering.controller] Catering email failed:", err.message);
  }
};

const createCateringOrderHandler = async (req, res) => {
  try {
    const { booking_id } = req.body;
    const order = await cateringService.createCateringOrder(booking_id, req.body, req.user);
    res.status(201).json({ message: "Catering order placed successfully", order });

    notifyCustomer("placed", order);
  } catch (err) {
    res.status(err.statusCode || 500).json({
      message: err.message || "Failed to place catering order",
    });
  }
};

const listCateringOrdersForBookingHandler = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const cateringOrders = await cateringService.listCateringOrdersForBooking(bookingId, req.user);
    res.status(200).json({ cateringOrders });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || "Failed to fetch catering orders" });
  }
};

// GET /api/catering-orders — admin/front_desk/restaurant table view
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DATE_FILTERS = ["overdue", "today", "upcoming"];

const listCateringOrdersHandler = async (req, res) => {
  try {
    const { status, limit, offset, hideDeliveredThrough, dateFilter, today } = req.query;

    if (hideDeliveredThrough && !DATE_RE.test(hideDeliveredThrough)) {
      return res.status(400).json({ message: "hideDeliveredThrough must be YYYY-MM-DD" });
    }
    if (dateFilter) {
      if (!DATE_FILTERS.includes(dateFilter)) {
        return res.status(400).json({ message: "dateFilter must be overdue, today or upcoming" });
      }
      if (!today || !DATE_RE.test(today)) {
        return res.status(400).json({ message: "today (YYYY-MM-DD) is required with dateFilter" });
      }
    }

    const restaurantId = req.user.role === "restaurant" ? req.user.id : undefined;
    const result = await cateringService.listAllCateringOrders({
      status,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      restaurantId,
      hideDeliveredThrough,
      dateFilter,
      today,
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || "Failed to fetch catering orders" });
  }
};

const getCateringOrderHandler = async (req, res) => {
  try {
    const { orderId } = req.params;
    const cateringOrder = await cateringService.getCateringOrderById(orderId, req.user);
    res.status(200).json({ cateringOrder });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || "Failed to fetch catering order" });
  }
};

const updateCateringOrderStatusHandler = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const cateringOrder = await cateringService.updateCateringOrderStatus(orderId, status, req.user);
    res.status(200).json({ message: `Catering order status updated to '${status}'`, cateringOrder });

    // Skip when the customer made the change themselves (e.g. cancelling
    // their own order): they already know. Everyone else's changes notify
    // the customer.
    if (req.user.role !== "customer") {
      notifyCustomer("status", cateringOrder, status);
    }
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || "Failed to update catering order status" });
  }
};

module.exports = {
  createCateringOrderHandler,
  listCateringOrdersForBookingHandler,
  listCateringOrdersHandler,
  getCateringOrderHandler,
  updateCateringOrderStatusHandler,
};