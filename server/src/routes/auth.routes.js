// ─────────────────────────────────────────────────────────────
//  server/src/routes/auth.routes.js
//  Replaces/extends your existing auth routes file
// ─────────────────────────────────────────────────────────────
const router = require("express").Router();
const { authenticate } = require("../middleware/auth.middleware");
const {
  register,
  login,
  refresh,
  logout,
  me,
  updateOwnProfile,
  changeOwnPassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");

// Public
router.post("/register",        register);
router.post("/login",           login);
router.post("/refresh",         refresh);
router.post("/logout",          logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password",  resetPassword);

// Protected
router.get("/me", authenticate, me);
router.patch("/me", authenticate, updateOwnProfile);
router.patch("/me/password", authenticate, changeOwnPassword);

module.exports = router;