const db = require("../config/db");

// A customer may only leave feedback on a booking they own, and only
// once the event has actually happened (mirrors the ownership + status
// checks in catering.service.js / booking.service.js).
const getBooking = async (bookingId) => {
  const result = await db.query(
    `SELECT booking_id, user_id, status FROM bookings WHERE booking_id = $1`,
    [bookingId]
  );
  return result.rows[0] || null;
};

// POST /api/feedback — customer submits a rating/review for a completed booking
const createFeedback = async (data, requestingUser) => {
  const { booking_id, rating, title = null, comment = null } = data;

  if (!booking_id || !rating) {
    const err = new Error("booking_id and rating are required.");
    err.statusCode = 400;
    throw err;
  }
  if (rating < 1 || rating > 5) {
    const err = new Error("rating must be between 1 and 5.");
    err.statusCode = 400;
    throw err;
  }

  const booking = await getBooking(booking_id);
  if (!booking) {
    const err = new Error("Booking not found");
    err.statusCode = 404;
    throw err;
  }
  if (booking.user_id !== requestingUser.id) {
    const err = new Error("You can only leave feedback on your own bookings");
    err.statusCode = 403;
    throw err;
  }
  if (booking.status !== "completed") {
    const err = new Error("Feedback can only be submitted after the event is completed");
    err.statusCode = 400;
    throw err;
  }

  try {
    const result = await db.query(
      `INSERT INTO feedback (booking_id, user_id, rating, title, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING feedback_id, booking_id, user_id, rating, title, comment,
                 is_public, admin_reply, replied_at, created_at`,
      [booking_id, requestingUser.id, rating, title, comment]
    );
    return result.rows[0];
  } catch (err) {
    if (err.code === "23505") {
      const conflictErr = new Error("Feedback has already been submitted for this booking.");
      conflictErr.statusCode = 409;
      throw conflictErr;
    }
    throw err;
  }
};

// GET /api/feedback — staff listing, filterable by rating / public status
const listFeedback = async ({ rating, isPublic, limit = 20, offset = 0 } = {}) => {
  const conditions = ["1=1"];
  const params = [];

  if (rating) {
    params.push(rating);
    conditions.push(`f.rating = $${params.length}`);
  }
  if (isPublic !== undefined) {
    params.push(isPublic);
    conditions.push(`f.is_public = $${params.length}`);
  }

  const where = conditions.join(" AND ");

  params.push(limit);
  const limitParam = `$${params.length}`;
  params.push(offset);
  const offsetParam = `$${params.length}`;

  const result = await db.query(
    `SELECT f.feedback_id, f.booking_id, f.user_id, f.rating, f.title, f.comment,
            f.is_public, f.admin_reply, f.replied_at, f.created_at,
            u.full_name AS customer_name, b.event_type
     FROM feedback f
     JOIN users u ON u.user_id = f.user_id
     JOIN bookings b ON b.booking_id = f.booking_id
     WHERE ${where}
     ORDER BY f.created_at DESC
     LIMIT ${limitParam} OFFSET ${offsetParam}`,
    params
  );

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS count FROM feedback f WHERE ${where}`,
    params.slice(0, params.length - 2)
  );

  return { feedback: result.rows, total: countResult.rows[0].count };
};

// PATCH /api/feedback/:feedbackId/reply — staff adds an admin reply
const respondToFeedback = async (feedbackId, adminReply) => {
  if (!adminReply) {
    const err = new Error("admin_reply is required.");
    err.statusCode = 400;
    throw err;
  }

  const result = await db.query(
    `UPDATE feedback
        SET admin_reply = $1, replied_at = NOW()
      WHERE feedback_id = $2
      RETURNING feedback_id, booking_id, user_id, rating, title, comment,
                is_public, admin_reply, replied_at, created_at`,
    [adminReply, feedbackId]
  );

  if (result.rows.length === 0) {
    const err = new Error("Feedback not found");
    err.statusCode = 404;
    throw err;
  }

  return result.rows[0];
};

module.exports = {
  createFeedback,
  listFeedback,
  respondToFeedback,
};