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

module.exports = {
  createFeedbackHandler,
  listFeedbackHandler,
  respondToFeedbackHandler,
};