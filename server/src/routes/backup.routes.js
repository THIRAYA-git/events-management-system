const router = require("express").Router();
const { authenticate, authorize } = require("../middleware/auth.middleware");
const c = require("../controllers/backup.controller");

router.use(authenticate, authorize("backup:manage"));
router.get("/", c.listBackupsHandler);
router.post("/", c.runBackupHandler);
router.delete("/:file", c.deleteBackupHandler);

module.exports = router;