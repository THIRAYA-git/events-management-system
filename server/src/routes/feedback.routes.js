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

router.use(authenticate);

// POST /api/feedback — customer submits feedback on their own completed booking
router.post("/", authorize("feedback:create"), createFeedbackHandler);

// GET /api/feedback — admin/manager list + moderation view
router.get("/", authorize("feedback:read"), listFeedbackHandler);

// GET /api/feedback/summary — headline stats for the admin page
// (static paths are registered before any /:feedbackId route)
router.get("/summary", authorize("feedback:read"), getFeedbackSummaryHandler);

// GET /api/feedback/public — testimonials for the homepage, any logged-in role
router.get("/public", listPublicFeedbackHandler);

router.get(
  "/my/replies",
  authenticate,
  restrictTo("customer"),
  getMyRepliesHandler
);
router.patch(
  "/:id/read",
  authenticate,
  restrictTo("customer"),
  markReplyReadHandler
);

// PATCH /api/feedback/:feedbackId/reply — admin/manager adds or edits a reply
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
