const express = require("express");
const router = express.Router();

const {
  generateCheckoutHash,
  verifyNotifySignature,
} = require("../services/payment.service");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const { getBookingById } = require("../services/booking.service");
const { findUserById } = require("../models/user.model");
const { query } = require("../config/db");
const { generateInvoicePdf } = require("../services/pdf.service");
const {
  handleNotify: handleRoomNotify,
} = require("../services/room-payment.service");
const {
  handleNotify: handleSponsorNotify,
} = require("../services/sponsorPayment.service");
const {
  loadInvoiceData,
  sendPaymentNotifications,
} = require("../services/paymentNotify.service");

// Marks a completed payment as needing a manual refund. Uses the existing
// gateway_response jsonb column, so no schema change is required.
async function flagForRefund(paymentId, reason) {
  await query(
    `UPDATE payments
     SET gateway_response = COALESCE(gateway_response, '{}'::jsonb)
                            || jsonb_build_object('needs_refund', true, 'refund_reason', $2::text),
         updated_at = NOW()
     WHERE payment_id = $1`,
    [paymentId, reason]
  );
}

const PAYMENT_AUDIT_ACTIONS = {
  2: "PAYMENT_SUCCESS",
  0: "PAYMENT_PENDING",
  "-1": "PAYMENT_CANCELLED",
  "-2": "PAYMENT_FAILED",
  "-3": "PAYMENT_CHARGEDBACK",
};

// NFR-014: logs every PayHere notification with event type and pricing.
// Never throws, so auditing can't change the 200/400 PayHere receives.
async function auditPayment(action, body, ip, extra = {}) {
  try {
    const r = await query(
      `SELECT p.payment_id, p.amount AS expected_amount, b.event_type
         FROM payments p
         JOIN bookings b ON b.booking_id = p.booking_id
        WHERE p.payhere_order_id = $1`,
      [body.order_id]
    );
    const row = r.rows[0];
    await query(
      `INSERT INTO audit_log (user_id, action, table_name, record_id, new_values, ip_address)
       VALUES (NULL, $1, 'payments', $2, $3::jsonb, $4)
       ON CONFLICT DO NOTHING`,
      [
        action,
        row?.payment_id ?? null,
        JSON.stringify({
          order_id: body.order_id,
          payment_ref: body.payment_id ?? null,
          status_code: String(body.status_code),
          event_type: row?.event_type ?? null,
          amount: body.payhere_amount ?? null,
          expected_amount: row?.expected_amount ?? null,
          currency: body.payhere_currency ?? null,
          ...extra,
        }),
        ip,
      ]
    );
  } catch (e) {
    console.error("[audit] payment log failed:", e.message);
  }
}


// ─────────────────────────────────────────────────────────────
//  POST /api/payments/initiate
// ─────────────────────────────────────────────────────────────
router.post(
  "/initiate",
  authenticate,
  authorize("payment:create"),
  async (req, res) => {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: "bookingId is required" });
    }

    try {
      let booking;
      try {
        booking = await getBookingById(bookingId);
      } catch {
        return res.status(404).json({ error: "Booking not found" });
      }

      if (req.user.role === "customer" && booking.user_id !== req.user.id) {
        return res
          .status(403)
          .json({ error: "You do not have access to this booking" });
      }

      if (booking.status !== "pending") {
        return res
          .status(400)
          .json({ error: `Booking is '${booking.status}', not payable` });
      }

      // Layer 1: another customer may have paid for and confirmed this date since
      // this booking was created (pending bookings are allowed to share a date).
      // Refuse before taking money that could not be honoured.
      const conflict = await query(
        `SELECT 1
       FROM bookings mine
       JOIN bookings other
         ON other.event_date = mine.event_date
        AND other.status = 'confirmed'
        AND other.booking_id <> mine.booking_id
       WHERE mine.booking_id = $1
       LIMIT 1`,
        [booking.booking_id]
      );
      if (conflict.rows.length > 0) {
        return res.status(409).json({
          error:
            "This date has just been booked by another customer. Please choose a different date.",
        });
      }

      const user = await findUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const orderId = `AZP-${booking.booking_id}-${Date.now()}`;
      const amount = booking.total_amount;

      const hash = generateCheckoutHash(orderId, amount);

      await query(
        `INSERT INTO payments (booking_id, amount, payment_method, payhere_order_id, status, currency)
       VALUES ($1, $2, $3, $4, $5, $6)`,
        [booking.booking_id, amount, "credit_card", orderId, "pending", "LKR"]
      );

      const nameParts = (user.full_name || "").trim().split(/\s+/);
      const firstName = nameParts[0] || "Guest";
      const lastName = nameParts.slice(1).join(" ") || firstName;

      res.status(201).json({
        merchant_id: process.env.PAYHERE_MERCHANT_ID,
        order_id: orderId,
        amount: Number(amount).toFixed(2),
        currency: "LKR",
        hash,
        notify_url: `${process.env.API_BASE_URL}/api/payments/notify`,
        return_url: `${process.env.CLIENT_BASE_URL}/payment/success`,
        cancel_url: `${process.env.CLIENT_BASE_URL}/payment/cancelled`,
        items: `${booking.event_type} - ${
          booking.hall_name || "Azath Plaza"
        } (${booking.booking_ref})`,
        first_name: firstName,
        last_name: lastName,
        email: user.email,
        phone: user.phone || "0000000000",
        address: "N/A",
        city: "Oluvil",
        country: "Sri Lanka",
      });
    } catch (err) {
      console.error("Payment initiation error:", err);
      res.status(500).json({ error: "Failed to initiate payment" });
    }
  }
);

// ─────────────────────────────────────────────────────────────
//  POST /api/payments/notify  — PayHere webhook, no auth
// ─────────────────────────────────────────────────────────────
router.post("/notify", async (req, res) => {
  try {
    const isValid = verifyNotifySignature(req.body);

    if (!isValid) {
      console.warn("Invalid PayHere signature for order:", req.body.order_id);
      await auditPayment("PAYMENT_SIG_INVALID", req.body, req.ip);
      return res.status(400).send("Invalid signature");
    }
    // Room reservations share this webhook; their order_id starts with ROOM-
    if (String(req.body.order_id || "").startsWith("ROOM-")) {
      const r = await handleRoomNotify(req.body);
      await auditPayment(
        !r.ok
          ? "PAYMENT_ROOM_REJECTED"
          : r.lateRefund
          ? "PAYMENT_REFUND_FLAGGED"
          : PAYMENT_AUDIT_ACTIONS[String(req.body.status_code)] ||
            "PAYMENT_UNKNOWN",
        req.body,
        req.ip,
        {
          event_type: "Room Reservation",
          expected_amount: r.expected ?? null,
          ...(r.reason && { reason: r.reason }),
        }
      );
      return res.sendStatus(r.ok ? 200 : 400);
    }
    // Sponsorship payments share this webhook; their order_id starts with SPON-
    if (String(req.body.order_id || "").startsWith("SPON-")) {
      const r = await handleSponsorNotify(req.body);
      await auditPayment(
        !r.ok
          ? "PAYMENT_SPONSOR_REJECTED"
          : r.lateRefund
          ? "PAYMENT_REFUND_FLAGGED"
          : PAYMENT_AUDIT_ACTIONS[String(req.body.status_code)] ||
            "PAYMENT_UNKNOWN",
        req.body,
        req.ip,
        {
          event_type: "Sponsorship",
          expected_amount: r.expected ?? null,
          ...(r.reason && { reason: r.reason }),
        }
      );
      return res.sendStatus(r.ok ? 200 : 400);
    }
    const { order_id, status_code, payment_id } = req.body;

    const paymentStatus =
      status_code === "2"
        ? "completed"
        : status_code === "0"
        ? "pending"
        : status_code === "-1"
        ? "failed" // no 'cancelled' enum value — closest fit
        : status_code === "-2"
        ? "failed"
        : "failed";

    // The payment is always recorded first: money received must never be lost,
    // even if the booking can no longer be confirmed.
    const result = await query(
      `UPDATE payments
       SET status = $1::payment_status,
           transaction_id = $2,
           paid_at = CASE WHEN $1::text = 'completed' THEN NOW() ELSE paid_at END,
           gateway_response = $3::jsonb,
           updated_at = NOW()
       WHERE payhere_order_id = $4
       RETURNING payment_id, booking_id`,
      [paymentStatus, payment_id, JSON.stringify(req.body), order_id]
    );

    const bookingId = result.rows[0]?.booking_id;
    const paymentRowId = result.rows[0]?.payment_id;

    // Which notification (if any) to send once the DB work is done. Decided
    // inside the try block, sent after it so email/SMS can never interfere
    // with it.
    let notifyKind = null;
    let notifyData = {};

    if (bookingId && paymentStatus === "completed") {
      try {
        // Only a pending booking can be confirmed. A PayHere retry for an
        // already-confirmed booking matches 0 rows and is harmless.
        const confirmed = await query(
          `UPDATE bookings
           SET status = 'confirmed', confirmed_at = NOW()
           WHERE booking_id = $1 AND status = 'pending'
           RETURNING booking_id`,
          [bookingId]
        );

        if (confirmed.rows.length === 0) {
          const current = await query(
            `SELECT status FROM bookings WHERE booking_id = $1`,
            [bookingId]
          );
          const currentStatus = current.rows[0]?.status;
          if (currentStatus !== "confirmed") {
            // e.g. booking was cancelled while the customer was paying
            console.warn(
              `Payment ${paymentRowId} completed but booking ${bookingId} is '${currentStatus}'`
            );
            await flagForRefund(
              paymentRowId,
              `booking_${currentStatus || "missing"}`
            );
            notifyKind = "refund";
          }
        }

        // Invoice numbers are only ever assigned once a payment actually
        // completes, and only once — a PayHere retry must not renumber it.
        // RETURNING only fires on the first assignment, so it doubles as
        // the "first completion" signal that stops retries re-sending
        // emails and SMS.
        const invoiced = await query(
          `UPDATE payments
           SET invoice_number = 'INV-' || to_char(NOW(), 'YYYYMMDD') || '-' || payment_id
           WHERE payment_id = $1 AND invoice_number IS NULL
           RETURNING invoice_number, amount`,
          [paymentRowId]
        );

        if (invoiced.rows.length > 0 && notifyKind === null) {
          notifyKind = "paid";
          notifyData = {
            amount: invoiced.rows[0].amount,
            invoiceNumber: invoiced.rows[0].invoice_number,
          };
        }
      } catch (confirmErr) {
        // Layer 2: 23505 = idx_no_double_booking. Someone else's payment
        // confirmed this date first. Keep the payment, flag it for refund,
        // and still answer 200 so PayHere stops retrying.
        if (confirmErr.code === "23505") {
          console.warn(
            `Date conflict confirming booking ${bookingId} (payment ${paymentRowId}) — flagged for refund`
          );
          await flagForRefund(paymentRowId, "date_conflict");
          notifyKind = "refund";
        } else {
          throw confirmErr;
        }
      }
    }

    await auditPayment(
      notifyKind === "refund"
        ? "PAYMENT_REFUND_FLAGGED"
        : PAYMENT_AUDIT_ACTIONS[String(status_code)] || "PAYMENT_UNKNOWN",
      req.body,
      req.ip
    );

    // Respond to PayHere first, then send the email/SMS in the background.
    res.status(200).send("OK");

    if (notifyKind) {
      sendPaymentNotifications(notifyKind, bookingId, notifyData);
    }
  } catch (err) {
    console.error("Payment notify error:", err);
    res.status(500).send("Error processing notification");
  }
});

// ─────────────────────────────────────────────────────────────
//  GET /api/payments/:bookingId
// ─────────────────────────────────────────────────────────────
router.get(
  "/:bookingId",
  authenticate,
  authorize("payment:read_own"),
  async (req, res) => {
    const { bookingId } = req.params;

    try {
      let booking;
      try {
        booking = await getBookingById(bookingId);
      } catch {
        return res.status(404).json({ error: "Booking not found" });
      }

      // authorize('payment:read_own') only checks role, not ownership of
      // this specific booking — without this check, any customer could
      // read any other customer's payment status by guessing bookingIds.
      if (req.user.role === "customer" && booking.user_id !== req.user.id) {
        return res
          .status(403)
          .json({ error: "You do not have access to this payment" });
      }

      const result = await query(
        `SELECT payment_id, booking_id, amount, payment_method, status, currency,
              transaction_id, payhere_order_id, invoice_number, paid_at, created_at
       FROM payments WHERE booking_id = $1
       ORDER BY created_at DESC LIMIT 1`,
        [bookingId]
      );

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ error: "No payment found for this booking" });
      }

      res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error("Payment status fetch error:", err);
      res.status(500).json({ error: "Failed to retrieve payment status" });
    }
  }
);

// ─────────────────────────────────────────────────────────────
//  GET /api/payments/:bookingId/invoice — download a PDF invoice
//  for a completed payment. Generated on the fly, not stored.
// ─────────────────────────────────────────────────────────────
router.get(
  "/:bookingId/invoice",
  authenticate,
  authorize("payment:read_own"),
  async (req, res) => {
    const { bookingId } = req.params;

    try {
      let booking;
      try {
        booking = await getBookingById(bookingId);
      } catch {
        return res.status(404).json({ error: "Booking not found" });
      }

      if (req.user.role === "customer" && booking.user_id !== req.user.id) {
        return res
          .status(403)
          .json({ error: "You do not have access to this invoice" });
      }

      const data = await loadInvoiceData(booking, bookingId);
      if (!data) {
        return res
          .status(404)
          .json({ error: "No completed payment found for this booking" });
      }

      const pdfBuffer = await generateInvoicePdf({
        booking,
        payment: data.payment,
        customer: data.customer,
        cateringOrders: data.cateringOrders,
        itemInfo: data.itemInfo,
        organizers: data.organizers,
      });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="invoice-${
          data.payment.invoice_number || booking.booking_ref
        }.pdf"`
      );
      res.send(pdfBuffer);
    } catch (err) {
      console.error("Invoice generation error:", err);
      res.status(500).json({ error: "Failed to generate invoice" });
    }
  }
);

module.exports = router;
