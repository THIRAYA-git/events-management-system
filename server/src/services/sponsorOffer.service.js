const pool = require("../config/db"); // ← match sponsor.service.js
const sponsorService = require("./sponsor.service");

const httpError = (statusCode, message) =>
  Object.assign(new Error(message), { statusCode });

const createSponsorOffer = async (userId, { bookingId, proposedAmount, message }) => {
  const amount = Number(proposedAmount);
  if (!bookingId) throw httpError(400, "bookingId is required");
  if (!Number.isFinite(amount) || amount <= 0)
    throw httpError(400, "proposedAmount must be greater than 0");
  if (message && message.length > 500)
    throw httpError(400, "Message must be 500 characters or fewer");

  const sponsor = await sponsorService.getSponsorByUserId(userId);
  if (!sponsor) throw httpError(404, "Sponsor profile not found");
  if (sponsor.status !== "active")
    throw httpError(403, "Only active sponsors can make offers");

  const booking = await pool.query(
    `SELECT booking_id FROM bookings
     WHERE booking_id = $1 AND status = 'confirmed' AND event_date >= CURRENT_DATE`,
    [bookingId]
  );
  if (booking.rowCount === 0)
    throw httpError(400, "Offers can only be made on upcoming confirmed events");

  // The existing UNIQUE (booking_id, sponsor_id) makes this race-safe
  const result = await pool.query(
    `INSERT INTO booking_sponsors
       (booking_id, sponsor_id, proposed_amount, message, direction)
     VALUES ($1, $2, $3, $4, 'sponsor_to_customer')
     ON CONFLICT (booking_id, sponsor_id) DO NOTHING
     RETURNING *`,
    [bookingId, sponsor.sponsor_id, amount, message?.trim() || null]
  );
  if (result.rowCount === 0)
    throw httpError(409, "You already have a sponsorship request or offer for this event");

  return result.rows[0];
};

const respondToSponsorOffer = async (requestId, action, userId) => {
  if (!["accepted", "rejected"].includes(action))
    throw httpError(400, "action must be 'accepted' or 'rejected'");

  const found = await pool.query(
    `SELECT id, booking_id FROM booking_sponsors
     WHERE id = $1 AND direction = 'sponsor_to_customer'`,
    [requestId]
  );
  if (found.rowCount === 0) throw httpError(404, "Sponsor offer not found");

  const ownerId = await sponsorService.getBookingOwnerId(found.rows[0].booking_id);
  if (ownerId !== userId)
    throw httpError(403, "You can only respond to offers on your own bookings");

  const updated = await pool.query(
    `UPDATE booking_sponsors
     SET status = $2, responded_by = $3, responded_at = NOW()
     WHERE id = $1 AND status = 'pending' AND direction = 'sponsor_to_customer'
     RETURNING *`,
    [requestId, action, userId]
  );
  if (updated.rowCount === 0)
    throw httpError(409, "This offer has already been responded to");

  return updated.rows[0];
};

const getOffersForCustomer = async (userId) => {
  const result = await pool.query(
    `SELECT bs.id, bs.booking_id, bs.proposed_amount, bs.message, bs.status,
            bs.direction, bs.requested_at, bs.responded_at,
            s.company_name, s.industry, s.logo_url
     FROM booking_sponsors bs
     JOIN sponsors s ON s.sponsor_id = bs.sponsor_id
     JOIN bookings b ON b.booking_id = bs.booking_id
     WHERE b.user_id = $1 AND bs.direction = 'sponsor_to_customer'
     ORDER BY bs.requested_at DESC`,
    [userId]
  );
  return result.rows;
};

module.exports = { createSponsorOffer, respondToSponsorOffer, getOffersForCustomer };

