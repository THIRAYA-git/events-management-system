const service = require("../services/partnerAccount.service");
const db = require("../config/db");

const getIp = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0] || req.socket?.remoteAddress || "unknown";

const audit = async (req, action, recordId, newValues) => {
  try {
    await db.query(
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

const createOrganizerHandler = async (req, res) => {
  try {
    const organizer = await service.createOrganizerAccount(req.body);
    await audit(req, "CREATE_ORGANIZER", organizer.user_id, {
      email: req.body.email,
      business_name: organizer.business_name,
    });
    return res.status(201).json({ message: "Organizer account created.", organizer });
  } catch (err) {
    return fail(res, "createOrganizer", err);
  }
};

const createSponsorHandler = async (req, res) => {
  try {
    const sponsor = await service.createSponsorAccount(req.body);
    await audit(req, "CREATE_SPONSOR", sponsor.user_id, {
      email: req.body.email,
      company_name: sponsor.company_name,
    });
    return res.status(201).json({ message: "Sponsor account created.", sponsor });
  } catch (err) {
    return fail(res, "createSponsor", err);
  }
};

module.exports = { createOrganizerHandler, createSponsorHandler };