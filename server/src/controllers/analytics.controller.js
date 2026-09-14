// ─────────────────────────────────────────────────────────────
//  server/src/controllers/analytics.controller.js
// ─────────────────────────────────────────────────────────────
const { getDashboardAnalytics } = require("../services/analytics.service");

// ── GET /api/analytics/dashboard?date_from=&date_to= ───────────
const getDashboardAnalyticsHandler = async (req, res, next) => {
  try {
    const { date_from, date_to } = req.query;

    const data = await getDashboardAnalytics({
      dateFrom: date_from || null,
      dateTo: date_to || null,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardAnalyticsHandler };