// Shared by the PayHere webhook, the invoice download route and the
// cash-payment flow, so all three produce the same invoice PDF, email and SMS.
const { getBookingById } = require("./booking.service");
const { findUserById } = require("../models/user.model");
const { query } = require("../config/db");
const { generateInvoicePdf } = require("./pdf.service");
const {
  sendPaymentReceivedSms,
  sendPaymentRefundNoticeSms,
} = require("./sms.service");
const {
  sendPaymentReceiptEmail,
  sendPaymentRefundNoticeEmail,
} = require("./email.service");

// Loads everything generateInvoicePdf needs for a booking's completed
// payment. Returns null if there is no completed payment yet.
async function loadInvoiceData(booking, bookingId) {
  const paymentResult = await query(
    `SELECT payment_id, invoice_number, amount, payment_method, currency,
            transaction_id, paid_at
       FROM payments
      WHERE booking_id = $1 AND status = 'completed'
      ORDER BY created_at DESC LIMIT 1`,
    [bookingId]
  );
  if (paymentResult.rows.length === 0) return null;
  const payment = paymentResult.rows[0];

  const customer = await findUserById(booking.user_id);

  const cateringRes = await query(
    `SELECT order_id, menu_items, total_cost
       FROM catering_orders
      WHERE booking_id = $1 AND status <> 'cancelled'
      ORDER BY order_id`,
    [bookingId]
  );
  const cateringOrders = cateringRes.rows;

  const itemIds = [
    ...new Set(
      cateringOrders.flatMap((o) => {
        const items =
          typeof o.menu_items === "string"
            ? JSON.parse(o.menu_items)
            : o.menu_items;
        return (items || []).map((l) => l.item_id);
      })
    ),
  ];

  let itemInfo = {};
  if (itemIds.length) {
    const infoRes = await query(
      `SELECT mi.item_id, mi.unit, u.full_name AS restaurant_name
         FROM menu_items mi
         LEFT JOIN users u ON u.user_id = mi.restaurant_id
        WHERE mi.item_id = ANY($1)`,
      [itemIds]
    );
    itemInfo = Object.fromEntries(
      infoRes.rows.map((r) => [
        r.item_id,
        { unit: r.unit, restaurant: r.restaurant_name },
      ])
    );
  }

  const organizerRes = await query(
    `SELECT bo.role_in_event, bo.agreed_fee, o.business_name
       FROM booking_organizers bo
       JOIN organizers o ON o.organizer_id = bo.organizer_id
      WHERE bo.booking_id = $1
        AND bo.status::text NOT IN ('cancelled', 'rejected', 'declined')
      ORDER BY bo.assigned_at`,
    [bookingId]
  );
  const organizers = organizerRes.rows;

  return { payment, customer, cateringOrders, itemInfo, organizers };
}

// Email (FR-017) + SMS (FR-016) for a payment. Fully isolated: any failure is
// logged and swallowed; email and SMS each have their own try/catch.
async function sendPaymentNotifications(
  kind,
  bookingId,
  { amount, invoiceNumber } = {}
) {
  let booking;
  let customer;
  try {
    booking = await getBookingById(bookingId);
    customer = await findUserById(booking.user_id);
  } catch (lookupErr) {
    console.error(
      "[paymentNotify] Notification lookup failed:",
      lookupErr.message
    );
    return;
  }
  if (!customer) return;

  const eventDate = new Date(booking.event_date).toLocaleDateString("en-GB");

  // ── Email ──
  try {
    if (customer.email) {
      if (kind === "paid") {
        let invoicePdf = null;
        try {
          const data = await loadInvoiceData(booking, bookingId);
          if (data) {
            invoicePdf = await generateInvoicePdf({
              booking,
              payment: data.payment,
              customer: data.customer,
              cateringOrders: data.cateringOrders,
              itemInfo: data.itemInfo,
              organizers: data.organizers,
            });
          }
        } catch (pdfErr) {
          console.error(
            "[paymentNotify] Invoice PDF for email failed:",
            pdfErr.message
          );
        }

        await sendPaymentReceiptEmail(customer.email, {
          customerName: customer.full_name,
          bookingRef: booking.booking_ref,
          amount,
          invoiceNumber,
          eventDate,
          invoicePdf,
        });
      } else if (kind === "refund") {
        await sendPaymentRefundNoticeEmail(customer.email, {
          customerName: customer.full_name,
          bookingRef: booking.booking_ref,
        });
      }
    }
  } catch (emailErr) {
    console.error("[paymentNotify] Payment email failed:", emailErr.message);
  }

  // ── SMS ──
  try {
    if (customer.phone) {
      if (kind === "paid") {
        await sendPaymentReceivedSms(customer.phone, {
          bookingRef: booking.booking_ref,
          amount,
          invoiceNumber,
          eventDate,
        });
      } else if (kind === "refund") {
        await sendPaymentRefundNoticeSms(customer.phone, {
          bookingRef: booking.booking_ref,
        });
      }
    }
  } catch (smsErr) {
    console.error("[paymentNotify] Payment SMS failed:", smsErr.message);
  }
}

module.exports = { loadInvoiceData, sendPaymentNotifications };