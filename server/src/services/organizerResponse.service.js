const db = require("../config/db");

const httpError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

/**
 * Organizer accepts or declines a booking assignment they own.
 * Only allowed while the assignment is still 'assigned'.
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

  const newStatus = action === "accept" ? "confirmed" : "declined";
  const result = await db.query(
    `UPDATE booking_organizers
        SET status = $1, decline_reason = $2, responded_at = NOW()
      WHERE id = $3 AND status::text = 'assigned'
      RETURNING id, booking_id, organizer_id, role_in_event, agreed_fee,
                status, notes, decline_reason, responded_at, assigned_at`,
    [newStatus, newStatus === "declined" ? reason || null : null, assignmentId]
  );
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
        AND bo.status::text NOT IN ('rejected', 'declined', 'cancelled', 'withdrawn')
      ORDER BY bo.assigned_at DESC`,
    [customerUserId]
  );
  return result.rows;
};

module.exports = { respondToAssignment, getOrganizersForCustomer };
