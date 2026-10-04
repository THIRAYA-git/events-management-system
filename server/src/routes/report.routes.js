// server/src/routes/report.routes.js
// NOTE: match the import path/names to how analytics.routes.js imports
// its auth middleware.
const express = require("express");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const {
  getReportHandler,
  exportReportHandler,
} = require("../controllers/report.controller");

const router = express.Router();

router.get("/", authenticate, authorize("report:read"), getReportHandler);
router.get(
  "/export",
  authenticate,
  authorize("report:export"),
  exportReportHandler
);

module.exports = router;