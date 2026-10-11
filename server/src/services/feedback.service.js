const db = require("../config/db");

// A customer may only leave feedback on a booking they own, and only
// once the event has actually happened. Room stays are part of the same
// booking (bookings.room_count), so one review covers hall + rooms.
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
    const err = new Error(
      "Feedback can only be submitted after the event is completed"
    );
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
      const conflictErr = new Error(
        "Feedback has already been submitted for this booking."
      );
      conflictErr.statusCode = 409;
      throw conflictErr;
    }
    throw err;
  }
};

// GET /api/feedback — admin/manager listing.
// Filters: rating, isPublic, hasReply, hasRooms, eventType, search (q)
const listFeedback = async ({
  rating,
  isPublic,
  hasReply,
  hasRooms,
  eventType,
  q,
  limit = 20,
  offset = 0,
} = {}) => {
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
  if (hasReply !== undefined) {
    conditions.push(
      hasReply ? "f.admin_reply IS NOT NULL" : "f.admin_reply IS NULL"
    );
  }
  if (hasRooms !== undefined) {
    conditions.push(hasRooms ? "b.room_count > 0" : "b.room_count = 0");
  }
  if (eventType) {
    params.push(eventType);
    conditions.push(`b.event_type = $${params.length}`);
  }
  if (q) {
    params.push(`%${q}%`);
    const p = `$${params.length}`;
    conditions.push(
      `(u.full_name ILIKE ${p} OR b.booking_ref ILIKE ${p} OR f.title ILIKE ${p} OR f.comment ILIKE ${p})`
    );
  }

  const where = conditions.join(" AND ");
  const filterParams = [...params];

  params.push(limit);
  const limitParam = `$${params.length}`;
  params.push(offset);
  const offsetParam = `$${params.length}`;

  const result = await db.query(
    `SELECT f.feedback_id, f.booking_id, f.user_id, f.rating, f.title, f.comment,
            f.is_public, f.admin_reply, f.replied_at, f.created_at,
            u.full_name AS customer_name,
            b.booking_ref, b.event_type, b.event_date, b.room_count
     FROM feedback f
     JOIN users u ON u.user_id = f.user_id
     JOIN bookings b ON b.booking_id = f.booking_id
     WHERE ${where}
     ORDER BY f.created_at DESC
     LIMIT ${limitParam} OFFSET ${offsetParam}`,
    params
  );

  // Count needs the same joins because filters may reference u / b
  const countResult = await db.query(
    `SELECT COUNT(*)::int AS count
     FROM feedback f
     JOIN users u ON u.user_id = f.user_id
     JOIN bookings b ON b.booking_id = f.booking_id
     WHERE ${where}`,
    filterParams
  );

  return { feedback: result.rows, total: countResult.rows[0].count };
};

// GET /api/feedback/summary — headline numbers for the admin page
const getFeedbackSummary = async () => {
  const result = await db.query(
    `SELECT COUNT(*)::int AS total,
            COALESCE(ROUND(AVG(rating)::numeric, 2), 0)::float AS avg_rating,
            COUNT(*) FILTER (WHERE rating = 1)::int AS star_1,
            COUNT(*) FILTER (WHERE rating = 2)::int AS star_2,
            COUNT(*) FILTER (WHERE rating = 3)::int AS star_3,
            COUNT(*) FILTER (WHERE rating = 4)::int AS star_4,
            COUNT(*) FILTER (WHERE rating = 5)::int AS star_5,
            COUNT(*) FILTER (WHERE admin_reply IS NULL)::int AS awaiting_reply,
            COUNT(*) FILTER (WHERE is_public = false)::int AS hidden
     FROM feedback`
  );
  return result.rows[0];
};

// PATCH /api/feedback/:feedbackId/reply — admin/manager adds or edits a reply
const respondToFeedback = async (feedbackId, adminReply) => {
  const reply = typeof adminReply === "string" ? adminReply.trim() : "";
  if (!reply) {
    const err = new Error("admin_reply is required.");
    err.statusCode = 400;
    throw err;
  }
  if (reply.length > 1000) {
    const err = new Error("admin_reply must be 1000 characters or fewer.");
    err.statusCode = 400;
    throw err;
  }

  const result = await db.query(
    `UPDATE feedback
SET admin_reply = $1, replied_at = NOW(), reply_read_at = NULL
      WHERE feedback_id = $2
      RETURNING feedback_id, booking_id, user_id, rating, title, comment,
                is_public, admin_reply, replied_at, created_at`,
    [reply, feedbackId]
  );

  if (result.rows.length === 0) {
    const err = new Error("Feedback not found");
    err.statusCode = 404;
    throw err;
  }

  return result.rows[0];
};

// PATCH /api/feedback/:feedbackId/visibility — moderation (hide / publish)
const setFeedbackVisibility = async (feedbackId, isPublic) => {
  if (typeof isPublic !== "boolean") {
    const err = new Error("is_public must be true or false.");
    err.statusCode = 400;
    throw err;
  }

  const result = await db.query(
    `UPDATE feedback
        SET is_public = $1
      WHERE feedback_id = $2
      RETURNING feedback_id, booking_id, user_id, rating, title, comment,
                is_public, admin_reply, replied_at, created_at`,
    [isPublic, feedbackId]
  );

  if (result.rows.length === 0) {
    const err = new Error("Feedback not found");
    err.statusCode = 404;
    throw err;
  }

  return result.rows[0];
};

const getUnreadRepliesForUser = async (userId) => {
  const { rows } = await db.query(
    `SELECT f.feedback_id, f.booking_id, f.rating, f.title, f.comment,
            f.admin_reply, b.booking_ref, b.event_type, b.event_date
       FROM feedback f
       JOIN bookings b ON b.booking_id = f.booking_id
      WHERE b.user_id = $1
        AND f.admin_reply IS NOT NULL
        AND f.reply_read_at IS NULL
      ORDER BY f.feedback_id DESC`,
    [userId]
  );
  return rows;
};

const markReplyRead = async (feedbackId, userId) => {
  const { rows } = await db.query(
    `UPDATE feedback f
        SET reply_read_at = NOW()
       FROM bookings b
      WHERE f.feedback_id = $1
        AND b.booking_id = f.booking_id
        AND b.user_id = $2
      RETURNING f.feedback_id`,
    [feedbackId, userId]
  );
  if (rows.length === 0) {
    const err = new Error("Feedback not found");
    err.statusCode = 404;
    throw err;
  }
  return rows[0];
};

module.exports = {
  createFeedback,
  listFeedback,
  getFeedbackSummary,
  respondToFeedback,
  setFeedbackVisibility,
  getUnreadRepliesForUser,
  markReplyRead,
};
