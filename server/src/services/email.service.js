const nodemailer = require("nodemailer");
const { logNotification } = require("./notificationLog.service");
const { notifyRoles, notifyBookingOrganizers } = require("./notify.service");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false, // SendGrid uses STARTTLS on 587
  auth: {
    user: process.env.EMAIL_USER, // literally "apikey" for SendGrid
    pass: process.env.EMAIL_PASS,
  },
});

// Roles that get a bell alert for new bookings, payments and catering orders.
const STAFF_ROLES = ["admin", "manager", "front_desk"];

const escapeHtml = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// `log` ({ type, bookingRef }) is optional: when given, the attempt (sent or
// failed) is recorded in the notifications table. Logging never throws.
// `alert` ({ roles?, organizers?, subject, message, type? }) is optional: it adds
// a bell notification for those roles and/or for the organizers assigned to the
// booking. It fires whether or not the email was sent, because the alert is
// about the event, not about the email.
const sendEmail = async ({ to, subject, html, text, replyTo, attachments, log, alert }) => {
  let ok = false;
  let errorMessage = null;
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text,
      ...(replyTo ? { replyTo } : {}),
      ...(attachments?.length ? { attachments } : {}),
    });
    ok = true;
  } catch (err) {
    // Email failures must never crash the calling request.
    errorMessage = err.message;
    console.error("[email.service] Failed to send email:", err.message);
  }
  if (log) {
    logNotification({
      ...log,
      channel: "email",
      subject,
      message: text,
      email: to,
      ok,
      error: errorMessage,
    });
  }
  if (alert) {
    const payload = {
      type: alert.type || log?.type || "general",
      subject: alert.subject,
      message: alert.message,
    };
    if (alert.roles?.length) {
      notifyRoles(alert.roles, { ...payload, bookingRef: log?.bookingRef });
    }
    if (alert.organizers && log?.bookingRef) {
      notifyBookingOrganizers(log.bookingRef, payload);
    }
  }
  return ok;
};

// ── Shared branded layout (same purple as the invoice PDF) ──────────────
const layout = (heading, bodyHtml) => `
<div style="font-family:Arial,Helvetica,sans-serif;background:#f5f3ff;padding:24px">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden">
    <tr><td style="background:#6d28d9;color:#ffffff;padding:20px 24px">
      <div style="font-size:20px;font-weight:bold">Aazath Plaza</div>
      <div style="font-size:12px;color:#ddd6fe">Reception Hall &amp; Events</div>
    </td></tr>
    <tr><td style="padding:24px;color:#111827;font-size:14px;line-height:1.5">
      <h2 style="margin:0 0 12px;font-size:17px;color:#4c1d95">${escapeHtml(heading)}</h2>
      ${bodyHtml}
    </td></tr>
    <tr><td style="background:#f3f4f6;color:#6b7280;font-size:11px;padding:12px 24px">
      Colombo - Batticaloa Hwy, Kalmunai 32300, Sri Lanka
    </td></tr>
  </table>
</div>`;

const detailsTable = (rows) =>
  `<table cellpadding="4" cellspacing="0" style="margin:8px 0">` +
  rows
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(
      ([k, v]) =>
        `<tr><td style="color:#6b7280;padding-right:16px">${escapeHtml(k)}</td><td><strong>${escapeHtml(v)}</strong></td></tr>`
    )
    .join("") +
  `</table>`;

const sendPasswordResetEmail = async (to, resetLink) => {
  return sendEmail({
    to,
    subject: "Reset your Aazath Plaza password",
    text: `You requested a password reset. Use this link (valid for a limited time): ${resetLink}\n\nIf you did not request this, ignore this email.`,
    html: `
      <p>You requested a password reset for your Aazath Plaza account.</p>
      <p><a href="${resetLink}">Click here to reset your password</a></p>
      <p>This link is valid for a limited time. If you did not request this, you can safely ignore this email.</p>
    `,
  });
};

// ── Booking request received (unchanged) ────────────────────────────────
const sendBookingConfirmationEmail = async (to, booking) => {
  const {
    customerName, bookingRef, hallName, eventDate,
    startTime, endTime, eventType, guestCount, totalAmount,
  } = booking;

  return sendEmail({
    to,
    subject: `Booking request received — ${bookingRef}`,
    log: { type: "booking_confirmation", bookingRef },
    alert: {
      roles: STAFF_ROLES,
      subject: `New booking request — ${bookingRef}`,
      message: `${customerName} requested ${hallName} for ${eventType} on ${eventDate} (${guestCount} guests).`,
    },
    text:
      `Hi ${customerName},\n\n` +
      `We've received your booking request for Aazath Plaza. Here are the details:\n\n` +
      `Reference: ${bookingRef}\nHall: ${hallName}\nDate: ${eventDate}\n` +
      `Time: ${startTime} - ${endTime}\nEvent type: ${eventType}\n` +
      `Guests: ${guestCount}\nTotal: LKR ${totalAmount}\n\n` +
      `Your booking is currently pending confirmation from our team. We'll notify you once it's confirmed.`,
    html: `
      <p>Hi ${customerName},</p>
      <p>We've received your booking request for Aazath Plaza. Here are the details:</p>
      <table cellpadding="4" cellspacing="0">
        <tr><td><strong>Reference</strong></td><td>${bookingRef}</td></tr>
        <tr><td><strong>Hall</strong></td><td>${hallName}</td></tr>
        <tr><td><strong>Date</strong></td><td>${eventDate}</td></tr>
        <tr><td><strong>Time</strong></td><td>${startTime} - ${endTime}</td></tr>
        <tr><td><strong>Event type</strong></td><td>${eventType}</td></tr>
        <tr><td><strong>Guests</strong></td><td>${guestCount}</td></tr>
        <tr><td><strong>Total</strong></td><td>LKR ${totalAmount}</td></tr>
      </table>
      <p>Your booking is currently <strong>pending confirmation</strong> from our team. We'll notify you once it's confirmed.</p>
    `,
  });
};

// ── FR-017: staff confirm / cancel from admin Bookings page ─────────────
const sendBookingStatusEmail = async (
  to,
  { status, customerName, bookingRef, hallName, eventDate, cancelReason }
) => {
  if (status !== "confirmed" && status !== "cancelled") return false;
  const confirmed = status === "confirmed";

  const intro = confirmed
    ? "Good news — your booking has been confirmed. We look forward to hosting you."
    : "Your booking has been cancelled. Please contact us if you have any questions.";

  return sendEmail({
    to,
    subject: `Booking ${confirmed ? "confirmed" : "cancelled"} — ${bookingRef}`,
    log: { type: confirmed ? "booking_confirmation" : "cancellation", bookingRef },
    alert: confirmed
      ? undefined
      : {
          organizers: true,
          subject: `Booking cancelled — ${bookingRef}`,
          message:
            `The booking at ${hallName} on ${eventDate} was cancelled.` +
            `${cancelReason ? ` Reason: ${cancelReason}` : ""}`,
        },
    text:
      `Hi ${customerName},\n\n${intro}\n\n` +
      `Reference: ${bookingRef}\nHall: ${hallName}\nDate: ${eventDate}` +
      (!confirmed && cancelReason ? `\nReason: ${cancelReason}` : ""),
    html: layout(
      confirmed ? "Booking confirmed" : "Booking cancelled",
      `<p>Hi ${escapeHtml(customerName)},</p><p>${escapeHtml(intro)}</p>` +
        detailsTable([
          ["Reference", bookingRef],
          ["Hall", hallName],
          ["Date", eventDate],
          ["Reason", !confirmed ? cancelReason : ""],
        ])
    ),
  });
};

// ── FR-017: payment receipt with the PDF invoice attached ───────────────
// invoicePdf: Buffer from generateInvoicePdf(); omit if generation failed.
const sendPaymentReceiptEmail = async (
  to,
  { customerName, bookingRef, amount, invoiceNumber, eventDate, invoicePdf }
) => {
  const amt = `LKR ${Number(amount).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;
  return sendEmail({
    to,
    subject: `Payment received — ${bookingRef} (Invoice ${invoiceNumber})`,
    log: { type: "payment_receipt", bookingRef },
    alert: {
      roles: STAFF_ROLES,
      subject: `Payment received — ${bookingRef}`,
      message: `${customerName} paid ${amt} for the event on ${eventDate}. Invoice ${invoiceNumber}.`,
    },
    text:
      `Hi ${customerName},\n\nWe received your payment of ${amt} for booking ${bookingRef}. ` +
      `Your booking for ${eventDate} is confirmed. Invoice ${invoiceNumber} is attached.`,
    html: layout(
      "Payment received",
      `<p>Hi ${escapeHtml(customerName)},</p>
       <p>Thank you. Your payment was received and your booking is confirmed.</p>` +
        detailsTable([
          ["Reference", bookingRef],
          ["Event date", eventDate],
          ["Amount paid", amt],
          ["Invoice", invoiceNumber],
        ]) +
        (invoicePdf ? `<p>Your invoice is attached as a PDF.</p>` : "")
    ),
    attachments: invoicePdf
      ? [{ filename: `${invoiceNumber}.pdf`, content: invoicePdf, contentType: "application/pdf" }]
      : undefined,
  });
};

// ── FR-017: paid, but the booking could not be confirmed ────────────────
const sendPaymentRefundNoticeEmail = async (to, { customerName, bookingRef }) => {
  return sendEmail({
    to,
    subject: `Action needed — payment for ${bookingRef}`,
    log: { type: "general", bookingRef },
    alert: {
      roles: ["admin", "manager"],
      subject: `Action needed — refund for ${bookingRef}`,
      message: `${customerName} paid, but the booking could not be confirmed. Please arrange a refund.`,
    },
    text:
      `Hi ${customerName},\n\nWe received your payment for ${bookingRef}, but the booking could not be confirmed. ` +
      `Our staff will contact you shortly to arrange a refund.`,
    html: layout(
      "We couldn't confirm your booking",
      `<p>Hi ${escapeHtml(customerName)},</p>
       <p>We received your payment for <strong>${escapeHtml(bookingRef)}</strong>, but the booking could not be confirmed.
       Our staff will contact you shortly to arrange a refund. We apologise for the inconvenience.</p>`
    ),
  });
};

// ── FR-017: day-before reminder (sent by the reminder job) ──────────────
const sendEventReminderEmail = async (
  to,
  { customerName, bookingRef, hallName, eventDate, startTime }
) => {
  return sendEmail({
    to,
    subject: `Reminder: your event is tomorrow — ${bookingRef}`,
    log: { type: "event_reminder", bookingRef },
    text:
      `Hi ${customerName},\n\nA reminder that your event (${bookingRef}) at ${hallName} is tomorrow, ${eventDate}` +
      `${startTime ? ` from ${startTime}` : ""}. We look forward to hosting you.`,
    html: layout(
      "Your event is tomorrow",
      `<p>Hi ${escapeHtml(customerName)},</p><p>A friendly reminder about your upcoming event.</p>` +
        detailsTable([
          ["Reference", bookingRef],
          ["Hall", hallName],
          ["Date", eventDate],
          ["Start time", startTime],
        ]) +
        `<p>We look forward to hosting you.</p>`
    ),
  });
};

const sendContactMessageEmail = async ({ name, email, phone, subject, message }) => {
  const inbox = process.env.CONTACT_INBOX || process.env.EMAIL_FROM;
  return sendEmail({
    to: inbox,
    replyTo: email,
    subject: `[Contact] ${subject} - ${name}`,
    alert: {
      roles: ["admin"],
      subject: `New contact message — ${name}`,
      message: `Topic: ${subject}`,
    },
    text: `From: ${name} <${email}>\nPhone: ${phone || "-"}\nTopic: ${subject}\n\n${message}`,
    html: `
      <p><strong>New message from the Contact page</strong></p>
      <table cellpadding="6">
        <tr><td><strong>Name</strong></td><td>${escapeHtml(name)}</td></tr>
        <tr><td><strong>Email</strong></td><td>${escapeHtml(email)}</td></tr>
        <tr><td><strong>Phone</strong></td><td>${escapeHtml(phone || "-")}</td></tr>
        <tr><td><strong>Topic</strong></td><td>${escapeHtml(subject)}</td></tr>
      </table>
      <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
    `,
  });
};

// ── FR-017: catering + event-update emails ──────────────────────────────
const fmtLkr = (n) =>
  `LKR ${Number(n || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const itemsList = (items = []) =>
  `<ul style="margin:8px 0;padding-left:20px">` +
  items
    .map(
      (i) =>
        `<li>${escapeHtml(i.quantity)} × ${escapeHtml(i.item_name)}</li>`
    )
    .join("") +
  `</ul>`;

// Catering order placed against a booking.
const sendCateringOrderPlacedEmail = async (
  to,
  { customerName, bookingRef, orderId, items, totalCost, guestCount, deliveryTime }
) => {
  const itemsText = (items || [])
    .map((i) => `- ${i.quantity} x ${i.item_name}`)
    .join("\n");
  return sendEmail({
    to,
    subject: `Catering order #${orderId} received — ${bookingRef}`,
    log: { type: "catering_update", bookingRef },
    alert: {
      roles: [...STAFF_ROLES, "restaurant"],
      subject: `New catering order #${orderId} — ${bookingRef}`,
      message: `${customerName} ordered catering for ${guestCount} guests (${fmtLkr(totalCost)}).`,
    },
    text:
      `Hi ${customerName},\n\nWe received your catering order #${orderId} for booking ${bookingRef}.\n\n` +
      `${itemsText}\n\nGuests: ${guestCount}\nTotal: ${fmtLkr(totalCost)}\n` +
      `Catering is billed separately by the restaurant. We'll email you as the order progresses.`,
    html: layout(
      "Catering order received",
      `<p>Hi ${escapeHtml(customerName)},</p>
       <p>We received your catering order for booking <strong>${escapeHtml(bookingRef)}</strong>.</p>` +
        itemsList(items) +
        detailsTable([
          ["Order", `#${orderId}`],
          ["Guests", guestCount],
          ["Delivery time", deliveryTime],
          ["Total", fmtLkr(totalCost)],
        ]) +
        `<p style="color:#6b7280;font-size:12px">Catering is billed separately by the restaurant.
         We'll email you as the order progresses.</p>`
    ),
  });
};

// Catering order status change (confirmed / preparing / delivered / cancelled).
const CATERING_STATUS_COPY = {
  confirmed: "The restaurant has confirmed your catering order.",
  preparing: "The restaurant has started preparing your catering order.",
  delivered: "Your catering order has been delivered. Enjoy your event!",
  cancelled: "Your catering order has been cancelled.",
};

const sendCateringStatusEmail = async (
  to,
  { customerName, bookingRef, orderId, status }
) => {
  const copy = CATERING_STATUS_COPY[status];
  if (!copy) return false; // 'pending' doesn't notify
  return sendEmail({
    to,
    subject: `Catering order #${orderId} ${status} — ${bookingRef}`,
    log: { type: "catering_update", bookingRef },
    text: `Hi ${customerName},\n\n${copy}\n\nOrder: #${orderId}\nBooking: ${bookingRef}`,
    html: layout(
      `Catering order ${status}`,
      `<p>Hi ${escapeHtml(customerName)},</p><p>${escapeHtml(copy)}</p>` +
        detailsTable([
          ["Order", `#${orderId}`],
          ["Booking", bookingRef],
        ])
    ),
  });
};

// Event schedule change (FR-013): an activity was added or changed.
const sendEventUpdateEmail = async (
  to,
  { customerName, bookingRef, hallName, eventDate, change, activityName, category, startTime, endTime }
) => {
  const verb = change === "added" ? "added to" : "updated in";
  return sendEmail({
    to,
    subject: `Event schedule updated — ${bookingRef}`,
    log: { type: "general", bookingRef },
    alert: {
      organizers: true,
      subject: `Event schedule updated — ${bookingRef}`,
      message: `An activity was ${verb} the schedule: ${activityName || "-"} on ${eventDate}.`,
    },
    text:
      `Hi ${customerName},\n\nAn activity was ${verb} the schedule for your event.\n\n` +
      `Booking: ${bookingRef}\nHall: ${hallName}\nDate: ${eventDate}\n` +
      `Activity: ${activityName || "-"}${category ? ` (${category})` : ""}\n` +
      `Time: ${startTime || "-"}${endTime ? ` - ${endTime}` : ""}`,
    html: layout(
      "Your event schedule was updated",
      `<p>Hi ${escapeHtml(customerName)},</p>
       <p>An activity was ${verb} the schedule for your event.</p>` +
        detailsTable([
          ["Booking", bookingRef],
          ["Hall", hallName],
          ["Date", eventDate],
          ["Activity", activityName],
          ["Category", category],
          ["Time", startTime ? `${startTime}${endTime ? ` - ${endTime}` : ""}` : ""],
        ])
    ),
  });
};

module.exports = {
  sendEmail,
  sendContactMessageEmail,
  sendPasswordResetEmail,
  sendBookingConfirmationEmail,
  sendBookingStatusEmail,
  sendPaymentReceiptEmail,
  sendPaymentRefundNoticeEmail,
  sendEventReminderEmail,
  sendCateringOrderPlacedEmail,
  sendCateringStatusEmail,
  sendEventUpdateEmail,
};