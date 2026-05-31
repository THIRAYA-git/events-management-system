// server/src/index.js

const express      = require("express");
const cors         = require("cors");
const dotenv       = require("dotenv");
const cookieParser = require("cookie-parser");
const rateLimit    = require("express-rate-limit");

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware (ORDER MATTERS — must come before routes) ──────
app.use(cors({
  origin:      process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,            // required so cookies work cross-origin
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Rate limiter (define BEFORE using it) ─────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,    // 15 minutes
  max:      20,
  message:  { message: "Too many requests. Try again later." },
});

// ── Routes (import ONCE — no duplicate requires) ──────────────
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

app.use("/api/auth",  authLimiter, authRoutes);
app.use("/api/users", userRoutes);

// ── Health check ──────────────────────────────────────────────
const db = require("./config/db");

app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW() as server_time");
    res.json({
      message:     "EMS API is running",
      project:     "Events Management System for Aazath Plaza Reception Hall",
      database:    "PostgreSQL Connected",
      server_time: result.rows[0].server_time,
    });
  } catch (err) {
    res.status(500).json({
      error:   "DB connection failed",
      details: err.message,
    });
  }
});

// ── Start server ──────────────────────────────────────────────
const start = async () => {
  try {
    await db.testConnection();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

start();