// ─────────────────────────────────────────────────────────────
//  server/src/controllers/user.controller.js
//  Admin user management endpoints
// ─────────────────────────────────────────────────────────────
const {
  findAllUsers,
  countUsers,
  findUserById,
  updateUserRole,
  deactivateUser,
} = require("../models/user.model");

const VALID_ROLES = ["customer", "front_desk", "admin", "organizer", "sponsor", "restaurant"];

// Front desk may only see customer accounts (never staff, partners or admins)
const isFrontDesk = (req) => req.user.role === "front_desk";

// ── GET /api/users ────────────────────────────────────────────
const listUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const role = isFrontDesk(req) ? "customer" : req.query.role;
    const [users, total] = await Promise.all([
      findAllUsers({ role, page: +page, limit: +limit }),
      countUsers({ role }),
    ]);
    return res.json({
      users,
      page: +page,
      limit: +limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / +limit)),
    });
  } catch (error) {
    console.error("[listUsers]", error);
    return res.status(500).json({ error: error.message });
  }
};

// ── GET /api/users/:id ────────────────────────────────────────
const getUser = async (req, res) => {
  try {
    const user = await findUserById(req.params.id);
    // 404 (not 403) so front desk can't probe which non-customer ids exist
    if (!user || (isFrontDesk(req) && user.role !== "customer")) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.json({ user });
  } catch (error) {
    console.error("[getUser]", error);
    return res.status(500).json({ error: error.message });
  }
};

// ── PATCH /api/users/:id/role ─────────────────────────────────
const changeRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ message: `Role must be one of: ${VALID_ROLES.join(", ")}.` });
    }
    if (+req.params.id === req.user.id) {
      return res.status(400).json({ message: "You cannot change your own role." });
    }
    const user = await updateUserRole(req.params.id, role);
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.json({ message: "Role updated.", user });
  } catch (error) {
    console.error("[changeRole]", error);
    return res.status(500).json({ error: error.message });
  }
};

// ── DELETE /api/users/:id ─────────────────────────────────────
const removeUser = async (req, res) => {
  try {
    if (+req.params.id === req.user.id) {
      return res.status(400).json({ message: "You cannot deactivate your own account." });
    }
    await deactivateUser(req.params.id);
    return res.json({ message: "User deactivated." });
  } catch (error) {
    console.error("[removeUser]", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { listUsers, getUser, changeRole, removeUser };
