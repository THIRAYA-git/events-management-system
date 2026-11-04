const db = require("../config/db");
const { releaseExpiredHolds } = require("./room.service");
const { newInvoiceNumber } = require("./room-invoice.service");
const { sendRoomPaymentNotifications } = require("./room-notify.service");

const fail = (message, statusCode) => Object.assign(new Error(message), { statusCode });

// One row per room booking group (rooms booked together), for staff.
const getGroups = async () => {
  await releaseExpiredHolds();
  const { rows } = await db.query(
    `SELECT COALESCE(rr.group_ref, rr.reservation_ref) AS group_ref,
            u.full_name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
            string_agg(r.room_name, ', ' ORDER BY r.room_name) AS rooms,
            COUNT(*)::int AS room_count,
            MIN(rr.check_in)::text AS check_in,
            MIN(rr.check_out)::text AS check_out,
            MAX(rr.nights)::int AS nights,
            MAX(rr.guests)::int AS guests,
            SUM(rr.total_amount) AS total_amount,
            CASE
              WHEN COUNT(*) FILTER (WHERE rr.status = 'cancelled') = COUNT(*) THEN 'cancelled'
              WHEN COUNT(*) FILTER (WHERE rr.status = 'completed') = COUNT(*) THEN 'completed'
              WHEN COUNT(*) FILTER (WHERE rr.status = 'confirmed') > 0 THEN 'confirmed'
              ELSE 'pending'
            END AS status,
            CASE WHEN bool_and(rr.payment_status = 'paid') THEN 'paid' ELSE 'unpaid' END AS payment_status,
            MAX(rr.payment_method) AS payment_method,
            MAX(rr.paid_at) AS paid_at,
            MAX(rr.invoice_number) AS invoice_number,
            MAX(rr.payment_note) AS payment_note,
            MIN(rr.created_at) AS created_at
       FROM room_reservations rr
       JOIN rooms r ON r.room_id = rr.room_id
       JOIN users u ON u.user_id = rr.user_id
      GROUP BY COALESCE(rr.group_ref, rr.reservation_ref), u.user_id, u.full_name, u.email, u.phone
      ORDER BY MIN(rr.created_at) DESC`
  );
  return rows;
};

// Staff received cash at the front desk: mark the whole group paid + confirmed.
const recordCashPayment = async (groupRef, staffUserId, note) => {
  await releaseExpiredHolds();
  const cleanNote = String(note || "").trim().slice(0, 200) || null;
  const invoiceNumber = newInvoiceNumber();

  // One statement = atomic, and the unpaid guard stops a double click paying twice
  const { rows } = await db.query(
    `UPDATE room_reservations
        SET payment_status = 'paid', payment_method = 'cash', paid_at = NOW(),
            status = CASE WHEN status = 'pending' THEN 'confirmed' ELSE status END,
            invoice_number = $2, payment_note = $3, received_by = $4
      WHERE COALESCE(group_ref, reservation_ref) = $1
        AND payment_status = 'unpaid' AND status IN ('pending','confirmed')
      RETURNING total_amount`,
    [groupRef, invoiceNumber, cleanNote, staffUserId]
  );

  if (!rows.length) {
    const exists = await db.query(
      `SELECT 1 FROM room_reservations WHERE COALESCE(group_ref, reservation_ref) = $1 LIMIT 1`,
      [groupRef]
    );
    if (!exists.rows.length) throw fail("Room booking not found.", 404);
    throw fail("Nothing to pay: already paid, cancelled or expired.", 409);
  }

  const amount = rows.reduce((s, r) => s + Number(r.total_amount), 0);
  // Fire and forget: email/SMS failures must never fail the payment
  sendRoomPaymentNotifications(groupRef).catch((e) =>
    console.error("[room cash] notify failed:", e.message)
  );
  return { group_ref: groupRef, amount, invoice_number: invoiceNumber, payment_method: "cash" };
};

module.exports = { getGroups, recordCashPayment };