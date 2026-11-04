// text.lk SMS Gateway (Sri Lanka) — plain REST API, no SDK needed.
// Docs: https://text.lk/docs/sms-api-endpoints
const TEXTLK_SEND_URL = "https://app.text.lk/api/v3/sms/send";
const { logNotification } = require("./notificationLog.service");

// Normalizes common Sri Lankan phone formats to the digits-with-country-code
// shape text.lk expects (e.g. "94771234567" — no leading "+"). Test/seed
// data in this project is inconsistent — some rows use "0771234567",
// others "+94776789012" — so this has to handle both.
const toTextLkRecipient = (phone) => {
  if (!phone) return null;
  const digits = phone.replace(/[\s-]/g, "");
  if (digits.startsWith("+94")) return digits.slice(1);
  if (digits.startsWith("94")) return digits;
  if (digits.startsWith("0")) return `94${digits.slice(1)}`;
  return null; // Not a recognizable format — caller should skip sending.
};

// `log` ({ type, bookingRef }) is optional: when given, the attempt (sent or
// failed) is recorded in the notifications table. Logging never throws.
const sendSms = async ({ to, body, log }) => {
  const done = (ok, error = null) => {
    if (log) {
      logNotification({ ...log, channel: "sms", message: body, phone: to, ok, error });
    }
    return ok;
  };

  const recipient = toTextLkRecipient(to);
  if (!recipient) {
    console.error(`[sms.service] Skipped send — unrecognized phone format: ${to}`);
    return done(false, "Unrecognized phone format");
  }

  try {
    const response = await fetch(TEXTLK_SEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.TEXTLK_API_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        recipient,
        sender_id: process.env.TEXTLK_SENDER_ID,
        type: "plain",
        message: body,
      }),
    });

    const result = await response.json().catch(() => null);

    // text.lk can return a 200 with a JSON error body on failure (no
    // data.uid) rather than a non-2xx status — checking response.ok
    // alone isn't enough, both conditions must hold.
    if (!response.ok || !result?.data?.uid) {
      const reason = result?.message || `HTTP ${response.status}`;
      console.error("[sms.service] text.lk rejected the send:", reason);
      return done(false, reason);
    }

    return done(true);
  } catch (err) {
    // Same fail-safe pattern as email.service.js: an SMS failure should
    // never block whatever triggered it (a booking, a payment, etc.) —
    // log it and let the caller carry on.
    console.error("[sms.service] Failed to send SMS:", err.message);
    return done(false, err.message);
  }
};

const sendBookingConfirmationSms = async (to, { bookingRef, hallName, eventDate }) => {
  return sendSms({
    to,
    log: { type: "booking_confirmation", bookingRef },
    body:
      `Aazath Plaza: Booking request received (${bookingRef}) for ${hallName} on ${eventDate}. ` +
      `Status: pending confirmation. We'll text you once it's confirmed.`,
  });
};

// Sent once, when a payment completes and the booking is confirmed.
const sendPaymentReceivedSms = async (
  to,
  { bookingRef, amount, invoiceNumber, eventDate }
) => {
  return sendSms({
    to,
    log: { type: "payment_receipt", bookingRef },
    body:
      `Aazath Plaza: Payment of LKR ${Number(amount).toLocaleString("en-LK")} received for ${bookingRef}. ` +
      `Your booking for ${eventDate} is confirmed. Invoice: ${invoiceNumber}.`,
  });
};

// Sent when money was received but the booking could not be confirmed
// (date taken by another customer, or booking cancelled mid-payment).
const sendPaymentRefundNoticeSms = async (to, { bookingRef }) => {
  return sendSms({
    to,
    log: { type: "general", bookingRef },
    body:
      `Aazath Plaza: We received your payment for ${bookingRef}, but the booking could not be confirmed. ` +
      `Our staff will contact you shortly to arrange a refund.`,
  });
};

// Room booking paid (online or cash). Logged against the room group ref.
const sendRoomPaymentReceivedSms = async (
  to,
  { groupRef, amount, invoiceNumber, checkIn, checkOut }
) => {
  return sendSms({
    to,
    log: { type: "payment_receipt", bookingRef: groupRef },
    body:
      `Aazath Plaza: Payment of LKR ${Number(amount).toLocaleString("en-LK")} received for room booking ${groupRef}. ` +
      `Stay ${checkIn} to ${checkOut} is confirmed. Invoice: ${invoiceNumber}.`,
  });
};

// Sent when staff confirm or cancel a booking from the admin Bookings page.
const sendBookingStatusSms = async (
  to,
  { status, bookingRef, eventDate, cancelReason }
) => {
  let body;
  if (status === "confirmed") {
    body = `Aazath Plaza: Your booking ${bookingRef} for ${eventDate} has been confirmed. We look forward to hosting you.`;
  } else if (status === "cancelled") {
    const reason = cancelReason ? ` Reason: ${String(cancelReason).slice(0, 80)}.` : "";
    body = `Aazath Plaza: Your booking ${bookingRef} for ${eventDate} has been cancelled.${reason} Please contact us if you have questions.`;
  } else {
    return false; // pending/completed don't notify the customer
  }
  return sendSms({
    to,
    body,
    log: {
      type: status === "confirmed" ? "booking_confirmation" : "cancellation",
      bookingRef,
    },
  });
};

// Sent the day before a confirmed event by the reminder job.
const sendEventReminderSms = async (to, { bookingRef, eventDate, startTime }) => {
  return sendSms({
    to,
    log: { type: "event_reminder", bookingRef },
    body:
      `Aazath Plaza: Reminder - your event (${bookingRef}) is tomorrow, ${eventDate}` +
      `${startTime ? ` from ${startTime}` : ""}. We look forward to hosting you.`,
  });
};

// Organizer progress change. Customer copies are logged against the booking;
// admin copies are not (the log is the customer's notification history).
const sendOrganizerProgressSms = async (
  to,
  { audience, bookingRef, eventDate, organizerName, status }
) => {
  let body;
  if (status === "in_progress") {
    body =
      audience === "admin"
        ? `Aazath Plaza: ${organizerName} started preparing ${bookingRef} (${eventDate}).`
        : `Aazath Plaza: ${organizerName} has started preparing your event ${bookingRef} on ${eventDate}.`;
  } else if (status === "completed") {
    body =
      audience === "admin"
        ? `Aazath Plaza: ${organizerName} marked ${bookingRef} (${eventDate}) as completed.`
        : `Aazath Plaza: Your event ${bookingRef} has been marked completed. Thank you for choosing us.`;
  } else {
    return false;
  }
  return sendSms({
    to,
    body,
    ...(audience === "customer" ? { log: { type: "general", bookingRef } } : {}),
  });
};

module.exports = {
  sendSms,
  sendBookingConfirmationSms,
  sendEventReminderSms,
  sendBookingStatusSms,
  sendPaymentReceivedSms,
  sendPaymentRefundNoticeSms,
  sendRoomPaymentReceivedSms,
  sendOrganizerProgressSms,
  toTextLkRecipient,
};