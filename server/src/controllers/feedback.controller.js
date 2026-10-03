const feedbackService = require("../services/feedback.service");

// POST /api/feedback
const createFeedbackHandler = async (req, res) => {
  try {
    const feedback = await feedbackService.createFeedback(req.body, req.user);
    res
      .status(201)
      .json({ message: "Feedback submitted successfully", feedback });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      message: err.message || "Failed to submit feedback",
    });
  }
};

// PATCH /api/feedback/:feedbackId/reply
const respondToFeedbackHandler = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { admin_reply } = req.body;
    const feedback = await feedbackService.respondToFeedback(
      feedbackId,
      admin_reply
    );
    res.status(200).json({ message: "Reply added", feedback });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Failed to update feedback" });
  }
};

// GET /api/feedback/public
const listPublicFeedbackHandler = async (req, res) => {
  try {
    const { limit } = req.query;
    const result = await feedbackService.listFeedback({
      isPublic: true,
      limit: limit ? Number(limit) : 6,
      offset: 0,
    });
    const sanitized = result.feedback.map((f) => ({
      feedback_id: f.feedback_id,
      rating: f.rating,
      title: f.title,
      comment: f.comment,
      customer_name: f.customer_name,
      event_type: f.event_type,
      created_at: f.created_at,
    }));
    res.status(200).json({ feedback: sanitized });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Failed to fetch feedback" });
  }
};

const parseBool = (v) =>
  v === "true" ? true : v === "false" ? false : undefined;

// GET /api/feedback
const listFeedbackHandler = async (req, res) => {
  try {
    const {
      rating,
      is_public,
      has_reply,
      has_rooms,
      event_type,
      q,
      limit,
      offset,
    } = req.query;

    const result = await feedbackService.listFeedback({
      rating: rating ? parseInt(rating, 10) : undefined,
      isPublic: parseBool(is_public),
      hasReply: parseBool(has_reply),
      hasRooms: parseBool(has_rooms),
      eventType: event_type || undefined,
      q: q ? String(q).trim() : undefined,
      limit: Math.min(parseInt(limit, 10) || 20, 100),
      offset: parseInt(offset, 10) || 0,
    });

    res.json(result); // { feedback, total }
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

// GET /api/feedback/summary
const getFeedbackSummaryHandler = async (req, res) => {
  try {
    const summary = await feedbackService.getFeedbackSummary();
    res.json({ summary });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

// PATCH /api/feedback/:feedbackId/visibility   body: { is_public: boolean }
const setFeedbackVisibilityHandler = async (req, res) => {
  try {
    const feedback = await feedbackService.setFeedbackVisibility(
      req.params.feedbackId,
      req.body.is_public
    );
    res.json({
      message: feedback.is_public ? "Feedback published." : "Feedback hidden.",
      feedback,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

module.exports = {
  createFeedbackHandler,
  listFeedbackHandler,
  respondToFeedbackHandler,
  listPublicFeedbackHandler,
  getFeedbackSummaryHandler,
  setFeedbackVisibilityHandler,
};
