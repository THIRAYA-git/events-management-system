const { can } = require("../utils/rbac.util");
const attentionService = require("../services/dashboardAttention.service");

// GET /api/dashboard/attention
const getDashboardAttentionHandler = async (req, res) => {
  try {
    const attention = await attentionService.getDashboardAttention({
      includeFeedback: can(req.user.role, "feedback:read"),
    });
    res.status(200).json({ attention });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Failed to load dashboard attention data" });
  }
};

module.exports = { getDashboardAttentionHandler };
