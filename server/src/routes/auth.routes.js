// ─────────────────────────────────────────────────────────────
//  server/src/routes/auth.routes.js
//  Replaces/extends your existing auth routes file
// ─────────────────────────────────────────────────────────────
const router = require("express").Router();
const { authenticate } = require("../middleware/auth.middleware");
const {
  register,
  login,
  googleLoginHandler,
  refresh,
  logout,
  me,
  updateOwnProfile,
  changeOwnPassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");
const rateLimit = require("express-rate-limit");

// Strict limit only on abuse-prone endpoints (login, register, reset…)
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 20 : 1000,
  message: { message: "Too many requests. Try again later." },
});

// Public
router.post("/register",        strictLimiter, register);
router.post("/login",           strictLimiter, login);
router.post("/google",          strictLimiter, googleLoginHandler);
router.post("/refresh",         refresh);
router.post("/logout",          logout);
router.post("/forgot-password", strictLimiter, forgotPassword);
router.post("/reset-password",  strictLimiter, resetPassword);

// Protected
router.get("/me", authenticate, me);
router.patch("/me", authenticate, updateOwnProfile);
router.patch("/me/password", authenticate, changeOwnPassword);

module.exports = router;