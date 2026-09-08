const cateringService = require("../services/catering.service");

const createCateringOrderHandler = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const order = await cateringService.createCateringOrder(bookingId, req.body, req.user);
    res.status(201).json({ message: "Catering order created", cateringOrder: order });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || "Failed to create catering order" });
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
  getCateringOrderHandler,
  updateCateringOrderStatusHandler,
};