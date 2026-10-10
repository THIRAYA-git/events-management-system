const db = require("../config/db");

// Verify these against Neon information_schema if a card shows "—":
//   SELECT table_name, column_name FROM information_schema.columns
//    WHERE table_name IN ('catering_orders','feedback') ORDER BY 1, ordinal_position;
const FEEDBACK_TABLE = "feedback";
const CATERING_TABLE = "catering_orders";
const NOT_ACTIVE = "('rejected', 'declined', 'cancelled', 'withdrawn')";

// Each metric runs on its own: one bad query never breaks the dashboard.
const safeRow = async (label, sql) => {
  try {
    const result = await db.query(sql);
    return result.rows[0] || null;
  } catch (err) {
    console.error(`[dashboard-attention] ${label} failed:`, err.message);
    return null;
  }
};

const num = (v) => (v === null || v === undefined ? null : Number(v));

const getDashboardAttention = async ({ includeFeedback }) => {
  const [organizerRow, reassignRow, cateringRow, feedbackRow] = await Promise.all([
    // organizers who haven't answered yet
    safeRow(
      "organizerPending",
      `SELECT COUNT(*) AS n FROM booking_organizers WHERE status::text = 'assigned'`
    ),
    // upcoming active bookings whose organizer declined and who have no replacement
    safeRow(
      "organizerNeedsReassign",
      `SELECT COUNT(DISTINCT bo.booking_id) AS n
         FROM booking_organizers bo
         JOIN bookings b ON b.booking_id = bo.booking_id
        WHERE bo.status::text = 'declined'
          AND b.status::text IN ('pending', 'confirmed')
          AND b.event_date >= CURRENT_DATE
          AND NOT EXISTS (
            SELECT 1 FROM booking_organizers x
             WHERE x.booking_id = bo.booking_id
               AND x.status::text NOT IN ${NOT_ACTIVE}
          )`
    ),
    safeRow(
      "cateringPending",
      `SELECT COUNT(*) AS n FROM ${CATERING_TABLE} WHERE status::text = 'pending'`
    ),
    includeFeedback
      ? safeRow(
          "feedback",
          `SELECT COUNT(*) FILTER (WHERE rating <= 2) AS low_rated,
                  COUNT(*) AS total,
                  ROUND(AVG(rating)::numeric, 1) AS avg_rating
             FROM ${FEEDBACK_TABLE}`
        )
      : Promise.resolve(undefined),
  ]);

  return {
    organizerPending: organizerRow ? num(organizerRow.n) : null,
    organizerNeedsReassign: reassignRow ? num(reassignRow.n) : null,
    cateringPending: cateringRow ? num(cateringRow.n) : null,
    feedback:
      feedbackRow === undefined
        ? undefined // role may not see feedback
        : feedbackRow
        ? {
            lowRated: num(feedbackRow.low_rated),
            total: num(feedbackRow.total),
            avgRating: num(feedbackRow.avg_rating),
          }
        : null,
  };
};

module.exports = { getDashboardAttention };
