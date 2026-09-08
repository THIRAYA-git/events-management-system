const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth.middleware");
const {
  getCateringOrderHandler,
  updateCateringOrderStatusHandler,
} = require("../controllers/catering.controller");

router.use(authenticate);

// GET /api/catering-orders/:orderId               -> single order (owner customer, or admin/manager/front_desk/restaurant)
router.get("/:orderId", authorize("catering:read"), getCateringOrderHandler);

// PATCH /api/catering-orders/:orderId/status       -> advance or cancel order status
router.patch("/:orderId/status", authorize("catering:update"), updateCateringOrderStatusHandler);

module.exports = router;