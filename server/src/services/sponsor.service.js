const db = require("../config/db");
const { notifyUsers } = require("./notify.service");

const getAllSponsors = async ({ industry, status } = {}) => {
  let query = `
    SELECT sponsor_id, user_id, company_name, industry, website_url, logo_url,
           budget_range, preferred_events, description, status, created_at, updated_at
    FROM sponsors
    WHERE 1=1
  `;
  const params = [];

  if (industry) {
    params.push(`%${industry}%`);
    query += ` AND industry ILIKE $${params.length}`;
  }

  if (status) {
    params.push(status);
    query += ` AND status = $${params.length}`;
  } else {
    query += ` AND status = 'active'`;
  }

  query += ` ORDER BY company_name ASC`;

  const result = await db.query(query, params);
  return result.rows;
};

const getSponsorById = async (sponsorId) => {
  const result = await db.query(
    `SELECT sponsor_id, user_id, company_name, industry, website_url, logo_url,
            budget_range, preferred_events, description, status, created_at, updated_at
     FROM sponsors
     WHERE sponsor_id = $1`,
    [sponsorId]
  );
  return result.rows[0] || null;
};

const getBookingOwnerId = async (bookingId) => {
  const result = await db.query(
    `SELECT user_id FROM bookings WHERE booking_id = $1`,
    [bookingId]
  );
  return result.rows.length ? result.rows[0].user_id : null;
};

const getSponsorRequestsForBooking = async (bookingId) => {
  const result = await db.query(
    `SELECT bs.id, bs.booking_id, bs.sponsor_id, bs.proposed_amount, bs.message,
            bs.status, bs.direction, bs.responded_by, bs.responded_at, bs.requested_at,
            s.company_name, s.industry, s.budget_range
     FROM booking_sponsors bs
     JOIN sponsors s ON s.sponsor_id = bs.sponsor_id
     WHERE bs.booking_id = $1
     ORDER BY bs.requested_at DESC`,
    [bookingId]
  );
  return result.rows;
};

const getSponsorRequestsForSponsorUser = async (sponsorUserId) => {
  const result = await db.query(
    `SELECT bs.id, bs.booking_id, bs.sponsor_id, bs.proposed_amount, bs.message,
            bs.status, bs.direction, bs.responded_by, bs.responded_at, bs.requested_at,
            b.booking_ref, b.event_type, b.event_date::text AS event_date,
            to_char(b.event_start_time, 'HH24:MI') AS event_start_time,
            to_char(b.event_end_time, 'HH24:MI') AS event_end_time,
            b.guest_count, b.status AS booking_status, b.special_requests,
            u.full_name AS customer_name,
            CASE WHEN bs.status = 'accepted' THEN bs.customer_payment_details END AS customer_payment_details,
            CASE WHEN bs.status = 'accepted' THEN u.phone END AS customer_phone,
            CASE WHEN bs.status = 'accepted' THEN u.email END AS customer_email,
            (SELECT string_agg(h.hall_name, ' + ' ORDER BY h.floor_number)
               FROM hall_bookings hb
               JOIN halls h ON h.hall_id = hb.hall_id
              WHERE hb.booking_id = b.booking_id) AS hall_names
     FROM booking_sponsors bs
     JOIN sponsors s ON s.sponsor_id = bs.sponsor_id
     JOIN bookings b ON b.booking_id = bs.booking_id
     JOIN users u ON u.user_id = b.user_id
     WHERE s.user_id = $1
     ORDER BY bs.requested_at DESC`,
    [sponsorUserId]
  );
  return result.rows;
};

const createSponsorRequest = async (
  bookingId,
  sponsorId,
  requestingUserId,
  { proposedAmount, message, paymentDetails } = {}
) => {
  const details = String(paymentDetails || "").trim();
  if (!details) {
    const err = new Error(
      "Account details are required so the sponsor can pay you"
    );
    err.statusCode = 400;
    throw err;
  }
  if (details.length > 500) {
    const err = new Error("Account details must be 500 characters or fewer");
    err.statusCode = 400;
    throw err;
  }
  const bookingResult = await db.query(
    `SELECT booking_id, user_id FROM bookings WHERE booking_id = $1`,
    [bookingId]
  );
  if (bookingResult.rows.length === 0) {
    const err = new Error("Booking not found");
    err.statusCode = 404;
    throw err;
  }
  if (bookingResult.rows[0].user_id !== requestingUserId) {
    const err = new Error("You can only propose sponsors for your own booking");
    err.statusCode = 403;
    throw err;
  }

  const sponsorResult = await db.query(
    `SELECT sponsor_id, status FROM sponsors WHERE sponsor_id = $1`,
    [sponsorId]
  );
  if (sponsorResult.rows.length === 0) {
    const err = new Error("Sponsor not found");
    err.statusCode = 404;
    throw err;
  }
  if (sponsorResult.rows[0].status !== "active") {
    const err = new Error("This sponsor is not currently accepting requests");
    err.statusCode = 400;
    throw err;
  }

  try {
    const result = await db.query(
      `INSERT INTO booking_sponsors (booking_id, sponsor_id, proposed_amount, message, customer_payment_details, status, requested_at)
   VALUES ($1, $2, $3, $4, $5, 'pending', NOW())
   RETURNING id, booking_id, sponsor_id, proposed_amount, message, status, requested_at`,
      [bookingId, sponsorId, proposedAmount || null, message || null, details]
    );
    return result.rows[0];
  } catch (err) {
    if (err.code === "23505") {
      const conflictErr = new Error(
        "A sponsor request already exists for this booking and sponsor"
      );
      conflictErr.statusCode = 409;
      throw conflictErr;
    }
    throw err;
  }
};

const respondToSponsorRequest = async (
  requestId,
  action,
  respondingUserId,
  respondingRole
) => {
  if (!["accepted", "rejected"].includes(action)) {
    const err = new Error("action must be 'accepted' or 'rejected'");
    err.statusCode = 400;
    throw err;
  }

  const requestResult = await db.query(
    `SELECT bs.id, bs.status, bs.direction, s.user_id AS sponsor_user_id
     FROM booking_sponsors bs
     JOIN sponsors s ON s.sponsor_id = bs.sponsor_id
     WHERE bs.id = $1`,
    [requestId]
  );

  if (requestResult.rows.length === 0) {
    const err = new Error("Sponsor request not found");
    err.statusCode = 404;
    throw err;
  }
  const request = requestResult.rows[0];

  if (request.direction === "sponsor_to_customer") {
    const err = new Error(
      "Sponsor offers can only be answered by the booking's customer"
    );
    err.statusCode = 403;
    throw err;
  }

  const isStaff = ["admin"].includes(respondingRole);
  const isOwningSponsor =
    respondingRole === "sponsor" &&
    request.sponsor_user_id === respondingUserId;

  if (!isStaff && !isOwningSponsor) {
    const err = new Error("You are not authorized to respond to this request");
    err.statusCode = 403;
    throw err;
  }

  if (request.status !== "pending") {
    const err = new Error(
      `Cannot respond to a request that is already '${request.status}'`
    );
    err.statusCode = 409;
    throw err;
  }

  const result = await db.query(
    `UPDATE booking_sponsors
     SET status = $1, responded_by = $2, responded_at = NOW()
     WHERE id = $3
     RETURNING id, booking_id, sponsor_id, proposed_amount, message, status, responded_by, responded_at, requested_at`,
    [action, respondingUserId, requestId]
  );

  // Tell the customer (notifyUsers never throws)
  try {
    const info = await db.query(
      `SELECT b.user_id AS customer_user_id, b.booking_id, b.booking_ref,
              b.event_type, s.company_name
         FROM booking_sponsors bs
         JOIN bookings b ON b.booking_id = bs.booking_id
         JOIN sponsors s ON s.sponsor_id = bs.sponsor_id
        WHERE bs.id = $1`,
      [requestId]
    );
    const i = info.rows[0];
    if (i) {
      notifyUsers([i.customer_user_id], {
        type: "general",
        bookingId: i.booking_id,
        subject:
          action === "accepted"
            ? `Sponsorship accepted — ${i.booking_ref}`
            : `Sponsorship declined — ${i.booking_ref}`,
        message:
          action === "accepted"
            ? `${i.company_name} accepted your sponsorship request for ${i.event_type} (${i.booking_ref}). They will pay you directly using the account details you provided.`
            : `${i.company_name} declined your sponsorship request for ${i.event_type} (${i.booking_ref}). You can request another sponsor from Find Sponsors.`,
      });
    }
  } catch (e) {
    console.error("[notify] sponsor response:", e.message);
  }

  return result.rows[0];
};

const withdrawSponsorRequest = async (requestId, requestingUserId) => {
  const requestResult = await db.query(
    `SELECT bs.id, bs.status, bs.direction, b.user_id AS customer_user_id
     FROM booking_sponsors bs
     JOIN bookings b ON b.booking_id = bs.booking_id
     WHERE bs.id = $1`,
    [requestId]
  );
  if (requestResult.rows.length === 0) {
    const err = new Error("Sponsor request not found");
    err.statusCode = 404;
    throw err;
  }
  const request = requestResult.rows[0];

  if (request.direction === "sponsor_to_customer") {
    const err = new Error("Use reject to decline a sponsor's offer");
    err.statusCode = 400;
    throw err;
  }

  if (request.customer_user_id !== requestingUserId) {
    const err = new Error("You can only withdraw your own sponsor requests");
    err.statusCode = 403;
    throw err;
  }

  if (request.status !== "pending") {
    const err = new Error(
      `Cannot withdraw a request that is already '${request.status}'`
    );
    err.statusCode = 409;
    throw err;
  }

  const result = await db.query(
    `UPDATE booking_sponsors SET status = 'withdrawn' WHERE id = $1
     RETURNING id, booking_id, sponsor_id, proposed_amount, message, status, requested_at`,
    [requestId]
  );
  return result.rows[0];
};

const updateSponsorLogo = async (userId, logoUrl) => {
  const result = await db.query(
    `UPDATE sponsors
     SET logo_url = $1, updated_at = NOW()
     WHERE user_id = $2
     RETURNING sponsor_id, user_id, company_name, industry, website_url, logo_url,
               budget_range, preferred_events, description, status, created_at, updated_at`,
    [logoUrl, userId]
  );
  if (result.rows.length === 0) {
    const err = new Error("Sponsor profile not found for this user");
    err.statusCode = 404;
    throw err;
  }
  return result.rows[0];
};

const getSponsorByUserId = async (userId) => {
  const result = await db.query(
    `SELECT sponsor_id, user_id, company_name, industry, website_url, logo_url,
            budget_range, preferred_events, description, status, created_at, updated_at
     FROM sponsors
     WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0] || null;
};

const createSponsorProfile = async (
  userId,
  {
    companyName,
    industry,
    websiteUrl,
    budgetRange,
    preferredEvents,
    description,
  } = {}
) => {
  const result = await db.query(
    `INSERT INTO sponsors
       (user_id, company_name, industry, website_url, budget_range,
        preferred_events, description, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
     RETURNING sponsor_id, user_id, company_name, status`,
    [
      userId,
      companyName,
      industry || null,
      websiteUrl || null,
      budgetRange || null,
      preferredEvents || null,
      description || null,
    ]
  );
  return result.rows[0];
};

const SELF_SERVICE_STATUSES = ["active", "inactive"];

const updateSponsorProfile = async (userId, fields = {}) => {
  const existing = await getSponsorByUserId(userId);
  if (!existing) {
    const err = new Error("Sponsor profile not found for this user");
    err.statusCode = 404;
    throw err;
  }

  const bad = (msg) => {
    const err = new Error(msg);
    err.statusCode = 400;
    return err;
  };

  const sets = [];
  const params = [];
  const add = (column, value) => {
    params.push(value);
    sets.push(`${column} = $${params.length}`);
  };

  if (fields.companyName !== undefined) {
    const v = String(fields.companyName).trim();
    if (!v) throw bad("Company name cannot be empty");
    if (v.length > 150)
      throw bad("Company name must be 150 characters or fewer");
    add("company_name", v);
  }
  if (fields.industry !== undefined) {
    const v = String(fields.industry).trim();
    if (v.length > 100) throw bad("Industry must be 100 characters or fewer");
    add("industry", v || null);
  }
  if (fields.websiteUrl !== undefined) {
    const v = String(fields.websiteUrl).trim();
    if (v && !/^https?:\/\/[^\s]+\.[^\s]+$/i.test(v))
      throw bad("Website must start with http:// or https://");
    add("website_url", v || null);
  }
  if (fields.budgetRange !== undefined) {
    const v = String(fields.budgetRange).trim();
    if (v.length > 50) throw bad("Budget range must be 50 characters or fewer");
    add("budget_range", v || null);
  }
  if (fields.preferredEvents !== undefined) {
    add("preferred_events", String(fields.preferredEvents).trim() || null);
  }
  if (fields.description !== undefined) {
    const v = String(fields.description).trim();
    if (v.length > 1000)
      throw bad("Description must be 1000 characters or fewer");
    add("description", v || null);
  }
  if (fields.status !== undefined) {
    if (!SELF_SERVICE_STATUSES.includes(fields.status))
      throw bad("Status must be 'active' or 'inactive'");
    if (!SELF_SERVICE_STATUSES.includes(existing.status)) {
      const err = new Error(
        `Your account is '${existing.status}'. Please contact Aazath Plaza staff.`
      );
      err.statusCode = 403;
      throw err;
    }
    add("status", fields.status);
  }

  if (sets.length === 0) throw bad("No valid fields to update");

  params.push(userId);
  const result = await db.query(
    `UPDATE sponsors
     SET ${sets.join(", ")}, updated_at = NOW()
     WHERE user_id = $${params.length}
     RETURNING sponsor_id, user_id, company_name, industry, website_url, logo_url,
               budget_range, preferred_events, description, status, created_at, updated_at`,
    params
  );
  return result.rows[0];
};

module.exports = {
  getAllSponsors,
  getSponsorById,
  getBookingOwnerId,
  getSponsorRequestsForBooking,
  getSponsorRequestsForSponsorUser,
  createSponsorRequest,
  respondToSponsorRequest,
  withdrawSponsorRequest,
  updateSponsorLogo,
  getSponsorByUserId,
  createSponsorProfile,
  updateSponsorProfile,
};
