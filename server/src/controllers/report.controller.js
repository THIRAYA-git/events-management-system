// server/src/controllers/report.controller.js
const reportService = require("../services/report.service");
const { buildReportPdf } = require("../utils/reportPdf.util");

const handleError = (res, err, label) => {
  const status = err.statusCode || 500;
  if (status === 500) console.error(`${label}:`, err);
  return res.status(status).json({
    message: status === 500 ? "Failed to generate report." : err.message,
  });
};

// GET /api/reports?period=daily|weekly|monthly|annual&date=YYYY-MM-DD
const getReportHandler = async (req, res) => {
  try {
    const { period = "monthly", date } = req.query;
    const report = await reportService.generateReport({ period, date });
    return res.status(200).json({ report });
  } catch (err) {
    return handleError(res, err, "getReportHandler");
  }
};

// GET /api/reports/export?period=...&date=...  -> application/pdf (FR-022)
const exportReportHandler = async (req, res) => {
  try {
    const { period = "monthly", date } = req.query;
    const report = await reportService.generateReport({ period, date });
    const pdf = await buildReportPdf(report);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="aazath-plaza-${period}-report-${report.range.from}.pdf"`,
      "Content-Length": pdf.length,
    });
    return res.status(200).send(pdf);
  } catch (err) {
    return handleError(res, err, "exportReportHandler");
  }
};

module.exports = { getReportHandler, exportReportHandler };