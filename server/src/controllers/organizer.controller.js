const organizerService = require("../services/organizer.service");

// GET /api/organizers
const getAllOrganizersHandler = async (req, res) => {
  try {
    const { specialty, isAvailable } = req.query;
    const filters = {};
    if (specialty) filters.specialty = specialty;
    if (isAvailable !== undefined) filters.isAvailable = isAvailable === "true";

    const organizers = await organizerService.getAllOrganizers(filters);
    res.status(200).json({ organizers });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || "Failed to fetch organizers" });
  }
};

// GET /api/organizers/:organizerId
const getOrganizerByIdHandler = async (req, res) => {
  try {
    const { organizerId } = req.params;
    const organizer = await organizerService.getOrganizerById(organizerId);

    if (!organizer) {
      return res.status(404).json({ message: "Organizer not found" });
    }

    res.status(200).json({ organizer });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || "Failed to fetch organizer" });
  }
};

// GET /api/bookings/:bookingId/organizers
const listOrganizersForBookingHandler = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const organizers = await organizerService.getOrganizersForBooking(bookingId);
    res.status(200).json({ organizers });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || "Failed to fetch booking organizers" });
  }
};

// POST /api/bookings/:bookingId/organizers
const assignOrganizerHandler = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { organizerId, roleInEvent, agreedFee, notes } = req.body;

    if (!organizerId) {
      return res.status(400).json({ message: "organizerId is required" });
    }

    const assignment = await organizerService.assignOrganizerToBooking(
      bookingId,
      organizerId,
      { roleInEvent, agreedFee, notes }
    );

    res.status(201).json({ message: "Organizer assigned to booking", assignment });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message || "Failed to assign organizer" });
  }
};

module.exports = {
  getAllOrganizersHandler,
  getOrganizerByIdHandler,
  listOrganizersForBookingHandler,
  assignOrganizerHandler,
};