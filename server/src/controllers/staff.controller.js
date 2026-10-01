const staffService = require("../services/staff.service");
const { query } = require("../config/db");

const getIp = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0] || req.socket?.remoteAddress || "unknown";

const audit = async (req, action, recordId, newValues) => {
  try {
    await query(
      `INSERT INTO audit_log (user_id, action, table_name, record_id, new_values, ip_address)
       VALUES ($1, $2, 'users', $3, $4, $5)`,
      [req.user.id, action, recordId, JSON.stringify(newValues), getIp(req)]
    );
  } catch (e) {
    console.error("[audit_log]", e.message);
  }
};

const fail = (res, tag, err) => {
  if (!err.statusCode) console.error(`[${tag}]`, err);
  return res.status(err.statusCode || 500).json({ message: err.message });
};

const listStaffHandler = async (req, res) => {
  try {
    const { search, role, status } = req.query;
    return res.json(await staffService.listStaff({ search, role, status }));
  } catch (err) {
    return fail(res, "listStaff", err);
  }
};

const createStaffHandler = async (req, res) => {
  try {
    const { user, warning } = await staffService.createStaff(req.body);
    await audit(req, "CREATE_STAFF", user.user_id, { email: user.email, role: user.role });
    return res.status(201).json({ message: "Staff account created.", user, warning });
  } catch (err) {
    return fail(res, "createStaff", err);
  }
};

const updateStaffHandler = async (req, res) => {
  try {
    const { user, previousRole, roleChanged } = await staffService.updateStaff(
      req.user.id,
      req.params.id,
      req.body
    );
    await audit(req, "UPDATE_STAFF", user.user_id, {
      full_name: user.full_name,
      role: user.role,
      ...(roleChanged && { previous_role: previousRole }),
    });
    return res.json({ message: "Staff account updated.", user });
  } catch (err) {
    return fail(res, "updateStaff", err);
  }
};

const setStaffStatusHandler = async (req, res) => {
  try {
    const { is_active } = req.body;
    const { user, warning } = await staffService.setStaffStatus(
      req.user.id,
      req.params.id,
      is_active
    );
    await audit(req, is_active ? "REACTIVATE_STAFF" : "DEACTIVATE_STAFF", user.user_id, {
      email: user.email,
    });
    return res.json({
      message: is_active ? "Staff account reactivated." : "Staff account deactivated.",
      user,
      warning,
    });
  } catch (err) {
    return fail(res, "setStaffStatus", err);
  }
};

const unlockStaffHandler = async (req, res) => {
  try {
    const user = await staffService.unlockStaff(req.params.id);
    await audit(req, "UNLOCK_STAFF", user.user_id, { email: user.email });
    return res.json({ message: "Account unlocked.", user });
  } catch (err) {
    return fail(res, "unlockStaff", err);
  }
};

module.exports = {
  listStaffHandler,
  createStaffHandler,
  updateStaffHandler,
  setStaffStatusHandler,
  unlockStaffHandler,
};