// server/src/index.js
require("dotenv").config(); // ← MUST be first

const app = require("./app");
const db = require("./config/db");
const { startReminderJob } = require("./services/reminder.service");
const { startBackupJob } = require("./jobs/backup.job");

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await db.testConnection();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
    startReminderJob();
    startBackupJob();
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

start();
