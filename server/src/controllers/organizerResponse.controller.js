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

// GET /api/organizers/browse  (customer)
const browseOrganizersHandler = async (req, res) => {
  try {
    const organizers = await responseService.browseAvailableOrganizers();
    res.status(200).json({ organizers });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Failed to fetch organizers" });
  }
};

// POST /api/organizers/my-bookings/:bookingId/assign  (customer)
const assignOwnBookingOrganizerHandler = async (req, res) => {
  try {
    const bookingId = Number(req.params.bookingId);
    const { organizerId, notes } = req.body || {};
    const orgId = Number(organizerId);

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return res.status(400).json({ message: "Invalid booking id" });
    }
    if (!Number.isInteger(orgId) || orgId <= 0) {
      return res.status(400).json({ message: "organizerId is required" });
    }
    if (notes !== undefined && notes !== null && typeof notes !== "string") {
      return res.status(400).json({ message: "notes must be text" });
    }
    const cleanNotes = typeof notes === "string" ? notes.trim() : "";
    if (cleanNotes.length > 300) {
      return res
        .status(400)
        .json({ message: "notes must be 300 characters or fewer" });
    }

    const assignment = await responseService.assignOrganizerForCustomer(
      req.user.id,
      bookingId,
      orgId,
      cleanNotes
    );
    res
      .status(201)
      .json({ message: "Organizer request sent", assignment });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Failed to assign organizer" });
  }
};

module.exports = {
  respondToAssignmentHandler,
  getMyBookingOrganizersHandler,
  browseOrganizersHandler,
  assignOwnBookingOrganizerHandler,
};
