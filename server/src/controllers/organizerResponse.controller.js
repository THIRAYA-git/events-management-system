const responseService = require("../services/organizerResponse.service");

// PATCH /api/organizers/my-assignments/:assignmentId/respond
const respondToAssignmentHandler = async (req, res) => {
  try {
    const assignmentId = Number(req.params.assignmentId);
    const { action, reason } = req.body || {};

    if (!Number.isInteger(assignmentId) || assignmentId <= 0) {
      return res.status(400).json({ message: "Invalid assignment id" });
    }
    if (action !== "accept" && action !== "decline") {
      return res
        .status(400)
        .json({ message: "action must be 'accept' or 'decline'" });
    }
    if (reason !== undefined && reason !== null && typeof reason !== "string") {
      return res.status(400).json({ message: "reason must be text" });
    }
    const cleanReason = typeof reason === "string" ? reason.trim() : "";
    if (cleanReason.length > 500) {
      return res
        .status(400)
        .json({ message: "reason must be 500 characters or fewer" });
    }

    const assignment = await responseService.respondToAssignment(
      req.user.id,
      assignmentId,
      action,
      cleanReason
    );
    res.status(200).json({
      message: action === "accept" ? "Request accepted" : "Request declined",
      assignment,
    });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Failed to respond to request" });
  }
};

// GET /api/organizers/my-booking-organizers  (customer)
const getMyBookingOrganizersHandler = async (req, res) => {
  try {
    const organizers = await responseService.getOrganizersForCustomer(req.user.id);
    res.status(200).json({ organizers });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Failed to fetch booking organizers" });
  }
};

module.exports = { respondToAssignmentHandler, getMyBookingOrganizersHandler };
