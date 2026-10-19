const cron = require("node-cron");
const db = require("../config/db");
const { createBackup } = require("../services/backup.service");

async function logResult(action, details) {
  try {
    // adjust the columns to match your audit_log table
    await db.query(
      "INSERT INTO audit_log (action, details) VALUES ($1, $2)",
      [action, JSON.stringify(details)]
    );
  } catch (e) {
    console.error("audit_log write failed:", e.message);
  }
}

function startBackupJob() {
  cron.schedule("0 2 * * *", async () => {
    try {
      const result = await createBackup();
      console.log("[backup] OK", result);
      await logResult("DB_BACKUP_OK", result);
    } catch (err) {
      console.error("[backup] FAILED", err.message);
      await logResult("DB_BACKUP_FAILED", { error: err.message });
    }
  }, { timezone: "Asia/Colombo" });
  console.log("[backup] nightly job scheduled for 02:00 (Asia/Colombo)");
}

module.exports = { startBackupJob };