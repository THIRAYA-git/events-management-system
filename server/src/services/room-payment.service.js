const db = require("../config/db");
const {
  generateCheckoutHash,
  verifyNotifySignature,
} = require("./payment.service");
const { releaseExpiredHolds } = require("./room.service");
const { sendRoomPaymentNotifications } = require("./room-notify.service");

const fail = (message, statusCode) =>
  Object.assign(new Error(message), { statusCode });

const loadGroup = async (groupRef) => {
  const { rows } = await db.query(
    `SELECT rr.reservation_id, rr.user_id, rr.status, rr.payment_status,
            rr.total_amount, rr.nights,
            rr.check_in::text AS check_in, rr.check_out::text AS check_out,
            rr.transaction_id, rr.payment_method, rr.paid_at, r.room_name
     FROM room_reservations rr
     JOIN rooms r ON r.room_id = rr.room_id
     WHERE rr.group_ref = $1
     ORDER BY r.room_id`,
    [groupRef]
  );
  return rows;
};

const sumAmount = (rows) =>
  rows.reduce((s, r) => s + Number(r.total_amount), 0);

// Builds the signed PayHere checkout payload for one reservation group
const initiateGroupPayment = async (userId, groupRef) => {
  if (!groupRef) throw fail("Reservation reference is required.", 400);
  await releaseExpiredHolds();

  const rows = await loadGroup(groupRef);
  // Same 404 for missing and not-yours
  if (!rows.length || rows.some((r) => r.user_id !== Number(userId)))
    throw fail("Reservation not found.", 404);
  if (rows.some((r) => r.status !== "pending" || r.payment_status !== "unpaid"))
    throw fail(
      "This reservation can no longer be paid. It may have expired or already been paid.",
      400
    );

  const base = process.env.API_BASE_URL; // public URL PayHere can reach (ngrok in dev)
  if (!base) throw fail("Payment is not configured.", 500);

  const amount = sumAmount(rows).toFixed(2);

  const u =
    (
      await db.query(
        `SELECT full_name, email, phone FROM users WHERE user_id = $1`,
        [userId]
      )
    ).rows[0] || {};
  const [first, ...rest] = String(u.full_name || "Customer")
    .trim()
    .split(/\s+/);

  const orderId = `ROOM-${groupRef}`;

  return {
    merchant_id: process.env.PAYHERE_MERCHANT_ID,
    notify_url: `${base}/api/payments/notify`,
    order_id: orderId,
    items: `Aazath Plaza rooms: ${rows.map((r) => r.room_name).join(", ")}`,
    currency: "LKR",
    amount,
    hash: generateCheckoutHash(orderId, amount, "LKR"),
    first_name: first,
    last_name: rest.join(" ") || "-",
    email: u.email || "",
    phone: u.phone || "0000000000",
    address: "N/A",
    city: "N/A",
    country: "Sri Lanka",
  };
};

// Status for the checkout page to poll
const getGroupStatus = async (userId, groupRef) => {
  const rows = await loadGroup(groupRef);
  if (!rows.length || rows.some((r) => r.user_id !== Number(userId)))
    throw fail("Reservation not found.", 404);
  const first = rows[0];
  return {
    group_ref: groupRef,
    status: first.status,
    payment_status: rows.every((r) => r.payment_status === "paid")
      ? "paid"
      : "unpaid",
    total_amount: sumAmount(rows),
    paid_at: first.paid_at,
    transaction_id: first.transaction_id,
    payment_method: first.payment_method,
    rooms: rows.map((r) => ({
      room_name: r.room_name,
      check_in: r.check_in,
      check_out: r.check_out,
      nights: r.nights,
    })),
  };
};

// PayHere server-to-server notification
const handleNotify = async (body) => {
  const {
    merchant_id,
    order_id,
    payhere_amount,
    payhere_currency,
    status_code,
    md5sig,
    payment_id,
    method,
  } = body || {};

  if (merchant_id !== process.env.PAYHERE_MERCHANT_ID)
    return { ok: false, reason: "merchant" };
  if (
    !verifyNotifySignature({
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
    })
  )
    return { ok: false, reason: "signature" };

  // Signature is checked against the order_id PayHere saw (with prefix)
  const groupRef = String(order_id).replace(/^ROOM-/, "");

  if (String(status_code) !== "2") return { ok: true, paid: false };

  const rows = await loadGroup(groupRef);
  if (!rows.length) return { ok: false, reason: "unknown order" };

  const expected = sumAmount(rows).toFixed(2);
  if (
    payhere_currency !== "LKR" ||
    Number(payhere_amount).toFixed(2) !== expected
  ) {
    console.error("Room payment amount mismatch", groupRef, payhere_amount);
    return { ok: false, reason: "amount", expected };
  }

  // Idempotent: PayHere may retry
  if (rows.every((r) => r.payment_status === "paid"))
    return { ok: true, paid: true, expected };

  let lateRefund = false;
  try {
    await db.query(
      `UPDATE room_reservations
       SET status = 'confirmed', payment_status = 'paid',
           transaction_id = $2, payment_method = $3, paid_at = NOW()
       WHERE group_ref = $1 AND payment_status = 'unpaid'`,
      [groupRef, payment_id || null, method || null]
    );
  } catch (e) {
    if (e.code !== "23P01") throw e;
    // Hold expired and rooms were re-booked: record payment, flag for refund
    console.error("LATE ROOM PAYMENT, REFUND NEEDED:", groupRef, payment_id);
    await db.query(
      `UPDATE room_reservations
       SET payment_status = 'paid', transaction_id = $2,
           payment_method = $3, paid_at = NOW()
       WHERE group_ref = $1 AND payment_status = 'unpaid'`,
      [groupRef, payment_id || null, method || null]
    );
    lateRefund = true;
  }

  // Confirmation email (with invoice PDF) + SMS. Not awaited: PayHere needs a
  // fast reply, and a notification failure must never fail the payment.
  if (!lateRefund) {
    sendRoomPaymentNotifications(groupRef).catch((e) =>
      console.error("[room notify] failed:", e.message)
    );
  }
  return { ok: true, paid: true, expected, lateRefund };
};

module.exports = { initiateGroupPayment, getGroupStatus, handleNotify };
