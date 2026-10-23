// Tells the customer and the admin(s) when an organizer moves an event to
// In progress or Completed: email + SMS to the customer and to every active
// admin, plus a bell alert for the customer and for admin / front desk staff.
//
// Like the other notify helpers it NEVER throws: a failed email or SMS must
// not undo or block the organizer's progress update. Callers don't await it.
const { query } = require("../config/db");
const { notifyUsers, notifyRoles } = require("./notify.service");
const { sendOrganizerProgressEmail } = require("./email.service");
const { sendOrganizerProgressSms } = require("./sms.service");

const STAFF_ROLES = ["admin", "front_desk"];

const BELL_COPY = {
  in_progress: {
    subject: (ref) => `Event preparation started — ${ref}`,
    message: (org, ref, date) => `${org} has started preparing event ${ref} on ${date}.`,
  },
  completed: {
    subject: (ref) => `Event completed — ${ref}`,
    message: (org, ref, date) => `${org} marked event ${ref} (${date}) as completed.`,
  },
};

const notifyProgressChange = async (assignmentId, status) => {
  try {
    const bell = BELL_COPY[status];
    if (!bell) return;

    const found = await query(
      `SELECT b.booking_id, b.booking_ref, b.event_type,
              to_char(b.event_date, 'YYYY-MM-DD') AS event_date,
              u.user_id AS customer_id, u.full_name AS customer_name,
              u.email AS customer_email, u.phone AS customer_phone,
              o.business_name AS organizer_name
         FROM booking_organizers bo
         JOIN bookings b ON b.booking_id = bo.booking_id
         JOIN users u ON u.user_id = b.user_id
         JOIN organizers o ON o.organizer_id = bo.organizer_id
        WHERE bo.id = $1`,
      [assignmentId]
    );
    const r = found.rows[0];
    if (!r) return;

    const admins = await query(
      `SELECT full_name, email, phone FROM users
        WHERE role::text = 'admin' AND is_active = TRUE`
    );

    const common = {
      bookingRef: r.booking_ref,
      eventType: r.event_type,
      eventDate: r.event_date,
      organizerName: r.organizer_name,
      status,
    };

    // Bell alerts (customer + staff)
    const payload = {
      type: "general",
      bookingId: Number(r.booking_id),
      subject: bell.subject(r.booking_ref),
      message: bell.message(r.organizer_name, r.booking_ref, r.event_date),
    };
    notifyUsers([r.customer_id], payload);
    notifyRoles(STAFF_ROLES, payload);

    // Each send is independent: one failing never stops the others.
    const sends = [];
    if (r.customer_email) {
      sends.push(
        sendOrganizerProgressEmail(r.customer_email, {
          ...common,
          recipientName: r.customer_name,
          audience: "customer",
        })
      );
    }
    if (r.customer_phone) {
      sends.push(sendOrganizerProgressSms(r.customer_phone, { ...common, audience: "customer" }));
    }
    for (const a of admins.rows) {
      if (a.email) {
        sends.push(
          sendOrganizerProgressEmail(a.email, {
            ...common,
            recipientName: a.full_name,
            audience: "admin",
          })
        );
      }
      if (a.phone) {
        sends.push(sendOrganizerProgressSms(a.phone, { ...common, audience: "admin" }));
      }
    }
    await Promise.allSettled(sends);
  } catch (err) {
    console.error("[notify] Failed to send progress notifications:", err.message);
  }
};

module.exports = { notifyProgressChange };
