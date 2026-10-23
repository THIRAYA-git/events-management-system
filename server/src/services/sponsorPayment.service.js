const db = require("../config/db");
const {
  generateCheckoutHash,
  verifyNotifySignature,
} = require("./payment.service");

const fail = (message, statusCode) =>
  Object.assign(new Error(message), { statusCode });

// Loads one sponsorship and proves it belongs to this sponsor user.
// Same 404 for "missing" and "not yours" so ids can't be probed.
const loadOwned = async (requestId, userId) => {
  const { rows } = await db.query(
    `SELECT bs.id, bs.booking_id, bs.proposed_amount, bs.status,
            bs.payment_status, bs.paid_at, bs.transaction_id, bs.payment_method,
            b.booking_ref, b.event_type, b.status AS booking_status,
            s.company_name, s.user_id AS sponsor_user_id
     FROM booking_sponsors bs
     JOIN sponsors s ON s.sponsor_id = bs.sponsor_id
     JOIN bookings b ON b.booking_id = bs.booking_id
     WHERE bs.id = $1`,
    [requestId]
  );
  const row = rows[0];
  if (!row || row.sponsor_user_id !== Number(userId))
    throw fail("Sponsorship not found.", 404);
  return row;
};

// Builds the signed PayHere payload. The amount always comes from the DB.
const initiateSponsorPayment = async (userId, requestId) => {
  const row = await loadOwned(requestId, userId);

  if (row.status !== "accepted")
    throw fail("Only accepted sponsorships can be paid.", 400);
  if (row.payment_status === "paid")
    throw fail("This sponsorship has already been paid.", 409);
  if (row.booking_status === "cancelled")
    throw fail("This event has been cancelled, so it can't be paid.", 400);
  if (row.proposed_amount == null || Number(row.proposed_amount) <= 0)
    throw fail("This sponsorship has no amount to pay.", 400);

  const base = process.env.API_BASE_URL;
  if (!base) throw fail("Payment is not configured.", 500);

  const amount = Number(row.proposed_amount).toFixed(2);
  const orderId = `SPON-${row.id}-${Date.now()}`;

  await db.query(
    `UPDATE booking_sponsors SET payhere_order_id = $2 WHERE id = $1`,
    [row.id, orderId]
  );

  const u =
    (
      await db.query(
        `SELECT full_name, email, phone FROM users WHERE user_id = $1`,
        [userId]
      )
    ).rows[0] || {};
  const [first, ...rest] = String(u.full_name || row.company_name || "Sponsor")
    .trim()
    .split(/\s+/);

  return {
    merchant_id: process.env.PAYHERE_MERCHANT_ID,
    notify_url: `${base}/api/payments/notify`,
    order_id: orderId,
    items: `Sponsorship - ${row.event_type} (${row.booking_ref})`,
    currency: "LKR",
    amount,
    hash: generateCheckoutHash(orderId, amount, "LKR"),
    first_name: first,
    last_name: rest.join(" ") || "-",
    email: u.email || "",
    phone: u.phone || "0000000000",
    address: "N/A",
    city: "Oluvil",
    country: "Sri Lanka",
  };
};

// Polled by the page after the PayHere popup closes
const getSponsorPaymentStatus = async (userId, requestId) => {
  const row = await loadOwned(requestId, userId);
  return {
    id: row.id,
    payment_status: row.payment_status,
    paid_at: row.paid_at,
    transaction_id: row.transaction_id,
    payment_method: row.payment_method,
    amount: Number(row.proposed_amount),
  };
};

// PayHere server-to-server notification for SPON- orders
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

  const m = /^SPON-(\d+)-\d+$/.exec(String(order_id));
  if (!m) return { ok: false, reason: "unknown order" };
  const requestId = Number(m[1]);

  if (String(status_code) !== "2") return { ok: true, paid: false };

  const { rows } = await db.query(
    `SELECT bs.id, bs.proposed_amount, bs.status, bs.payment_status,
            b.status AS booking_status
     FROM booking_sponsors bs
     JOIN bookings b ON b.booking_id = bs.booking_id
     WHERE bs.id = $1`,
    [requestId]
  );
  const row = rows[0];
  if (!row) return { ok: false, reason: "unknown order" };

  const expected = Number(row.proposed_amount).toFixed(2);
  if (
    payhere_currency !== "LKR" ||
    Number(payhere_amount).toFixed(2) !== expected
  ) {
    console.error("Sponsor payment amount mismatch", requestId, payhere_amount);
    return { ok: false, reason: "amount", expected };
  }

  // Idempotent: PayHere may retry
  if (row.payment_status === "paid") return { ok: true, paid: true, expected };

  // The DB check forbids paid + not accepted, so record nothing and flag it
  if (row.status !== "accepted") {
    console.error(
      "SPONSOR PAYMENT ON NON-ACCEPTED REQUEST, REFUND NEEDED:",
      requestId,
      payment_id
    );
    return { ok: true, paid: true, expected, lateRefund: true };
  }

  await db.query(
    `UPDATE booking_sponsors
     SET payment_status = 'paid', paid_at = NOW(),
         transaction_id = $2, payment_method = $3
     WHERE id = $1 AND payment_status = 'unpaid'`,
    [requestId, payment_id || null, method || null]
  );

  // Event cancelled while the sponsor was paying: keep the record, flag it
  const lateRefund = row.booking_status === "cancelled";
  if (lateRefund)
    console.error(
      "SPONSOR PAID FOR CANCELLED EVENT, REFUND NEEDED:",
      requestId,
      payment_id
    );

  return { ok: true, paid: true, expected, lateRefund };
};

module.exports = {
  initiateSponsorPayment,
  getSponsorPaymentStatus,
  handleNotify,
};