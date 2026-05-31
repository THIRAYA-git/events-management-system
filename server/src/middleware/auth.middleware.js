// ─────────────────────────────────────────────────────────────
//  server/src/middleware/auth.middleware.js
//  NEW FILE — protect routes + check RBAC permissions
// ─────────────────────────────────────────────────────────────
const { verifyToken }  = require("../services/auth.service");
const { can }          = require("../utils/rbac.util");

// ── Verify Bearer token ───────────────────────────────────────
const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access token missing. Please log in." });
  }

  const token = authHeader.split(" ")[1];

  try {
    req.user = verifyToken(token);   // → { id, email, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token expired.", code: "TOKEN_EXPIRED" });
    }
    return res.status(401).json({ message: "Invalid access token." });
  }
};

// ── Check RBAC permission ─────────────────────────────────────
//  Usage: router.get("/bookings", authenticate, authorize("booking:read_all"), handler)
const authorize = (permission) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated." });
  }
  if (!can(req.user.role, permission)) {
    return res.status(403).json({
      message: `Access denied. Your role '${req.user.role}' cannot '${permission}'.`,
    });
  }
  next();
};

// ── Restrict to specific roles ────────────────────────────────
//  Usage: router.delete("/:id", authenticate, restrictTo("admin"), handler)
const restrictTo = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated." });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      message: `Access denied. Requires role: ${roles.join(" or ")}.`,
    });
  }
  next();
};

module.exports = { authenticate, authorize, restrictTo };
