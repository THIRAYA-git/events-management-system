const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth.middleware");
const {
  createCateringOrderHandler,
  getCateringOrderHandler,
  updateCateringOrderStatusHandler,
} = require("../controllers/catering.controller");

router.use(authenticate);

// POST /api/catering-orders   -> customer places a catering order for their own booking
router.post("/", authorize("catering:create"), createCateringOrderHandler);

// GET /api/catering-orders/:orderId               -> single order (owner customer, or admin/manager/front_desk/restaurant)
router.get("/:orderId", authorize("catering:read"), getCateringOrderHandler);

// PATCH /api/catering-orders/:orderId/status       -> advance or cancel order status
router.patch("/:orderId/status", authorize("catering:update"), updateCateringOrderStatusHandler);

module.exports = router;