const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth.middleware");
const {
  getAllOrganizersHandler,
  getOrganizerByIdHandler,
  updateMyOrganizerProfileHandler,
  getMyOrganizerProfileHandler,
  getMyBookingAssignmentsHandler,
} = require("../controllers/organizer.controller");
const {
  respondToAssignmentHandler,
  getMyBookingOrganizersHandler,
} = require("../controllers/organizerResponse.controller");

router.get(
  "/me",
  authenticate,
  authorize("organizer:read"),
  getMyOrganizerProfileHandler
);
router.get(
  "/my-assignments",
  authenticate,
  authorize("organizer:read"),
  getMyBookingAssignmentsHandler
);

// Organizer accepts / declines an assignment
router.patch(
  "/my-assignments/:assignmentId/respond",
  authenticate,
  authorize("organizer:respond"),
  respondToAssignmentHandler
);

// Customer: organizers on their own bookings (must stay above /:organizerId)
router.get(
  "/my-booking-organizers",
  authenticate,
  authorize("organizer:read_own_bookings"),
  getMyBookingOrganizersHandler
);

// GET /api/organizers              → list all organizers (optional ?specialty=&isAvailable=)
router.get(
  "/",
  authenticate,
  authorize("organizer:read"),
  getAllOrganizersHandler
);

// GET /api/organizers/:organizerId → get one organizer's profile
router.get(
  "/:organizerId",
  authenticate,
  authorize("organizer:read"),
  getOrganizerByIdHandler
);

router.patch(
  "/me",
  authenticate,
  authorize("organizer:update_own"),
  updateMyOrganizerProfileHandler
);

module.exports = router;
