// server/src/index.js

require("dotenv").config(); // ← MUST be first, before everything else

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const customerRoutes = require("./routes/customer.routes");
const hallRoutes = require("./routes/hall.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const pricingRoutes = require("./routes/pricing.routes");
const bookingRoutes = require("./routes/booking.routes");
const paymentRoutes = require("./routes/payment.routes");
const organizerRoutes = require("./routes/organizer.routes");
const sponsorRoutes = require("./routes/sponsor.routes");
const menuRoutes = require("./routes/menu.routes");
const cateringRoutes = require("./routes/catering.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const feedbackRoutes = require("./routes/feedback.routes");
const uploadRoutes = require("./routes/upload.routes");
const contactRoutes = require("./routes/contact.routes");
const staffRoutes = require("./routes/staff.routes");
const partnerAccountRoutes = require("./routes/partnerAccount.routes");
const { startReminderJob } = require("./services/reminder.service");
const reportRoutes = require("./routes/report.routes");
const notificationRoutes = require("./routes/notification.routes");


const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Rate limiter ──────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many requests. Try again later." },
});

// ── Routes ────────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/halls", hallRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/organizers", organizerRoutes);
app.use("/api/sponsors", sponsorRoutes);
app.use("/api/menu-items", menuRoutes);
app.use("/api/catering-orders", cateringRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/partner-accounts", partnerAccountRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);

// ── Health check ──────────────────────────────────────────────
const db = require("./config/db");

app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW() as server_time");
    res.json({
      message: "EMS API is running",
      project: "Events Management System for Aazath Plaza Reception Hall",
      database: "PostgreSQL Connected",
      server_time: result.rows[0].server_time,
    });
  } catch (err) {
    res.status(500).json({
      error: "DB connection failed",
      details: err.message,
    });
  }
});

// ── Start server ──────────────────────────────────────────────
const start = async () => {
  try {
    await db.testConnection();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
    startReminderJob();
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

start();
