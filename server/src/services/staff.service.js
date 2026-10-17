const { query } = require("../config/db");
const { hashPassword } = require("./auth.service");

const STAFF_ROLES = ["admin", "front_desk"];
const STAFF_LIMIT = 10;

const COLS = `user_id, full_name, email, phone, role, profile_image, is_active,
  is_verified, login_attempts, locked_until, last_login, created_at, updated_at`;

const httpError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const parseId = (raw) => {
  const id = parseInt(raw, 10);
  if (Number.isNaN(id)) throw httpError(400, "Invalid user id.");
  return id;
};

const getActiveStaffCount = async () => {
  const { rows } = await query(
    `SELECT COUNT(*)::int AS count FROM users
     WHERE role::text = ANY($1::text[]) AND is_active = true`,
    [STAFF_ROLES]
  );
  return rows[0].count;
};

const limitWarning = async () => {
  const count = await getActiveStaffCount();
  return count > STAFF_LIMIT
    ? `Active staff (${count}) now exceeds the expected maximum of ${STAFF_LIMIT}.`
    : undefined;
};

const getStaffOrThrow = async (id) => {
  const { rows } = await query(
    `SELECT ${COLS} FROM users WHERE user_id = $1 AND role::text = ANY($2::text[])`,
    [id, STAFF_ROLES]
  );
  if (!rows[0]) throw httpError(404, "Staff member not found.");
  return rows[0];
};

// Blocks any action that would leave the system with no active admin
const assertNotLastAdmin = async (target) => {
  if (target.role !== "admin" || !target.is_active) return;
  const { rows } = await query(
    `SELECT COUNT(*)::int AS count FROM users
     WHERE role::text = 'admin' AND is_active = true AND user_id <> $1`,
    [target.user_id]
  );
  if (rows[0].count === 0) {
    throw httpError(400, "At least one active admin account must remain.");
  }
};

// ── List ──────────────────────────────────────────────────────
const listStaff = async ({ search, role, status } = {}) => {
  const params = [STAFF_ROLES];
  let where = `role::text = ANY($1::text[])`;

  if (role && STAFF_ROLES.includes(role)) {
    params.push(role);
    where += ` AND role::text = $${params.length}`;
  }
  if (status === "active") where += ` AND is_active = true`;
  if (status === "inactive") where += ` AND is_active = false`;
  if (search && search.trim()) {
    params.push(`%${search.trim()}%`);
    where += ` AND (full_name ILIKE $${params.length} OR email ILIKE $${params.length})`;
  }

  const { rows } = await query(
    `SELECT ${COLS} FROM users WHERE ${where}
     ORDER BY is_active DESC, role::text, full_name`,
    params
  );
  const activeStaff = await getActiveStaffCount();
  return { staff: rows, summary: { activeStaff, limit: STAFF_LIMIT } };
};

// ── Create ────────────────────────────────────────────────────
const createStaff = async ({ full_name, email, phone, role, password }) => {
  if (!full_name?.trim() || !email?.trim() || !password) {
    throw httpError(400, "full_name, email and password are required.");
  }
  if (!STAFF_ROLES.includes(role)) {
    throw httpError(400, `Role must be one of: ${STAFF_ROLES.join(", ")}.`);
  }
  if (password.length < 8) {
    throw httpError(400, "Password must be at least 8 characters.");
  }

  const dup = await query(`SELECT 1 FROM users WHERE LOWER(email) = LOWER($1)`, [
    email.trim(),
  ]);
  if (dup.rows.length) throw httpError(409, "Email already exists.");

  const passwordHash = await hashPassword(password);
  try {
    const { rows } = await query(
      `INSERT INTO users (full_name, email, password_hash, phone, role, is_active, is_verified)
       VALUES ($1, $2, $3, $4, $5::user_role, true, true)
       RETURNING ${COLS}`,
      [full_name.trim(), email.trim(), passwordHash, phone?.trim() || null, role]
    );
    return { user: rows[0], warning: await limitWarning() };
  } catch (err) {
    if (err.code === "23505") throw httpError(409, "Email already exists.");
    throw err;
  }
};

// ── Update (name, phone, role) ────────────────────────────────
const updateStaff = async (actorId, rawId, { full_name, phone, role }) => {
  const id = parseId(rawId);
  const target = await getStaffOrThrow(id);

  const newName = full_name !== undefined ? full_name.trim() : target.full_name;
  if (!newName) throw httpError(400, "full_name cannot be empty.");
  const newPhone = phone !== undefined ? phone?.trim() || null : target.phone;
  const newRole = role ?? target.role;
  const roleChanged = newRole !== target.role;

  if (roleChanged) {
    if (!STAFF_ROLES.includes(newRole)) {
      throw httpError(400, `Role must be one of: ${STAFF_ROLES.join(", ")}.`);
    }
    if (id === actorId) throw httpError(400, "You cannot change your own role.");
    await assertNotLastAdmin(target);
  }

  // A role change clears the refresh token so the new role takes effect on next login
  const { rows } = await query(
    `UPDATE users
     SET full_name = $1, phone = $2, role = $3::user_role, updated_at = NOW()
         ${roleChanged ? ", refresh_token = NULL" : ""}
     WHERE user_id = $4
     RETURNING ${COLS}`,
    [newName, newPhone, newRole, id]
  );
  return { user: rows[0], previousRole: target.role, roleChanged };
};

// ── Activate / deactivate (soft) ──────────────────────────────
const setStaffStatus = async (actorId, rawId, isActive) => {
  const id = parseId(rawId);
  if (typeof isActive !== "boolean") {
    throw httpError(400, "is_active must be true or false.");
  }
  const target = await getStaffOrThrow(id);

  if (!isActive) {
    if (id === actorId) throw httpError(400, "You cannot deactivate your own account.");
    await assertNotLastAdmin(target);
  }

  // Deactivating also kills the refresh token so the session cannot be renewed
  const { rows } = await query(
    `UPDATE users
     SET is_active = $1, updated_at = NOW()
         ${isActive ? ", login_attempts = 0, locked_until = NULL" : ", refresh_token = NULL"}
     WHERE user_id = $2
     RETURNING ${COLS}`,
    [isActive, id]
  );
  return { user: rows[0], warning: isActive ? await limitWarning() : undefined };
};

// ── Clear login lockout ───────────────────────────────────────
const unlockStaff = async (rawId) => {
  const id = parseId(rawId);
  await getStaffOrThrow(id);
  const { rows } = await query(
    `UPDATE users SET login_attempts = 0, locked_until = NULL, updated_at = NOW()
     WHERE user_id = $1 RETURNING ${COLS}`,
    [id]
  );
  return rows[0];
};

module.exports = {
  STAFF_ROLES,
  listStaff,
  createStaff,
  updateStaff,
  setStaffStatus,
  unlockStaff,
};