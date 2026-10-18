const db = require("../config/db");
const crypto = require("crypto");

const fail = (message, statusCode) =>
  Object.assign(new Error(message), { statusCode });

// Sri Lanka is UTC+5:30
const todayLK = () =>
  new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);

const validateDates = (checkIn, checkOut) => {
  const re = /^\d{4}-\d{2}-\d{2}$/;
  if (!re.test(checkIn || "") || !re.test(checkOut || ""))
    throw fail("Valid check-in and check-out dates are required.", 400);
  if (checkIn < todayLK()) throw fail("Check-in cannot be in the past.", 400);
  if (checkOut <= checkIn)
    throw fail("Check-out must be after check-in.", 400);
};

// Release unpaid holds older than 15 minutes
const releaseExpiredHolds = () =>
  db.query(
    `UPDATE room_reservations SET status = 'cancelled'
     WHERE status = 'pending' AND payment_status = 'unpaid'
       AND created_at < NOW() - INTERVAL '15 minutes'`
  );

const getAvailableRooms = async (checkIn, checkOut) => {
  validateDates(checkIn, checkOut);
  await releaseExpiredHolds();
  const { rows } = await db.query(
    `SELECT r.room_id, r.room_name, r.capacity, r.rate_per_day,
            r.rate_per_day * ($2::date - $1::date) AS total_price
     FROM rooms r
     WHERE r.is_active
       AND NOT EXISTS (
         SELECT 1 FROM room_reservations rr
         WHERE rr.room_id = r.room_id
           AND rr.status IN ('pending','confirmed')
           AND daterange(rr.check_in, rr.check_out) && daterange($1::date, $2::date))
     ORDER BY r.room_id`,
    [checkIn, checkOut]
  );
  return rows;
};

const createReservation = async (userId, { roomIds, checkIn, checkOut, guests }) => {
  validateDates(checkIn, checkOut);
  if (!Array.isArray(roomIds) || roomIds.length === 0)
    throw fail("Select at least one room.", 400);
  const ids = [...new Set(roomIds.map(Number))];
  const guestCount = Number(guests) || 1;
  if (!ids.every(Number.isInteger) || guestCount < 1)
    throw fail("Invalid room or guest count.", 400);

  await releaseExpiredHolds();

  // Rooms must exist, be active, and hold the party
  const check = await db.query(
    `SELECT COUNT(*)::int AS n, COALESCE(SUM(capacity),0)::int AS cap
     FROM rooms WHERE room_id = ANY($1::int[]) AND is_active`,
    [ids]
  );
  if (check.rows[0].n !== ids.length)
    throw fail("One or more rooms are unavailable.", 400);
  if (check.rows[0].cap < guestCount)
    throw fail("Selected rooms cannot hold that many guests.", 400);

  const groupRef = `RG-${todayLK().replace(/-/g, "").slice(2)}-${crypto
  .randomBytes(3).toString("hex").toUpperCase()}`;

  try {
    // One statement = atomic: if any room overlaps, none are reserved
    const { rows } = await db.query(
      `INSERT INTO room_reservations
   (reservation_ref, group_ref, user_id, room_id, check_in, check_out, guests, total_amount)
 SELECT 'RM-' || to_char(NOW(),'YYMMDD') || '-' || upper(substr(md5(random()::text || room_id::text),1,5)),
        $6, $1, room_id, $3::date, $4::date, $5,
        rate_per_day * ($4::date - $3::date)
 FROM rooms WHERE room_id = ANY($2::int[])
 RETURNING *, check_in::text AS check_in, check_out::text AS check_out`,
[userId, ids, checkIn, checkOut, guestCount, groupRef]
    );
    return rows;
  } catch (e) {
    if (e.code === "23P01")
      throw fail("A selected room was just booked. Please search again.", 409);
    throw e;
  }
};

const getMyReservations = async (userId) => {
  await releaseExpiredHolds();
  const { rows } = await db.query(
    `SELECT rr.*, rr.check_in::text AS check_in, rr.check_out::text AS check_out,
            r.room_name
     FROM room_reservations rr
     JOIN rooms r ON r.room_id = rr.room_id
     WHERE rr.user_id = $1
     ORDER BY rr.created_at DESC`,
    [userId]
  );
  return rows;
};

const cancelMyReservation = async (userId, reservationId) => {
  const { rows } = await db.query(
    `SELECT *, check_in::text AS check_in
     FROM room_reservations WHERE reservation_id = $1`,
    [reservationId]
  );
  const rr = rows[0];
  // Same 404 for missing and not-yours, so IDs can't be probed
  if (!rr || rr.user_id !== Number(userId))
    throw fail("Reservation not found.", 404);
  if (!["pending", "confirmed"].includes(rr.status))
    throw fail("This reservation can no longer be cancelled.", 400);
  if (rr.check_in <= todayLK() && rr.status === "confirmed")
    throw fail("Confirmed stays cannot be cancelled on or after check-in.", 400);
  const upd = await db.query(
    `UPDATE room_reservations SET status = 'cancelled'
     WHERE reservation_id = $1
     RETURNING *, check_in::text AS check_in, check_out::text AS check_out`,
    [reservationId]
  );
  return upd.rows[0];
};

// Admin / front desk
const getAllReservations = async () => {
  await releaseExpiredHolds();
  const { rows } = await db.query(
    `SELECT rr.*, rr.check_in::text AS check_in, rr.check_out::text AS check_out,
            r.room_name, u.email AS customer_email
     FROM room_reservations rr
     JOIN rooms r ON r.room_id = rr.room_id
     JOIN users u ON u.user_id = rr.user_id
     ORDER BY rr.check_in DESC`
  );
  return rows;
};

const updateStatus = async (reservationId, status) => {
  if (!["confirmed", "cancelled", "completed"].includes(status))
    throw fail("Invalid status.", 400);
  const { rows } = await db.query(
    `UPDATE room_reservations SET status = $2
     WHERE reservation_id = $1
     RETURNING *, check_in::text AS check_in, check_out::text AS check_out`,
    [reservationId, status]
  );
  if (!rows[0]) throw fail("Reservation not found.", 404);
  return rows[0];
};

module.exports = {
  getAvailableRooms,
  createReservation,
  getMyReservations,
  cancelMyReservation,
  getAllReservations,
  updateStatus,
  releaseExpiredHolds,
};
