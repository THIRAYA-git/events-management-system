// ─────────────────────────────────────────────────────────────
//  server/src/controllers/user.controller.js
//  NEW FILE — admin user management endpoints
// ─────────────────────────────────────────────────────────────
const {
  findAllUsers,
  findUserById,
  updateUserRole,
  deactivateUser,
} = require("../models/user.model");

const VALID_ROLES = ["customer", "front_desk", "manager", "admin", "organizer", "sponsor", "restaurant"];

// ── GET /api/users ────────────────────────────────────────────
const listUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const users = await findAllUsers({ role, page: +page, limit: +limit });
    return res.json({ users, page: +page });
  } catch (error) {
    console.error("[listUsers]", error);
    return res.status(500).json({ error: error.message });
  }
};

// ── GET /api/users/:id ────────────────────────────────────────
const getUser = async (req, res) => {
  try {
    const user = await findUserById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
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
