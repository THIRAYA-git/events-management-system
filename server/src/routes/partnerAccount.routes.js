const router = require("express").Router();
const { authenticate, authorize } = require("../middleware/auth.middleware");
const {
  createOrganizerHandler,
  createSponsorHandler,
} = require("../controllers/partnerAccount.controller");

router.use(authenticate);

router.post("/organizers", authorize("organizer:manage"), createOrganizerHandler);
router.post("/sponsors", authorize("sponsor:manage"), createSponsorHandler);

module.exports = router;