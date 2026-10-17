const db = require("../config/db");

// A customer may leave feedback in two ways:
//  1. On one of their own completed bookings (booking_id), or
//  2. For an event typed in manually (event_name + event_date) when it
//     isn't listed. Manual entries have booking_id = NULL, are kept
//     hidden (is_public = false) until an admin publishes them, and are
//     flagged is_manual in listings.
// Room stays are part of the same booking (bookings.room_count), so one
// review covers hall + rooms.
const getBooking = async (bookingId) => {
  const result = await db.query(
    `SELECT booking_id, user_id, status FROM bookings WHERE booking_id = $1`,
    [bookingId]
  );
  return result.rows[0] || null;
};

const badRequest = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

// POST /api/feedback
const createFeedback = async (data, requestingUser) => {
  const {
    booking_id = null,
    event_name = null,
    event_date = null,
    hall_name = null,
    rating,
    title = null,
    comment = null,
  } = data;

  if (!rating) throw badRequest("rating is required.");
  if (!Number.isInteger(Number(rating)) || rating < 1 || rating > 5) {
    throw badRequest("rating must be a whole number between 1 and 5.");
  }

  // ---------- Path 1: listed booking ----------
  if (booking_id) {
    const booking = await getBooking(booking_id);
    if (!booking) throw badRequest("Booking not found", 404);
    if (booking.user_id !== requestingUser.id) {
      throw badRequest(
        "You can only leave feedback on your own bookings",
        403
      );
    }
    if (booking.status !== "completed") {
      throw badRequest(
        "Feedback can only be submitted after the event is completed"
      );
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
        throw badRequest(
          "Feedback has already been submitted for this booking.",
          409
        );
      }
      throw err;
    }
  }

  // ---------- Path 2: manually entered event ----------
  const name = typeof event_name === "string" ? event_name.trim() : "";
  if (!name || !event_date) {
    throw badRequest(
      "Provide a booking_id, or both event_name and event_date."
    );
  }
  if (name.length > 150) {
    throw badRequest("event_name must be 150 characters or fewer.");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(event_date)) {
    throw badRequest("event_date must be in YYYY-MM-DD format.");
  }
  const eventDay = new Date(`${event_date}T00:00:00`);
  if (Number.isNaN(eventDay.getTime())) {
    throw badRequest("event_date is not a valid date.");
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (eventDay > today) {
    throw badRequest("event_date cannot be in the future.");
  }
  const hall =
    typeof hall_name === "string" && hall_name.trim()
      ? hall_name.trim().slice(0, 100)
      : null;

  const result = await db.query(
    `INSERT INTO feedback
       (booking_id, user_id, rating, title, comment,
        event_name, event_date, hall_name, is_public)
     VALUES (NULL, $1, $2, $3, $4, $5, $6, $7, false)
     RETURNING feedback_id, booking_id, user_id, rating, title, comment,
               event_name, event_date, hall_name,
               is_public, admin_reply, replied_at, created_at`,
    [requestingUser.id, rating, title, comment, name, event_date, hall]
  );
  return result.rows[0];
};

// GET /api/feedback — admin listing.
// Filters: rating, isPublic, hasReply, hasRooms, eventType, search (q)
// LEFT JOIN bookings so manual entries (booking_id NULL) still appear.
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
    conditions.push(
      hasRooms
        ? "COALESCE(b.room_count, 0) > 0"
        : "COALESCE(b.room_count, 0) = 0"
    );
  }
  if (eventType) {
    params.push(eventType);
    conditions.push(
      `COALESCE(b.event_type, f.event_name) = $${params.length}`
    );
  }
  if (q) {
    params.push(`%${q}%`);
    const p = `$${params.length}`;
    conditions.push(
      `(u.full_name ILIKE ${p} OR b.booking_ref ILIKE ${p} OR f.event_name ILIKE ${p} OR f.title ILIKE ${p} OR f.comment ILIKE ${p})`
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
            b.booking_ref,
            COALESCE(b.event_type, f.event_name) AS event_type,
            COALESCE(b.event_date, f.event_date) AS event_date,
            COALESCE(b.room_count, 0) AS room_count,
            f.hall_name,
            (f.booking_id IS NULL) AS is_manual
     FROM feedback f
     JOIN users u ON u.user_id = f.user_id
     LEFT JOIN bookings b ON b.booking_id = f.booking_id
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
     LEFT JOIN bookings b ON b.booking_id = f.booking_id
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
            COUNT(*) FILTER (WHERE is_public = false)::int AS hidden,
            COUNT(*) FILTER (WHERE booking_id IS NULL)::int AS manual_entries
     FROM feedback`
  );
  return result.rows[0];
};

// PATCH /api/feedback/:feedbackId/reply — admin adds or edits a reply
const respondToFeedback = async (feedbackId, adminReply) => {
  const reply = typeof adminReply === "string" ? adminReply.trim() : "";
  if (!reply) throw badRequest("admin_reply is required.");
  if (reply.length > 1000) {
    throw badRequest("admin_reply must be 1000 characters or fewer.");
  }

  const result = await db.query(
    `UPDATE feedback
        SET admin_reply = $1, replied_at = NOW(), reply_read_at = NULL
      WHERE feedback_id = $2
      RETURNING feedback_id, booking_id, user_id, rating, title, comment,
                is_public, admin_reply, replied_at, created_at`,
    [reply, feedbackId]
  );

  if (result.rows.length === 0) throw badRequest("Feedback not found", 404);
  return result.rows[0];
};

// PATCH /api/feedback/:feedbackId/visibility — moderation (hide / publish)
const setFeedbackVisibility = async (feedbackId, isPublic) => {
  if (typeof isPublic !== "boolean") {
    throw badRequest("is_public must be true or false.");
  }

  const result = await db.query(
    `UPDATE feedback
        SET is_public = $1
      WHERE feedback_id = $2
      RETURNING feedback_id, booking_id, user_id, rating, title, comment,
                is_public, admin_reply, replied_at, created_at`,
    [isPublic, feedbackId]
  );

  if (result.rows.length === 0) throw badRequest("Feedback not found", 404);
  return result.rows[0];
};

// Ownership now comes from feedback.user_id (manual entries have no booking).
const getUnreadRepliesForUser = async (userId) => {
  const { rows } = await db.query(
    `SELECT f.feedback_id, f.booking_id, f.rating, f.title, f.comment,
            f.admin_reply, b.booking_ref,
            COALESCE(b.event_type, f.event_name) AS event_type,
            COALESCE(b.event_date, f.event_date) AS event_date
       FROM feedback f
       LEFT JOIN bookings b ON b.booking_id = f.booking_id
      WHERE f.user_id = $1
        AND f.admin_reply IS NOT NULL
        AND f.reply_read_at IS NULL
      ORDER BY f.feedback_id DESC`,
    [userId]
  );
  return rows;
};

const markReplyRead = async (feedbackId, userId) => {
  const { rows } = await db.query(
    `UPDATE feedback
        SET reply_read_at = NOW()
      WHERE feedback_id = $1
        AND user_id = $2
      RETURNING feedback_id`,
    [feedbackId, userId]
  );
  if (rows.length === 0) throw badRequest("Feedback not found", 404);
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
