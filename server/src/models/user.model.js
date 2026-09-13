const { query } = require("../config/db");

// ── Find user by email (used in login + register) ─────────────
const findUserByEmail = async (email) => {
  const { rows } = await query(
    `SELECT * FROM users
     WHERE email = $1 AND is_active = TRUE`,
    [email.toLowerCase().trim()]
  );
  return rows[0] || null;
};

// ── Find user by user_id (safe — no password_hash) ────────────
const findUserById = async (user_id) => {
  const { rows } = await query(
    `SELECT user_id, full_name, email, phone, role,
            profile_image, is_active, is_verified,
            last_login, created_at
     FROM users WHERE user_id = $1`,
    [user_id]
  );
  return rows[0] || null;
};

// ── Create new user ───────────────────────────────────────────
const createUser = async (
  full_name,
  email,
  password_hash,
  role = "customer",
  phone = null
) => {
  const { rows } = await query(
    `INSERT INTO users (full_name, email, password_hash, role, phone)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING user_id, full_name, email, phone, role, is_active, is_verified, created_at`,
    [full_name, email.toLowerCase().trim(), password_hash, role, phone]
  );
  return rows[0];
};

// ── Update last_login + reset failed attempts ─────────────────
const updateLastLogin = async (user_id) => {
  await query(
    `UPDATE users
     SET last_login = NOW(), login_attempts = 0, locked_until = NULL
     WHERE user_id = $1`,
    [user_id]
  );
};

// ── Increment failed login attempts (lock after 5) ────────────
const incrementLoginAttempts = async (user_id) => {
  await query(
    `UPDATE users
     SET login_attempts = login_attempts + 1,
         locked_until = CASE
           WHEN login_attempts + 1 >= 5
           THEN NOW() + INTERVAL '30 minutes'
           ELSE locked_until
         END
     WHERE user_id = $1`,
    [user_id]
  );
};

// ── Save refresh token on the user row ────────────────────────
const saveRefreshToken = async (user_id, token) => {
  await query("UPDATE users SET refresh_token = $1 WHERE user_id = $2", [
    token,
    user_id,
  ]);
};

// ── Clear refresh token (logout) ──────────────────────────────
const clearRefreshToken = async (user_id) => {
  await query("UPDATE users SET refresh_token = NULL WHERE user_id = $1", [
    user_id,
  ]);
};

// ── Find user by refresh token ────────────────────────────────
const findUserByRefreshToken = async (token) => {
  const { rows } = await query(
    "SELECT * FROM users WHERE refresh_token = $1 AND is_active = TRUE",
    [token]
  );
  return rows[0] || null;
};

// ── Password reset — uses your password_reset_tokens table ────
const createPasswordResetToken = async (user_id, token, expires_at) => {
  await query("DELETE FROM password_reset_tokens WHERE user_id = $1", [
    user_id,
  ]);
  await query(
    `INSERT INTO password_reset_tokens (user_id, token, expires_at)
     VALUES ($1, $2, $3)`,
    [user_id, token, expires_at]
  );
};

const findUserByResetToken = async (token) => {
  const { rows } = await query(
    `SELECT prt.*, u.email, u.full_name, u.user_id
     FROM password_reset_tokens prt
     JOIN users u ON prt.user_id = u.user_id
     WHERE prt.token = $1
       AND prt.expires_at > NOW()
       AND prt.used_at IS NULL`,
    [token]
  );
  return rows[0] || null;
};

const markResetTokenUsed = async (token) => {
  await query(
    "UPDATE password_reset_tokens SET used_at = NOW() WHERE token = $1",
    [token]
  );
};

// ── Update password ───────────────────────────────────────────
const updatePassword = async (user_id, password_hash) => {
  await query(
    `UPDATE users
     SET password_hash = $1,
         login_attempts = 0,
         locked_until   = NULL,
         refresh_token  = NULL
     WHERE user_id = $2`,
    [password_hash, user_id]
  );
};

// ── Admin: list all users, with booking_count for pagination ──
const findAllUsers = async ({ role, page = 1, limit = 20 } = {}) => {
  const offset = (page - 1) * limit;
  const { rows } = await query(
    `SELECT u.user_id, u.full_name, u.email, u.phone, u.role,
            u.profile_image, u.is_active, u.is_verified,
            u.last_login, u.created_at,
            COUNT(b.booking_id)::integer AS booking_count
     FROM users u
     LEFT JOIN bookings b ON b.user_id = u.user_id
     WHERE ($1::text IS NULL OR u.role::text = $1::text)
     GROUP BY u.user_id
     ORDER BY u.created_at DESC
     LIMIT $2 OFFSET $3`,
    [role || null, limit, offset]
  );
  return rows;
};

// ── Admin: total user count for pagination (same filter as findAllUsers) ──
const countUsers = async ({ role } = {}) => {
  const { rows } = await query(
    `SELECT COUNT(*)::integer AS total
     FROM users
     WHERE ($1::text IS NULL OR role::text = $1::text)`,
    [role || null]
  );
  return rows[0].total;
};

// ── Admin: update user role ───────────────────────────────────
const updateUserRole = async (user_id, role) => {
  const { rows } = await query(
    `UPDATE users SET role = $1 WHERE user_id = $2
     RETURNING user_id, full_name, email, role`,
    [role, user_id]
  );
  return rows[0] || null;
};

// ── Admin: deactivate user ────────────────────────────────────
const deactivateUser = async (user_id) => {
  await query(
    "UPDATE users SET is_active = FALSE, refresh_token = NULL WHERE user_id = $1",
    [user_id]
  );
};

module.exports = {
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
  updatePassword,
  findAllUsers,
  countUsers,
  updateUserRole,
  deactivateUser,
};