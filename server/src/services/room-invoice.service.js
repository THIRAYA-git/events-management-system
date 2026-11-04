const db = require("../config/db");
const crypto = require("crypto");
const { generateRoomInvoicePdf } = require("./room-pdf.service");

const STAFF_ROLES = ["admin", "front_desk"];
const fail = (message, statusCode) => Object.assign(new Error(message), { statusCode });

const GROUP_MATCH = "COALESCE(rr.group_ref, rr.reservation_ref) = $1";

// e.g. INV-RM-261102-A3F9 (Sri Lanka date)
const newInvoiceNumber = () => {
  const d = new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(2, 10).replace(/-/g, "");
  return `INV-RM-${d}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
};

// Paid rooms of one group, with customer details.
const loadPaidGroup = async (groupRef) => {
  const { rows } = await db.query(
    `SELECT rr.user_id, rr.check_in::text AS check_in, rr.check_out::text AS check_out,
            rr.nights, rr.guests, rr.total_amount, rr.payment_method, rr.transaction_id,
            rr.paid_at, rr.invoice_number, rr.payment_note,
            r.room_name, u.full_name, u.email, u.phone
       FROM room_reservations rr
       JOIN rooms r ON r.room_id = rr.room_id
       JOIN users u ON u.user_id = rr.user_id
      WHERE ${GROUP_MATCH} AND rr.payment_status = 'paid'
      ORDER BY r.room_name`,
    [groupRef]
  );
  return rows;
};

// Online (PayHere) payments get their number here; cash sets it directly.
const ensureInvoiceNumber = async (groupRef) => {
  await db.query(
    `UPDATE room_reservations rr SET invoice_number = $2
      WHERE ${GROUP_MATCH} AND rr.payment_status = 'paid' AND rr.invoice_number IS NULL`,
    [groupRef, newInvoiceNumber()]
  );
  const { rows } = await db.query(
    `SELECT invoice_number FROM room_reservations rr
      WHERE ${GROUP_MATCH} AND rr.invoice_number IS NOT NULL LIMIT 1`,
    [groupRef]
  );
  return rows[0]?.invoice_number || null;
};

const renderInvoice = async (groupRef, rows) => {
  const invoiceNumber = rows[0].invoice_number || (await ensureInvoiceNumber(groupRef));
  const first = rows[0];
  const amount = rows.reduce((s, r) => s + Number(r.total_amount), 0);
  const buffer = await generateRoomInvoicePdf({
    invoiceNumber,
    groupRef,
    customer: { full_name: first.full_name, email: first.email, phone: first.phone },
    rooms: rows.map((r) => ({ room_name: r.room_name, nights: r.nights, total_amount: r.total_amount })),
    checkIn: first.check_in,
    checkOut: first.check_out,
    guests: first.guests,
    payment: {
      method: first.payment_method,
      transactionId: first.transaction_id,
      note: first.payment_note,
      paidAt: first.paid_at,
      amount,
    },
  });
  return { buffer, invoiceNumber, filename: `${invoiceNumber}.pdf`, amount, rows };
};

// Download route: staff can fetch any invoice, customers only their own.
const getRoomInvoice = async (groupRef, user) => {
  const rows = await loadPaidGroup(groupRef);
  const isStaff = STAFF_ROLES.includes(user.role);
  // Same 404 for missing / unpaid / not yours
  if (!rows.length || (!isStaff && rows[0].user_id !== Number(user.id)))
    throw fail("Invoice not available. Payment has not been completed.", 404);
  return renderInvoice(groupRef, rows);
};

module.exports = { newInvoiceNumber, loadPaidGroup, ensureInvoiceNumber, renderInvoice, getRoomInvoice };