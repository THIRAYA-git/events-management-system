// FR-016 / FR-017: audit trail of every email and SMS the system sends.
// Called from email.service.js and sms.service.js. It must NEVER throw or
// block: a logging problem can't be allowed to affect a booking or payment.
const { query } = require("../config/db");

const cut = (v, max) => (v == null || v === "" ? null : String(v).slice(0, max));

// type    : notification_type enum  (booking_confirmation | payment_receipt |
//           event_reminder | catering_update | cancellation | general)
// channel : "email" | "sms"
// The customer and booking are resolved from bookingRef, so callers don't
// need to pass ids.
const logNotification = async ({
  type,
  channel,
  bookingRef,
  subject,
  message,
  email,
  phone,
  ok,
  error,
}) => {
  try {
    if (!bookingRef) return;

    const found = await query(
      `SELECT booking_id, user_id FROM bookings WHERE booking_ref = $1`,
      [bookingRef]
    );
    const booking = found.rows[0];
    if (!booking) return;

    await query(
      `INSERT INTO notifications
         (user_id, booking_id, type, channel, subject, message,
          recipient_email, recipient_phone, is_sent, sent_at, error_message)
       VALUES
         ($1, $2, $3::notification_type, $4::notification_channel, $5, $6,
          $7, $8, $9::boolean, CASE WHEN $9::boolean THEN NOW() END, $10)`,
      [
        booking.user_id,
        booking.booking_id,
        type,
        channel,
        cut(subject, 200),
        message || subject || "",
        channel === "email" ? cut(email, 150) : null,
        channel === "sms" ? cut(phone, 20) : null,
        Boolean(ok),
        cut(error, 1000),
      ]
    );
  } catch (err) {
    console.error("[notificationLog] Failed to log notification:", err.message);
  }
};

module.exports = { logNotification };
