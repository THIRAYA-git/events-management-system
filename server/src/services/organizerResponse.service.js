const db = require("../config/db");
const { notifyOrganizerAssigned } = require("./notify.service");

const httpError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const AUTO_CLOSE_REASON = "Another organizer was confirmed for this booking.";
const ACTIVE_EXCLUDED = "('rejected', 'declined', 'cancelled', 'withdrawn')";

/**
 * Organizer accepts or declines a booking assignment they own.
 * Only allowed while the assignment is still 'assigned'.
 * Accepting also auto-declines every other pending organizer on the same booking,
 * in the same SQL statement (atomic).
 */
const respondToAssignment = async (organizerUserId, assignmentId, action, reason) => {
  const found = await db.query(
    `SELECT bo.id, bo.status::text AS status
       FROM booking_organizers bo
       JOIN organizers o ON o.organizer_id = bo.organizer_id
      WHERE bo.id = $1 AND o.user_id = $2`,
    [assignmentId, organizerUserId]
  );
  // Same 404 for "doesn't exist" and "not yours" so ids can't be probed
  if (found.rows.length === 0) throw httpError("Assignment not found", 404);

  if (found.rows[0].status !== "assigned") {
    throw httpError(
      `This request has already been responded to (status: ${found.rows[0].status}).`,
      409
    );
  }

  let result;
  if (action === "accept") {
    result = await db.query(
      `WITH accepted AS (
         UPDATE booking_organizers
            SET status = 'confirmed', decline_reason = NULL, responded_at = NOW()
          WHERE id = $1 AND status::text = 'assigned'
          RETURNING id, booking_id, organizer_id, role_in_event, agreed_fee,
                    status, notes, decline_reason, responded_at, assigned_at
       ), closed AS (
         UPDATE booking_organizers bo
            SET status = 'declined', decline_reason = $2, responded_at = NOW()
           FROM accepted a
          WHERE bo.booking_id = a.booking_id
            AND bo.id <> a.id
            AND bo.status::text = 'assigned'
          RETURNING bo.id
       )
       SELECT * FROM accepted`,
      [assignmentId, AUTO_CLOSE_REASON]
    );
  } else {
    result = await db.query(
      `UPDATE booking_organizers
          SET status = 'declined', decline_reason = $1, responded_at = NOW()
        WHERE id = $2 AND status::text = 'assigned'
        RETURNING id, booking_id, organizer_id, role_in_event, agreed_fee,
                  status, notes, decline_reason, responded_at, assigned_at`,
      [reason || null, assignmentId]
    );
  }

  if (result.rows.length === 0) {
    throw httpError("This request was already updated. Please refresh.", 409);
  }
  return result.rows[0];
};

/**
 * Organizers on the customer's own bookings (declined ones are hidden).
 */
const getOrganizersForCustomer = async (customerUserId) => {
  const result = await db.query(
    `SELECT bo.id, bo.booking_id, bo.role_in_event, bo.status::text AS status,
            o.business_name, o.specialty, o.avg_rating, o.portfolio_url
       FROM booking_organizers bo
       JOIN organizers o ON o.organizer_id = bo.organizer_id
       JOIN bookings b ON b.booking_id = bo.booking_id
      WHERE b.user_id = $1
        AND bo.status::text NOT IN ${ACTIVE_EXCLUDED}
      ORDER BY bo.assigned_at DESC`,
    [customerUserId]
  );
  return result.rows;
};

/**
 * Organizers a customer can pick from (available only, no user ids exposed).
 */
const browseAvailableOrganizers = async () => {
  const result = await db.query(
    `SELECT organizer_id, business_name, specialty, experience_years, portfolio_url,
            bio, service_areas, price_range, avg_rating, total_reviews,
            is_verified, is_available
       FROM organizers
      WHERE is_available = true
      ORDER BY avg_rating DESC NULLS LAST, business_name ASC`
  );
  return result.rows;
};

/**
 * Customer assigns an organizer to one of their own bookings.
 * One active organizer per booking, enforced inside the INSERT itself.
 */
const assignOrganizerForCustomer = async (customerUserId, bookingId, organizerId, notes) => {
  const booking = await db.query(
    `SELECT booking_id, status::text AS status
       FROM bookings WHERE booking_id = $1 AND user_id = $2`,
    [bookingId, customerUserId]
  );
  if (booking.rows.length === 0) throw httpError("Booking not found", 404);
  if (!["pending", "confirmed"].includes(booking.rows[0].status)) {
    throw httpError("Organizers can only be assigned to active bookings.", 409);
  }

  const organizer = await db.query(
    `SELECT organizer_id FROM organizers WHERE organizer_id = $1 AND is_available = true`,
    [organizerId]
  );
  if (organizer.rows.length === 0) {
    throw httpError("This organizer is not available.", 404);
  }

  const roleInEvent = "Event Organizer";
  try {
    const result = await db.query(
      `INSERT INTO booking_organizers
              (booking_id, organizer_id, role_in_event, agreed_fee, status, notes, assigned_at)
       SELECT $1::int, $2::int, $3::text, NULL, 'assigned', $4::text, NOW()
        WHERE NOT EXISTS (
          SELECT 1 FROM booking_organizers
           WHERE booking_id = $1::int AND status::text NOT IN ${ACTIVE_EXCLUDED}
        )
       RETURNING id, booking_id, organizer_id, role_in_event, status::text AS status, assigned_at`,
      [bookingId, organizerId, roleInEvent, notes || null]
    );
    if (result.rows.length === 0) {
      throw httpError(
        "This booking already has an organizer. Only one organizer can be assigned per booking.",
        409
      );
    }
    try {
      Promise.resolve(notifyOrganizerAssigned(bookingId, organizerId, roleInEvent)).catch(() => {});
    } catch (_) {
      /* notification failure must never break the assignment */
    }
    return result.rows[0];
  } catch (err) {
    if (err.code === "23505") {
      throw httpError("This organizer is already assigned to this booking.", 409);
    }
    throw err;
  }
};

module.exports = {
  respondToAssignment,
  getOrganizersForCustomer,
  browseAvailableOrganizers,
  assignOrganizerForCustomer,
};
