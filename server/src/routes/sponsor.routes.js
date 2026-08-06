const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth.middleware");
const {
  getAllSponsorsHandler,
  getSponsorByIdHandler,
  getMySponsorRequestsHandler,
  respondToSponsorRequestHandler,
} = require("../controllers/sponsor.controller");

router.use(authenticate);

// GET /api/sponsors                              → browse sponsors
router.get("/", authorize("sponsor:read"), getAllSponsorsHandler);

// GET /api/sponsors/my-requests                  → sponsor's own incoming requests
router.get("/my-requests", authorize("sponsor_request:read_own"), getMySponsorRequestsHandler);

// GET /api/sponsors/:sponsorId                   → single sponsor profile
router.get("/:sponsorId", authorize("sponsor:read"), getSponsorByIdHandler);

// PATCH /api/sponsors/requests/:requestId/respond → sponsor/staff accept or reject
router.patch("/requests/:requestId/respond", authorize("sponsor_request:respond"), respondToSponsorRequestHandler);

module.exports = router;