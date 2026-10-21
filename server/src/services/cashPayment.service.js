// ─────────────────────────────────────────────────────────────────────────────
//  Records a cash payment received at the front desk.
//  Step 1 (one atomic statement): payments row + audit_log row.
//  Step 2: invoice number, same format as the PayHere webhook
//          (INV-YYYYMMDD-<payment_id>). It needs the new payment_id, so it
//          can't be in the same statement. If it fails the payment is still
//          saved and the number can be back-filled.
//  Pays the remaining balance in full; already-paid, pending and cancelled
//  bookings insert nothing and are reported as 409.
// ─────────────────────────────────────────────────────────────────────────────
const { query } = require("../config/db");

const PAYABLE_STATUSES = ["confirmed", "completed"];

const httpError = (message, statusCode) => {
  const e = new Error(message);
  e.statusCode = statusCode;
  return e;
};

const recordCashPayment = async (
  bookingId,
  { staffId, note, ipAddress, userAgent }
) => {
  const result = await query(
    `
    WITH target AS (
      SELECT b.booking_id, b.booking_ref, b.status, b.total_amount, b.event_type,
             COALESCE((SELECT SUM(p.amount)
                         FROM payments p
                        WHERE p.booking_id = b.booking_id
                          AND p.status = 'completed'), 0) AS paid
        FROM bookings b
       WHERE b.booking_id = $1::integer
         FOR UPDATE OF b
    ),
    inserted AS (
      INSERT INTO payments
        (booking_id, amount, payment_method, transaction_id, status,
         currency, paid_at, gateway_response)
      SELECT t.booking_id,
             t.total_amount - t.paid,
             'cash'::payment_method,
             'CASH-' || t.booking_id || '-' || (EXTRACT(EPOCH FROM NOW()) * 1000)::bigint,
             'completed'::payment_status,
             'LKR',
             NOW(),
             jsonb_build_object(
               'source', 'manual_cash',
               'recorded_by', $2::integer,
               'note', $3::text
             )
        FROM target t
       WHERE t.status IN ('confirmed', 'completed')
         AND t.total_amount - t.paid > 0
      RETURNING payment_id, booking_id, amount
    ),
    audited AS (
      INSERT INTO audit_log
        (user_id, action, table_name, record_id, new_values, ip_address, user_agent)
      SELECT $2::integer,
             'RECORD_CASH_PAYMENT',
             'payments',
             i.payment_id,
             jsonb_build_object(
               'booking_id', i.booking_id,
               'event_type', t.event_type,
               'amount', i.amount,
               'expected_amount', t.total_amount - t.paid,
               'payment_method', 'cash',
               'note', $3::text
             ),
             $4::text,
             $5::text
        FROM inserted i
        JOIN target t ON t.booking_id = i.booking_id
    )
    SELECT t.booking_ref, t.status, t.total_amount, t.paid,
           i.payment_id, i.amount
      FROM target t
      LEFT JOIN inserted i ON i.booking_id = t.booking_id
    `,
    [
      bookingId,
      staffId || null,
      note || null,
      ipAddress || null,
      userAgent || null,
    ]
  );

  if (result.rows.length === 0) throw httpError("Booking not found.", 404);

  const row = result.rows[0];
  if (!row.payment_id) {
    if (!PAYABLE_STATUSES.includes(row.status)) {
      throw httpError(
        `Only confirmed bookings can be paid (this one is ${row.status}).`,
        409
      );
    }
    throw httpError("This booking is already fully paid.", 409);
  }

  // Step 2: invoice number (same format as the PayHere webhook)
  let invoiceNumber = null;
  try {
    const inv = await query(
      `UPDATE payments
          SET invoice_number = 'INV-' || to_char(NOW(), 'YYYYMMDD') || '-' || payment_id,
              updated_at = NOW()
        WHERE payment_id = $1 AND invoice_number IS NULL
        RETURNING invoice_number`,
      [row.payment_id]
    );
    invoiceNumber = inv.rows[0]?.invoice_number ?? null;
  } catch (invErr) {
    console.error(
      `[cashPayment] Invoice number failed for payment ${row.payment_id}:`,
      invErr.message
    );
  }

  return {
    payment_id: row.payment_id,
    booking_id: bookingId,
    booking_ref: row.booking_ref,
    amount: row.amount,
    invoice_number: invoiceNumber,
  };
};

module.exports = { recordCashPayment };