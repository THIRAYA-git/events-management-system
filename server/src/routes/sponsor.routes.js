const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth.middleware");
const { singleImage } = require("../middleware/upload.middleware");
const {
  getAllSponsorsHandler,
  getSponsorByIdHandler,
  getMySponsorRequestsHandler,
  respondToSponsorRequestHandler,
  uploadSponsorLogoHandler,
  getMySponsorProfileHandler,
} = require("../controllers/sponsor.controller");

router.use(authenticate);

// GET /api/sponsors                              → browse sponsors
router.get("/", authorize("sponsor:read"), getAllSponsorsHandler);

// GET /api/sponsors/my-requests                  → sponsor's own incoming requests
router.get("/my-requests", authorize("sponsor_request:read_own"), getMySponsorRequestsHandler);

// GET /api/sponsors/me → sponsor's own profile
router.get("/me", authorize("sponsor:read"), getMySponsorProfileHandler);

// GET /api/sponsors/:sponsorId                   → single sponsor profile
router.get("/:sponsorId", authorize("sponsor:read"), getSponsorByIdHandler);

// PATCH /api/sponsors/requests/:requestId/respond → sponsor/staff accept or reject
router.patch("/requests/:requestId/respond", authorize("sponsor_request:respond"), respondToSponsorRequestHandler);

// PATCH /api/sponsors/me/logo → sponsor uploads/replaces their own logo
router.patch("/me/logo", authorize("sponsor:update_own"), singleImage("logo"), uploadSponsorLogoHandler);

module.exports = router;