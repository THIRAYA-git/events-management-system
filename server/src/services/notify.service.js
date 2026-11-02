// In-app notifications for any user (customer, staff, organizer, sponsor,
// restaurant). Rows are written to the notifications table with the "in_app"
// channel and shown by the bell for that user_id.
//
// Like notificationLog.service.js, these helpers must NEVER throw or block:
// a notification problem can't be allowed to break a booking or a payment.
// So callers don't need await or try/catch.
const { query } = require("../config/db");

const cut = (v, max) =>
  v == null || v === "" ? null : String(v).slice(0, max);

// type: notification_type enum  (booking_confirmation | payment_receipt |
//       event_reminder | catering_update | cancellation | general)
// Sends one row per user id. Empty or duplicate ids are ignored.
// Pass either bookingId or bookingRef (e.g. "AP-20261008-0053"); the ref is
// resolved to the booking id here, so callers that only know the ref still work.
const notifyUsers = async (
  userIds,
  { type = "general", subject, message, bookingId = null, bookingRef = null }
) => {
  try {
    const ids = [
      ...new Set(
        (userIds || []).filter((id) => Number.isInteger(Number(id))).map(Number)
      ),
    ];
    if (ids.length === 0) return;

    let resolvedBookingId = bookingId;
    if (resolvedBookingId == null && bookingRef) {
      const found = await query(
        `SELECT booking_id FROM bookings WHERE booking_ref = $1`,
        [bookingRef]
      );
      resolvedBookingId = found.rows[0]?.booking_id ?? null;
    }

    await query(
      `INSERT INTO notifications
         (user_id, booking_id, type, channel, subject, message, is_sent, sent_at)
       SELECT uid, $2::int, $3::notification_type, 'in_app'::notification_channel,
              $4::text, $5::text, TRUE, NOW()
         FROM unnest($1::int[]) AS uid`,
      [
        ids,
        resolvedBookingId,
        type,
        cut(subject, 200),
        message || subject || "",
      ]
    );
  } catch (err) {
    console.error("[notify] Failed to create notification:", err.message);
  }
};

// Notify every user who has one of the given roles, e.g.
//   notifyRoles(["admin", "front_desk"], { ... })
const notifyRoles = async (roles, payload) => {
  try {
    const found = await query(
      `SELECT user_id FROM users WHERE role::text = ANY($1::text[])`,
      [roles]
    );
    await notifyUsers(
      found.rows.map((r) => r.user_id),
      payload
    );
  } catch (err) {
    console.error("[notify] Failed to notify roles:", err.message);
  }
};

// Notify the organizers assigned to a booking:
// bookings.booking_ref -> booking_organizers -> organizers.user_id
const notifyBookingOrganizers = async (bookingRef, payload) => {
  try {
    if (!bookingRef) return;
    const found = await query(
      `SELECT DISTINCT o.user_id
         FROM bookings b
         JOIN booking_organizers bo ON bo.booking_id = b.booking_id
         JOIN organizers o ON o.organizer_id = bo.organizer_id
        WHERE b.booking_ref = $1 AND o.user_id IS NOT NULL`,
      [bookingRef]
    );
    await notifyUsers(
      found.rows.map((r) => r.user_id),
      { ...payload, bookingRef }
    );
  } catch (err) {
    console.error("[notify] Failed to notify booking organizers:", err.message);
  }
};

// Tell one organizer they were assigned to a booking. Call it right after the
// booking_organizers row is inserted; it never throws.
const notifyOrganizerAssigned = async (bookingId, organizerId, roleInEvent) => {
  try {
    const found = await query(
      `SELECT o.user_id, b.booking_ref, b.event_type,
              to_char(b.event_date, 'YYYY-MM-DD') AS event_date
         FROM organizers o
        CROSS JOIN bookings b
        WHERE o.organizer_id = $1 AND b.booking_id = $2`,
      [organizerId, bookingId]
    );
    const row = found.rows[0];
    if (!row || !row.user_id) return;
    await notifyUsers([row.user_id], {
      type: "general",
      bookingId: Number(bookingId),
      subject: `New assignment — ${row.booking_ref}`,
      message:
        `You were assigned to a ${row.event_type} on ${row.event_date}` +
        `${
          roleInEvent ? ` as ${roleInEvent}` : ""
        }. Please review it in Event Requests.`,
    });
  } catch (err) {
    console.error("[notify] Failed to notify assigned organizer:", err.message);
  }
};

module.exports = {
  notifyUsers,
  notifyRoles,
  notifyBookingOrganizers,
  notifyOrganizerAssigned,
};
