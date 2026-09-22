// text.lk SMS Gateway (Sri Lanka) — plain REST API, no SDK needed.
// Docs: https://text.lk/docs/sms-api-endpoints
const TEXTLK_SEND_URL = "https://app.text.lk/api/v3/sms/send";

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

const sendSms = async ({ to, body }) => {
  const recipient = toTextLkRecipient(to);
  if (!recipient) {
    console.error(`[sms.service] Skipped send — unrecognized phone format: ${to}`);
    return false;
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
      console.error(
        "[sms.service] text.lk rejected the send:",
        result?.message || `HTTP ${response.status}`
      );
      return false;
    }

    return true;
  } catch (err) {
    // Same fail-safe pattern as email.service.js: an SMS failure should
    // never block whatever triggered it (a booking, a payment, etc.) —
    // log it and let the caller carry on.
    console.error("[sms.service] Failed to send SMS:", err.message);
    return false;
  }
};

const sendBookingConfirmationSms = async (to, { bookingRef, hallName, eventDate }) => {
  return sendSms({
    to,
    body:
      `Aazath Plaza: Booking request received (${bookingRef}) for ${hallName} on ${eventDate}. ` +
      `Status: pending confirmation. We'll text you once it's confirmed.`,
  });
};

module.exports = {
  sendSms,
  sendBookingConfirmationSms,
  toTextLkRecipient,
};