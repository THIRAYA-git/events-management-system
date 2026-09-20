const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth.middleware");
const {
  createFeedbackHandler,
  listFeedbackHandler,
  respondToFeedbackHandler,
} = require("../controllers/feedback.controller");

router.use(authenticate);

// POST /api/feedback — customer submits feedback on their own completed booking
router.post("/", authorize("feedback:create"), createFeedbackHandler);

// GET /api/feedback — staff list/moderation view
router.get("/", authorize("feedback:read"), listFeedbackHandler);

// PATCH /api/feedback/:feedbackId/reply — staff adds an admin reply
router.patch("/:feedbackId/reply", authorize("feedback:read"), respondToFeedbackHandler);

module.exports = router;