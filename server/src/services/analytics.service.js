// ─────────────────────────────────────────────────────────────
//  server/src/services/analytics.service.js
//  Admin analytics dashboard — revenue, utilization, and
//  customer metrics. All revenue-bearing queries filter to
//  status IN ('confirmed', 'completed') since pending bookings
//  aren't guaranteed money and cancelled bookings never happened.
//  The status breakdown itself is the exception — it reports
//  all four statuses, since that's its whole purpose.
// ─────────────────────────────────────────────────────────────
const { query } = require("../config/db");

const REVENUE_STATUSES = ["confirmed", "completed"];

// ── Revenue over time, bucketed by month ───────────────────────
const getRevenueOverTime = async ({ dateFrom, dateTo }) => {
  const { rows } = await query(
    `
    SELECT
      to_char(date_trunc('month', event_date), 'YYYY-MM') AS month,
      COALESCE(SUM(total_amount), 0)::numeric AS revenue
    FROM bookings
    WHERE status = ANY($1)
      AND ($2::date IS NULL OR event_date >= $2::date)
      AND ($3::date IS NULL OR event_date <= $3::date)
    GROUP BY 1
    ORDER BY 1
    `,
    [REVENUE_STATUSES, dateFrom || null, dateTo || null]
  );
  return rows;
};

// ── Revenue broken down by event type ──────────────────────────
const getRevenueByEventType = async ({ dateFrom, dateTo }) => {
  const { rows } = await query(
    `
    SELECT
      event_type,
      COALESCE(SUM(total_amount), 0)::numeric AS revenue
    FROM bookings
    WHERE status = ANY($1)
      AND ($2::date IS NULL OR event_date >= $2::date)
      AND ($3::date IS NULL OR event_date <= $3::date)
    GROUP BY event_type
    ORDER BY revenue DESC
    `,
    [REVENUE_STATUSES, dateFrom || null, dateTo || null]
  );
  return rows;
};

// ── Hall utilization — booking counts per hall ─────────────────
const getHallUtilization = async ({ dateFrom, dateTo }) => {
  const { rows } = await query(
    `
    SELECT
      h.hall_id,
      h.hall_name,
      COUNT(*)::integer AS booking_count
    FROM hall_bookings hb
    JOIN halls h    ON h.hall_id = hb.hall_id
    JOIN bookings b ON b.booking_id = hb.booking_id
    WHERE b.status = ANY($1)
      AND ($2::date IS NULL OR b.event_date >= $2::date)
      AND ($3::date IS NULL OR b.event_date <= $3::date)
    GROUP BY h.hall_id, h.hall_name
    ORDER BY h.hall_name
    `,
    [REVENUE_STATUSES, dateFrom || null, dateTo || null]
  );
  return rows;
};

// ── Booking status breakdown — ALL statuses, no filter ─────────
const getStatusBreakdown = async ({ dateFrom, dateTo }) => {
  const { rows } = await query(
    `
    SELECT
      status,
      COUNT(*)::integer AS count
    FROM bookings
    WHERE ($1::date IS NULL OR event_date >= $1::date)
      AND ($2::date IS NULL OR event_date <= $2::date)
    GROUP BY status
    ORDER BY status
    `,
    [dateFrom || null, dateTo || null]
  );
  return rows;
};

// ── Top 5 customers by confirmed/completed spend ──────────────d─
const getTopCustomers = async ({ dateFrom, dateTo, limit = 5 }) => {
  const { rows } = await query(
    `
    SELECT
      u.user_id AS customer_id,
      u.full_name AS customer_name,
      u.email AS customer_email,
      COALESCE(SUM(b.total_amount), 0)::numeric AS total_spend,
      COUNT(*)::integer AS booking_count
    FROM bookings b
    JOIN users u ON u.user_id = b.user_id
    WHERE b.status = ANY($1)
      AND ($2::date IS NULL OR b.event_date >= $2::date)
      AND ($3::date IS NULL OR b.event_date <= $3::date)
    GROUP BY u.user_id, u.full_name, u.email
    ORDER BY total_spend DESC
    LIMIT $4
    `,
    [REVENUE_STATUSES, dateFrom || null, dateTo || null, limit]
  );
  return rows;
};

// ── Combined dashboard payload — one call, five metrics ────────
const getDashboardAnalytics = async ({ dateFrom, dateTo }) => {
  const [revenueOverTime, revenueByEventType, hallUtilization, statusBreakdown, topCustomers, roomAccommodationsByEventType] =
    await Promise.all([
      getRevenueOverTime({ dateFrom, dateTo }),
      getRevenueByEventType({ dateFrom, dateTo }),
      getHallUtilization({ dateFrom, dateTo }),
      getStatusBreakdown({ dateFrom, dateTo }),
      getTopCustomers({ dateFrom, dateTo, limit: 5 }),
      getRoomAccommodationsByEventType({ dateFrom, dateTo }),
    ]);

  return {
    revenueOverTime,
    revenueByEventType,
    hallUtilization,
    statusBreakdown,
    topCustomers,
    roomAccommodationsByEventType,
    accommodationModuleImplemented: true,
  };
};


// ── Room accommodations by event type ───────────────────────────
const getRoomAccommodationsByEventType = async ({ dateFrom, dateTo }) => {
  const { rows } = await query(
    `
    SELECT
      event_type,
      COALESCE(SUM(room_count), 0)::integer AS total_rooms,
      COUNT(*) FILTER (WHERE room_count > 0)::integer AS bookings_with_rooms
    FROM bookings
    WHERE status = ANY($1)
      AND ($2::date IS NULL OR event_date >= $2::date)
      AND ($3::date IS NULL OR event_date <= $3::date)
    GROUP BY event_type
    HAVING COALESCE(SUM(room_count), 0) > 0
    ORDER BY total_rooms DESC
    `,
    [REVENUE_STATUSES, dateFrom || null, dateTo || null]
  );
  return rows;
};

module.exports = {
  getRevenueOverTime,
  getRevenueByEventType,
  getHallUtilization,
  getStatusBreakdown,
  getTopCustomers,
  getRoomAccommodationsByEventType,
  getDashboardAnalytics,
};