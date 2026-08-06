const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth.middleware");
const {
  getAllOrganizersHandler,
  getOrganizerByIdHandler,
} = require("../controllers/organizer.controller");

// GET /api/organizers              → list all organizers (optional ?specialty=&isAvailable=)
router.get("/", authenticate, authorize("organizer:read"), getAllOrganizersHandler);

// GET /api/organizers/:organizerId → get one organizer's profile
router.get("/:organizerId", authenticate, authorize("organizer:read"), getOrganizerByIdHandler);

module.exports = router;