const db = require("../config/db");
const { hashPassword } = require("./auth.service");

const httpError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const clean = (v) => (typeof v === "string" && v.trim() ? v.trim() : null);

const validateAccount = ({ full_name, email, password }) => {
  if (!full_name?.trim() || !email?.trim() || !password) {
    throw httpError(400, "Contact name, email and password are required.");
  }
  if (password.length < 8) {
    throw httpError(400, "Password must be at least 8 characters.");
  }
};

const assertEmailFree = async (email) => {
  const dup = await db.query(`SELECT 1 FROM users WHERE LOWER(email) = LOWER($1)`, [
    email.trim(),
  ]);
  if (dup.rows.length) throw httpError(409, "Email already exists.");
};

// ── Organizer: users row + organizers row in ONE statement ────
const createOrganizerAccount = async (body) => {
  validateAccount(body);
  if (!body.business_name?.trim()) throw httpError(400, "Business name is required.");
  if (!body.specialty?.trim()) throw httpError(400, "Specialty is required.");

  const years = parseInt(body.experience_years, 10);
  if (Number.isNaN(years) || years < 0) {
    throw httpError(400, "Experience (years) must be 0 or more.");
  }

  await assertEmailFree(body.email);
  const passwordHash = await hashPassword(body.password);

  try {
    const { rows } = await db.query(
      `WITH new_user AS (
         INSERT INTO users (full_name, email, password_hash, phone, role, is_active, is_verified)
         VALUES ($1, $2, $3, $4, 'organizer'::user_role, true, true)
         RETURNING user_id
       )
       INSERT INTO organizers
         (user_id, business_name, specialty, experience_years, portfolio_url,
          bio, service_areas, price_range, is_verified, is_available)
       SELECT user_id, $5::varchar, $6::varchar, $7::int, $8::text,
              $9::text, $10::text, $11::varchar, true, true
       FROM new_user
       RETURNING organizer_id, user_id, business_name, specialty, experience_years,
                 portfolio_url, bio, service_areas, price_range, avg_rating,
                 total_reviews, is_verified, is_available, created_at, updated_at`,
      [
        body.full_name.trim(),
        body.email.trim(),
        passwordHash,
        clean(body.phone),
        body.business_name.trim(),
        body.specialty.trim(),
        years,
        clean(body.portfolio_url),
        clean(body.bio),
        clean(body.service_areas),
        clean(body.price_range),
      ]
    );
    return rows[0];
  } catch (err) {
    if (err.code === "23505") throw httpError(409, "Email already exists.");
    throw err;
  }
};

// ── Sponsor: users row + sponsors row in ONE statement ────────
const createSponsorAccount = async (body) => {
  validateAccount(body);
  if (!body.company_name?.trim()) throw httpError(400, "Company name is required.");

  await assertEmailFree(body.email);
  const passwordHash = await hashPassword(body.password);

  try {
    const { rows } = await db.query(
      `WITH new_user AS (
         INSERT INTO users (full_name, email, password_hash, phone, role, is_active, is_verified)
         VALUES ($1, $2, $3, $4, 'sponsor'::user_role, true, true)
         RETURNING user_id
       )
       INSERT INTO sponsors
         (user_id, company_name, industry, website_url, budget_range,
          preferred_events, description, status)
       SELECT user_id, $5::varchar, $6::varchar, $7::text, $8::varchar,
              $9::text, $10::text, 'active'::sponsor_status
       FROM new_user
       RETURNING sponsor_id, user_id, company_name, industry, website_url, logo_url,
                 budget_range, preferred_events, description, status, created_at, updated_at`,
      [
        body.full_name.trim(),
        body.email.trim(),
        passwordHash,
        clean(body.phone),
        body.company_name.trim(),
        clean(body.industry),
        clean(body.website_url),
        clean(body.budget_range),
        clean(body.preferred_events),
        clean(body.description),
      ]
    );
    return rows[0];
  } catch (err) {
    if (err.code === "23505") throw httpError(409, "Email already exists.");
    throw err;
  }
};

module.exports = { createOrganizerAccount, createSponsorAccount };