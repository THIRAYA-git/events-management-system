// ─────────────────────────────────────────────────────────────
//  server/src/services/report.service.js
//  FR-021 Generate Reports — daily / weekly / monthly / annual
//  reports covering hall bookings, event types and room revenue.
//
//  Conventions (same as analytics.service.js):
//   • Revenue only counts status IN ('confirmed', 'completed').
//   • The status counts report all four statuses.
//   • Everything is bucketed on bookings.event_date.
//
//  ROOM REVENUE: on the room bookings checked, addon_amount equals
//  room_count × 5,000 (one day per room), but addon_amount is also
//  non-zero on bookings with no rooms, so it is NOT only room money.
//  Hall revenue = base_amount, room revenue = room_count ×
//  ROOM_RATE_PER_DAY, other add-ons = addon_amount − room revenue,
//  plus tax_amount and minus discount_amount. These reconcile to
//  total_amount; room revenue is part of it, never added on top.
//  CAVEAT: bookings made before room_count was recorded show their
//  room charges under "other add-ons" until room_count is backfilled.
// ─────────────────────────────────────────────────────────────
const { query } = require("../config/db");

const REVENUE_STATUSES = ["confirmed", "completed"];
const PERIODS = ["daily", "weekly", "monthly", "annual"];

const ROOM_RATE_PER_DAY = 5000; // LKR per room, one day (FR-009)
const DETAIL_ROW_LIMIT = 500;

// ── Date helpers (UTC maths so server timezone never shifts a day) ──
const MS_DAY = 24 * 60 * 60 * 1000;
const pad = (n) => String(n).padStart(2, "0");
const fmt = (d) =>
  `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const addDays = (d, n) => new Date(d.getTime() + n * MS_DAY);

const badRequest = (message) => {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
};

const parseDate = (str) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    throw badRequest("date must be in YYYY-MM-DD format.");
  }
  const [y, m, d] = str.split(
    "-"
  ).map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== m - 1 ||
    dt.getUTCDate() !== d
  ) {
    throw badRequest("date is not a valid calendar date.");
  }
  return dt;
};

const todayColombo = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" });

// Inclusive [start, end] range of the period containing `anchor`
const getRange = (period, anchor) => {
  const y = anchor.getUTCFullYear();
  const m = anchor.getUTCMonth();
  switch (period) {
    case "daily":
      return { start: anchor, end: anchor };
    case "weekly": {
      const offsetFromMonday = (anchor.getUTCDay() + 6) % 7;
      const start = addDays(anchor, -offsetFromMonday);
      return { start, end: addDays(start, 6) };
    }
    case "monthly":
      return {
        start: new Date(Date.UTC(y, m, 1)),
        end: new Date(Date.UTC(y, m + 1, 0)),
      };
    case "annual":
      return {
        start: new Date(Date.UTC(y, 0, 1)),
        end: new Date(Date.UTC(y, 11, 31)),
      };
    default:
      throw badRequest(`period must be one of: ${PERIODS.join(", ")}.`);
  }
};

// ── Queries ────────────────────────────────────────────────────
const getSummary = async (from, to) => {
  const { rows } = await query(
    `
    SELECT
      COUNT(*)::integer AS total_bookings,
      COUNT(*) FILTER (WHERE status = 'pending')::integer   AS pending,
      COUNT(*) FILTER (WHERE status = 'confirmed')::integer AS confirmed,
      COUNT(*) FILTER (WHERE status = 'completed')::integer AS completed,
      COUNT(*) FILTER (WHERE status = 'cancelled')::integer AS cancelled,
      COALESCE(SUM(guest_count) FILTER (WHERE status = ANY($3)), 0)::integer AS total_guests,
      COALESCE(SUM(total_amount) FILTER (WHERE status = ANY($3)), 0)::numeric AS total_revenue,
      COALESCE(SUM(base_amount) FILTER (WHERE status = ANY($3)), 0)::numeric AS hall_revenue,
      COALESCE(SUM(addon_amount) FILTER (WHERE status = ANY($3)), 0)::numeric AS addon_total,
      COALESCE(SUM(tax_amount) FILTER (WHERE status = ANY($3)), 0)::numeric AS tax_total,
      COALESCE(SUM(discount_amount) FILTER (WHERE status = ANY($3)), 0)::numeric AS discount_total,
      COALESCE(SUM(room_count) FILTER (WHERE status = ANY($3)), 0)::integer AS rooms_booked
    FROM bookings
    WHERE event_date BETWEEN $1::date AND $2::date
    `,
    [from, to, REVENUE_STATUSES]
  );
  const r = rows[0];
  return {
    total_bookings: r.total_bookings,
    pending: r.pending,
    confirmed: r.confirmed,
    completed: r.completed,
    cancelled: r.cancelled,
    total_guests: r.total_guests,
    total_revenue: Number(r.total_revenue),
    hall_revenue: Number(r.hall_revenue),
    room_revenue: r.rooms_booked * ROOM_RATE_PER_DAY,
    // total = hall + rooms + addon_other + tax − discounts
    addon_other_revenue:
      Math.round(
        (Number(r.addon_total) - r.rooms_booked * ROOM_RATE_PER_DAY) * 100
      ) / 100,
    tax_total: Number(r.tax_total),
    discount_total: Number(r.discount_total),
    rooms_booked: r.rooms_booked,
  };
};

const getByEventType = async (from, to) => {
  const { rows } = await query(
    `
    SELECT
      event_type,
      COUNT(*)::integer AS bookings,
      COALESCE(SUM(guest_count), 0)::integer AS guests,
      COALESCE(SUM(total_amount), 0)::numeric AS revenue
    FROM bookings
    WHERE status = ANY($3)
      AND event_date BETWEEN $1::date AND $2::date
    GROUP BY event_type
    ORDER BY revenue DESC
    `,
    [from, to, REVENUE_STATUSES]
  );
  return rows.map((r) => ({ ...r, revenue: Number(r.revenue) }));
};

// A two-hall booking has two hall_bookings rows, so it counts once per hall.
const getByHall = async (from, to) => {
  const { rows } = await query(
    `
    SELECT
      h.hall_id,
      h.hall_name,
      COUNT(*)::integer AS booking_count,
      COUNT(*) FILTER (WHERE hb.is_complimentary)::integer AS complimentary_count
    FROM hall_bookings hb
    JOIN halls h    ON h.hall_id = hb.hall_id
    JOIN bookings b ON b.booking_id = hb.booking_id
    WHERE b.status = ANY($3)
      AND b.event_date BETWEEN $1::date AND $2::date
    GROUP BY h.hall_id, h.hall_name
    ORDER BY h.hall_name
    `,
    [from, to, REVENUE_STATUSES]
  );
  return rows;
};

const getRoomSection = async (from, to) => {
  const { rows } = await query(
    `
    SELECT
      event_type,
      COALESCE(SUM(room_count), 0)::integer AS total_rooms,
      COUNT(*) FILTER (WHERE room_count > 0)::integer AS bookings_with_rooms
    FROM bookings
    WHERE status = ANY($3)
      AND event_date BETWEEN $1::date AND $2::date
    GROUP BY event_type
    HAVING COALESCE(SUM(room_count), 0) > 0
    ORDER BY total_rooms DESC
    `,
    [from, to, REVENUE_STATUSES]
  );

  const byEventType = rows.map((r) => ({
    ...r,
    revenue: r.total_rooms * ROOM_RATE_PER_DAY,
  }));
  const totalRooms = byEventType.reduce((s, r) => s + r.total_rooms, 0);

  return {
    total_rooms: totalRooms,
    bookings_with_rooms: byEventType.reduce(
      (s, r) => s + r.bookings_with_rooms,
      0
    ),
    revenue: totalRooms * ROOM_RATE_PER_DAY,
    rate_per_day: ROOM_RATE_PER_DAY,
    by_event_type: byEventType,
  };
};

// Day buckets for daily/weekly/monthly, month buckets for annual
const getBreakdown = async (from, to, unit) => {
  const { rows } = await query(
    `
    SELECT
      to_char(date_trunc($4::text, event_date), 'YYYY-MM-DD') AS bucket,
      COUNT(*)::integer AS total_bookings,
      COUNT(*) FILTER (WHERE status = ANY($3))::integer AS confirmed_bookings,
      COALESCE(SUM(total_amount) FILTER (WHERE status = ANY($3)), 0)::numeric AS revenue
    FROM bookings
    WHERE event_date BETWEEN $1::date AND $2::date
    GROUP BY 1
    ORDER BY 1
    `,
    [from, to, REVENUE_STATUSES, unit]
  );
  return rows.map((r) => ({ ...r, revenue: Number(r.revenue) }));
};

const getBookingRows = async (from, to) => {
  const { rows } = await query(
    `
    SELECT
      b.booking_id,
      b.booking_ref,
      u.full_name AS customer_name,
      to_char(b.event_date, 'YYYY-MM-DD') AS event_date,
      b.event_type,
      b.guest_count,
      b.room_count,
      b.status,
      b.total_amount,
      COALESCE(
        NULLIF(string_agg(h.hall_name, ' + ' ORDER BY h.hall_name), ''),
        'Not assigned'
      ) AS halls
    FROM bookings b
    JOIN users u ON u.user_id = b.user_id
    LEFT JOIN hall_bookings hb ON hb.booking_id = b.booking_id
    LEFT JOIN halls h ON h.hall_id = hb.hall_id
    WHERE b.event_date BETWEEN $1::date AND $2::date
    GROUP BY b.booking_id, u.full_name
    ORDER BY b.event_date, b.event_start_time
    LIMIT $3
    `,
    [from, to, DETAIL_ROW_LIMIT]
  );
  return rows;
};

// ── Public: one report for a period ────────────────────────────
const generateReport = async ({ period, date }) => {
  if (!PERIODS.includes(period)) {
    throw badRequest(`period must be one of: ${PERIODS.join(", ")}.`);
  }
  const anchor = parseDate(date || todayColombo());
  const range = getRange(period, anchor);
  const prevRange = getRange(period, addDays(range.start, -1));

  const from = fmt(range.start);
  const to = fmt(range.end);

  const [summary, previous, byEventType, byHall, rooms, breakdown, bookings] =
    await Promise.all([
      getSummary(from, to),
      getSummary(fmt(prevRange.start), fmt(prevRange.end)),
      getByEventType(from, to),
      getByHall(from, to),
      getRoomSection(from, to),
      getBreakdown(from, to, period === "annual" ? "month" : "day"),
      getBookingRows(from, to),
    ]);

  const revenueChangePct =
    previous.total_revenue > 0
      ? Math.round(
          ((summary.total_revenue - previous.total_revenue) /
            previous.total_revenue) *
            1000
        ) / 10
      : null;

  return {
    period,
    range: { from, to },
    previous_range: { from: fmt(prevRange.start), to: fmt(prevRange.end) },
    summary: {
      ...summary,
      previous_revenue: previous.total_revenue,
      previous_bookings: previous.total_bookings,
      revenue_change_pct: revenueChangePct,
    },
    by_event_type: byEventType,
    by_hall: byHall,
    rooms,
    breakdown,
    bookings,
    bookings_truncated: bookings.length >= DETAIL_ROW_LIMIT,
  };
};

module.exports = { generateReport, PERIODS };