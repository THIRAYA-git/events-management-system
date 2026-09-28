const feedbackService = require("../services/feedback.service");

// POST /api/feedback
const createFeedbackHandler = async (req, res) => {
  try {
    const feedback = await feedbackService.createFeedback(req.body, req.user);
    res.status(201).json({ message: "Feedback submitted successfully", feedback });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      message: err.message || "Failed to submit feedback",
    });
  }
};

// GET /api/feedback?rating=&isPublic=&limit=&offset=
const listFeedbackHandler = async (req, res) => {
  try {
    const { rating, isPublic, limit, offset } = req.query;
    const result = await feedbackService.listFeedback({
      rating: rating ? Number(rating) : undefined,
      isPublic: isPublic !== undefined ? isPublic === "true" : undefined,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || "Failed to fetch feedback" });
  }
};

// PATCH /api/feedback/:feedbackId/reply
const respondToFeedbackHandler = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { admin_reply } = req.body;
    const feedback = await feedbackService.respondToFeedback(feedbackId, admin_reply);
    res.status(200).json({ message: "Reply added", feedback });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || "Failed to update feedback" });
  }
};

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
    res.status(err.statusCode || 500).json({ message: err.message || "Failed to fetch feedback" });
  }
};

module.exports = {
  createFeedbackHandler,
  listFeedbackHandler,
  respondToFeedbackHandler,
  listPublicFeedbackHandler,
};