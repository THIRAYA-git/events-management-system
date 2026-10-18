const express = require("express");
const router = express.Router();
const { authenticate, authorize, restrictTo } = require("../middleware/auth.middleware");
const {
  createFeedbackHandler,
  listFeedbackHandler,
  respondToFeedbackHandler,
  listPublicFeedbackHandler,
  getFeedbackSummaryHandler,
  setFeedbackVisibilityHandler,
  getMyRepliesHandler,
  markReplyReadHandler,
} = require("../controllers/feedback.controller");

// ─────────────────────────────────────────────────────────────
// PUBLIC routes — must be registered BEFORE router.use(authenticate)
// ─────────────────────────────────────────────────────────────

// GET /api/feedback/public — testimonials for the homepage (no login needed)
router.get("/public", listPublicFeedbackHandler);

// ─────────────────────────────────────────────────────────────
// Everything below requires a logged-in user
// ─────────────────────────────────────────────────────────────
router.use(authenticate);

// POST /api/feedback — customer submits feedback on their own completed booking
router.post("/", authorize("feedback:create"), createFeedbackHandler);

// GET /api/feedback — admin list + moderation view
router.get("/", authorize("feedback:read"), listFeedbackHandler);

// GET /api/feedback/summary — headline stats for the admin page
// (static paths are registered before any /:feedbackId route)
router.get("/summary", authorize("feedback:read"), getFeedbackSummaryHandler);

// GET /api/feedback/my/replies — customer's own admin replies
router.get("/my/replies", restrictTo("customer"), getMyRepliesHandler);

// PATCH /api/feedback/:id/read — customer marks an admin reply as read
router.patch("/:id/read", restrictTo("customer"), markReplyReadHandler);

// PATCH /api/feedback/:feedbackId/reply — admin adds or edits a reply
router.patch(
  "/:feedbackId/reply",
  authorize("feedback:manage"),
  respondToFeedbackHandler
);

// PATCH /api/feedback/:feedbackId/visibility — moderation (hide / publish)
router.patch(
  "/:feedbackId/visibility",
  authorize("feedback:manage"),
  setFeedbackVisibilityHandler
);

module.exports = router;
