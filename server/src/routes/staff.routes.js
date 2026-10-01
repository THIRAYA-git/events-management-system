const router = require("express").Router();
const { authenticate, authorize } = require("../middleware/auth.middleware");
const {
  listStaffHandler,
  createStaffHandler,
  updateStaffHandler,
  setStaffStatusHandler,
  unlockStaffHandler,
} = require("../controllers/staff.controller");

router.use(authenticate);

router.get("/", authorize("staff:read"), listStaffHandler);
router.post("/", authorize("staff:create"), createStaffHandler);
router.patch("/:id", authorize("staff:update"), updateStaffHandler);
router.patch("/:id/status", authorize("staff:deactivate"), setStaffStatusHandler);
router.patch("/:id/unlock", authorize("staff:update"), unlockStaffHandler);

module.exports = router;