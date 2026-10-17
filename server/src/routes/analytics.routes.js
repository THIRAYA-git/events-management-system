// ─────────────────────────────────────────────────────────────
//  server/src/routes/analytics.routes.js
// ─────────────────────────────────────────────────────────────
const router = require("express").Router();
const { authenticate, restrictTo } = require("../middleware/auth.middleware");
const { getDashboardAnalyticsHandler } = require("../controllers/analytics.controller");

router.use(authenticate);

// Analytics is sensitive business data — admin only,
// not front_desk (unlike Bookings/Customers which front_desk can see).
router.get("/dashboard", restrictTo("admin"), getDashboardAnalyticsHandler);

module.exports = router;