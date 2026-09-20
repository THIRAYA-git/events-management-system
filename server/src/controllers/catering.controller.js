const cateringService = require("../services/catering.service");

const createCateringOrderHandler = async (req, res) => {
  try {
    const { booking_id } = req.body;
    const order = await cateringService.createCateringOrder(booking_id, req.body, req.user);
    res.status(201).json({ message: "Catering order placed successfully", order });
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

// GET /api/catering-orders — admin/manager/front_desk/restaurant table view
const listCateringOrdersHandler = async (req, res) => {
  try {
    const { status, limit, offset } = req.query;
    const result = await cateringService.listAllCateringOrders({
      status,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
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