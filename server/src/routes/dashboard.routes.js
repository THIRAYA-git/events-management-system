const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth.middleware");
const { getDashboardAttentionHandler } = require("../controllers/dashboardAttention.controller");

router.get(
  "/attention",
  authenticate,
  authorize("dashboard:attention"),
  getDashboardAttentionHandler
);

module.exports = router;
