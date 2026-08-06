const db = require("../config/db");

/**
 * Get all organizers, optionally filtered by specialty / availability
 */
const getAllOrganizers = async ({ specialty, isAvailable } = {}) => {
  let query = `
    SELECT organizer_id, user_id, business_name, specialty, experience_years,
           portfolio_url, bio, service_areas, price_range, avg_rating,
           total_reviews, is_verified, is_available, created_at, updated_at
    FROM organizers
    WHERE 1=1
  `;
  const params = [];

  if (specialty) {
    params.push(`%${specialty}%`);
    query += ` AND specialty ILIKE $${params.length}`;
  }

  if (isAvailable !== undefined) {
    params.push(isAvailable);
    query += ` AND is_available = $${params.length}`;
  }

  query += ` ORDER BY avg_rating DESC NULLS LAST, business_name ASC`;

  const result = await db.query(query, params);
  return result.rows;
};

/**
 * Get a single organizer's public profile
 */
const getOrganizerById = async (organizerId) => {
  const result = await db.query(
    `SELECT organizer_id, user_id, business_name, specialty, experience_years,
            portfolio_url, bio, service_areas, price_range, avg_rating,
            total_reviews, is_verified, is_available, created_at, updated_at
     FROM organizers
     WHERE organizer_id = $1`,
    [organizerId]
  );
  return result.rows[0] || null;
};

/**
 * Get all organizers assigned to a specific booking
 */
const getOrganizersForBooking = async (bookingId) => {
  const result = await db.query(
    `SELECT bo.id, bo.booking_id, bo.organizer_id, bo.role_in_event,
            bo.agreed_fee, bo.status, bo.notes, bo.assigned_at,
            o.business_name, o.specialty, o.avg_rating
     FROM booking_organizers bo
     JOIN organizers o ON o.organizer_id = bo.organizer_id
     WHERE bo.booking_id = $1
     ORDER BY bo.assigned_at DESC`,
    [bookingId]
  );
  return result.rows;
};

/**
 * Assign (staff-only) an organizer to a booking
 */
const assignOrganizerToBooking = async (bookingId, organizerId, { roleInEvent, agreedFee, notes } = {}) => {
  const bookingCheck = await db.query(
    `SELECT booking_id FROM bookings WHERE booking_id = $1`,
    [bookingId]
  );
  if (bookingCheck.rows.length === 0) {
    const err = new Error("Booking not found");
    err.statusCode = 404;
    throw err;
  }

  const organizerCheck = await db.query(
    `SELECT organizer_id FROM organizers WHERE organizer_id = $1`,
    [organizerId]
  );
  if (organizerCheck.rows.length === 0) {
    const err = new Error("Organizer not found");
    err.statusCode = 404;
    throw err;
  }

  const result = await db.query(
    `INSERT INTO booking_organizers (booking_id, organizer_id, role_in_event, agreed_fee, status, notes, assigned_at)
     VALUES ($1, $2, $3, $4, 'assigned', $5, NOW())
     RETURNING id, booking_id, organizer_id, role_in_event, agreed_fee, status, notes, assigned_at`,
    [bookingId, organizerId, roleInEvent || null, agreedFee || null, notes || null]
  );

  return result.rows[0];
};

module.exports = {
  getAllOrganizers,
  getOrganizerById,
  getOrganizersForBooking,
  assignOrganizerToBooking,
};