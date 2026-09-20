// ─────────────────────────────────────────────────────────────
//  server/src/controllers/auth.controller.js
//  Complete replacement for your existing auth.controller.js
// ─────────────────────────────────────────────────────────────
const crypto = require("crypto");

const {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../services/auth.service");

const {
  findUserByEmail,
  findUserById,
  createUser,
  updateLastLogin,
  incrementLoginAttempts,
  saveRefreshToken,
  clearRefreshToken,
  findUserByRefreshToken,
  createPasswordResetToken,
  findUserByResetToken,
  markResetTokenUsed,
  updateProfile,
  updatePassword,
} = require("../models/user.model");

const { query }          = require("../config/db");
const { getPermissions } = require("../utils/rbac.util");

// Roles a self-registering user is allowed to pick
const PUBLIC_ROLES = ["customer", "organizer", "sponsor", "restaurant"];

// Cookie options for refresh token
const COOKIE_OPTS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge:   7 * 24 * 60 * 60 * 1000,   // 7 days
};

// Write to your audit_log table
const audit = async (user_id, action, record_id, new_values, ip) => {
  try {
    await query(
      `INSERT INTO audit_log (user_id, action, table_name, record_id, new_values, ip_address)
       VALUES ($1, $2, 'users', $3, $4, $5)`,
      [user_id, action, record_id, JSON.stringify(new_values), ip]
    );
  } catch (e) {
    console.error("[audit_log]", e.message);
  }
};

const getIp = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0] || req.socket?.remoteAddress || "unknown";

// ── POST /api/auth/register ───────────────────────────────────
const register = async (req, res) => {
  try {
    const { full_name, email, password, phone, role } = req.body;

    // Input validation
    if (!full_name || !email || !password) {
      return res.status(400).json({ message: "full_name, email and password are required." });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    // ✅ SECURITY FIX: only allow safe public roles on self-register
    // Admin can assign any role only if they are logged in as admin
    const assignedRole =
      role && PUBLIC_ROLES.includes(role)
        ? role
        : role && req.user?.role === "admin"
        ? role
        : "customer";

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists." });
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser(full_name, email, passwordHash, assignedRole, phone || null);

    // Issue tokens
    const accessToken  = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    await saveRefreshToken(user.user_id, refreshToken);

    await audit(user.user_id, "CREATE_USER", user.user_id, { email: user.email, role: user.role }, getIp(req));

    res.cookie("refreshToken", refreshToken, COOKIE_OPTS);
    return res.status(201).json({
      message: "User registered successfully.",
      user: {
        id:          user.user_id,
        name:        user.full_name,
        email:       user.email,
        phone:       user.phone,
        role:        user.role,
        is_verified: user.is_verified,
      },
      accessToken,
      permissions: getPermissions(user.role),
    });
  } catch (error) {
    console.error("[register]", error);
    return res.status(500).json({ error: error.message });
  }
};

// ── POST /api/auth/login ──────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // ✅ FIX: Check account lockout (uses your locked_until column)
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const unlockTime = new Date(user.locked_until).toLocaleTimeString();
      return res.status(423).json({
        message: `Account locked after too many failed attempts. Try again after ${unlockTime}.`,
      });
    }

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      // ✅ FIX: Increment login_attempts on wrong password
      await incrementLoginAttempts(user.user_id);
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // ✅ FIX: Reset attempts + update last_login on success
    await updateLastLogin(user.user_id);

    // Issue tokens
    const accessToken  = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    await saveRefreshToken(user.user_id, refreshToken);

    await audit(user.user_id, "LOGIN", user.user_id, { email: user.email, role: user.role }, getIp(req));

    res.cookie("refreshToken", refreshToken, COOKIE_OPTS);
    return res.json({
      message: "Logged in successfully.",
      user: {
        id:            user.user_id,
        name:          user.full_name,
        email:         user.email,
        phone:         user.phone,
        role:          user.role,
        is_verified:   user.is_verified,
        profile_image: user.profile_image,
        last_login:    user.last_login,
      },
      accessToken,
      permissions: getPermissions(user.role),
    });
  } catch (error) {
    console.error("[login]", error);
    return res.status(500).json({ error: error.message });
  }
};

// ── POST /api/auth/refresh ────────────────────────────────────
const refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "Refresh token missing." });
    }

    try {
      verifyRefreshToken(token);
    } catch {
      return res.status(401).json({ message: "Invalid or expired refresh token." });
    }

    const user = await findUserByRefreshToken(token);
    if (!user) {
      return res.status(401).json({ message: "Refresh token reuse detected. Please log in again." });
    }

    // Rotate: issue new pair
    const accessToken     = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);
    await saveRefreshToken(user.user_id, newRefreshToken);

    res.cookie("refreshToken", newRefreshToken, COOKIE_OPTS);
    return res.json({ accessToken });
  } catch (error) {
    console.error("[refresh]", error);
    return res.status(500).json({ error: error.message });
  }
};

// ── POST /api/auth/logout ─────────────────────────────────────
const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      const user = await findUserByRefreshToken(token);
      if (user) {
        await clearRefreshToken(user.user_id);
        await audit(user.user_id, "LOGOUT", user.user_id, {}, getIp(req));
      }
    }
    res.clearCookie("refreshToken", { httpOnly: true, sameSite: "strict" });
    return res.json({ message: "Logged out successfully." });
  } catch (error) {
    console.error("[logout]", error);
    return res.status(500).json({ error: error.message });
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────
const me = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.json({
      user,
      permissions: getPermissions(user.role),
    });
  } catch (error) {
    console.error("[me]", error);
    return res.status(500).json({ error: error.message });
  }
};

// ── POST /api/auth/forgot-password ───────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await findUserByEmail(email);
    if (user) {
      const token   = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await createPasswordResetToken(user.user_id, token, expires);

      // TODO: plug in nodemailer / SendGrid here to email the link
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
      console.log(`[forgotPassword] Reset link for ${email}: ${resetLink}`);
    }

    // Always return 200 — never reveal whether email exists
    return res.json({ message: "If that email is registered, a reset link has been sent." });
  } catch (error) {
    console.error("[forgotPassword]", error);
    return res.status(500).json({ error: error.message });
  }
};

// ── POST /api/auth/reset-password ────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and new password are required." });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    const record = await findUserByResetToken(token);
    if (!record) {
      return res.status(400).json({ message: "Reset token is invalid or has expired." });
    }

    const passwordHash = await hashPassword(password);
    await updatePassword(record.user_id, passwordHash);
    await markResetTokenUsed(token);

    return res.json({ message: "Password reset successfully. Please log in." });
  } catch (error) {
    console.error("[resetPassword]", error);
    return res.status(500).json({ error: error.message });
  }
};

// ── PATCH /api/auth/me ──────────────────────────────────────────
// Self-service profile update (name/phone only — not email or role).
const updateOwnProfile = async (req, res) => {
  try {
    const { full_name, phone } = req.body;
    if (!full_name || !full_name.trim()) {
      return res.status(400).json({ message: "full_name is required." });
    }

    const user = await updateProfile(req.user.id, { full_name: full_name.trim(), phone });
    return res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("[updateOwnProfile]", error);
    return res.status(500).json({ error: error.message });
  }
};

// ── PATCH /api/auth/me/password ─────────────────────────────────
// Self-service password change while logged in — distinct from the
// forgot/reset-password flow, which is for a locked-out user.
const changeOwnPassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res
        .status(400)
        .json({ message: "current_password and new_password are required." });
    }
    if (new_password.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters." });
    }

    // Re-fetch with password_hash included (findUserById omits it by design)
    const { rows } = await query(`SELECT password_hash FROM users WHERE user_id = $1`, [
      req.user.id,
    ]);
    const currentHash = rows[0]?.password_hash;
    if (!currentHash) {
      return res.status(404).json({ message: "User not found." });
    }

    const valid = await comparePassword(current_password, currentHash);
    if (!valid) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    const newHash = await hashPassword(new_password);
    await updatePassword(req.user.id, newHash);

    return res.json({ message: "Password changed successfully. Please log in again." });
  } catch (error) {
    console.error("[changeOwnPassword]", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  me,
  updateOwnProfile,
  changeOwnPassword,
  forgotPassword,
  resetPassword,
};