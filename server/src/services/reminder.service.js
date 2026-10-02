// FR-016 / FR-017: day-before event reminders (SMS + email).
// Runs on a schedule (default 09:00 and 15:00 Asia/Colombo). The 15:00 run
// only exists to retry sends that failed at 09:00.
// SMS and email are tracked independently (reminder_sent_at /
// reminder_email_sent_at) so one channel failing never blocks or repeats
// the other.
const cron = require("node-cron");
const { query } = require("../config/db");
const { sendEventReminderSms } = require("./sms.service");
const { sendEventReminderEmail } = require("./email.service");

const TIMEZONE = "Asia/Colombo";

// Column names are fixed constants (never user input), so interpolating
// them into the SQL below is safe.
const SMS_COL = "reminder_sent_at";
const EMAIL_COL = "reminder_email_sent_at";

// Atomically claim tomorrow's confirmed bookings for one channel.
// Claiming first (rather than select-then-update) means two overlapping
// runs can never both pick the same booking.
const claimBookings = (col) =>
  query(
    `WITH claimed AS (
       UPDATE bookings
          SET ${col} = NOW()
        WHERE status = 'confirmed'
          AND ${col} IS NULL
          AND event_date = ((NOW() AT TIME ZONE 'Asia/Colombo')::date + 1)
      RETURNING booking_id, user_id, booking_ref, event_date, event_start_time
     )
     SELECT c.*, u.phone, u.email, u.full_name,
            (SELECT h.hall_name
               FROM hall_bookings hb
               JOIN halls h ON h.hall_id = hb.hall_id
              WHERE hb.booking_id = c.booking_id
                AND NOT hb.is_complimentary
              LIMIT 1) AS hall_name
       FROM claimed c
       JOIN users u ON u.user_id = c.user_id`
  );

const releaseClaim = (col, bookingId) =>
  query(`UPDATE bookings SET ${col} = NULL WHERE booking_id = $1`, [bookingId]);

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const runChannel = async (label, col, send) => {
  const claimed = await claimBookings(col);

  for (const b of claimed.rows) {
    let sent = false;
    try {
      sent = await send(b);
    } catch (err) {
      console.error(`[reminder] ${label} error for ${b.booking_ref}:`, err.message);
    }
    // Release the claim on failure so the next run retries it.
    if (!sent) await releaseClaim(col, b.booking_id);
  }

  if (claimed.rows.length > 0) {
    console.log(`[reminder] ${label}: processed ${claimed.rows.length} booking(s)`);
  }
};

const runReminders = async () => {
  // Each channel is isolated: a failure in one must not stop the other.
  try {
    await runChannel("SMS", SMS_COL, (b) =>
      sendEventReminderSms(b.phone, {
        bookingRef: b.booking_ref,
        eventDate: new Date(b.event_date).toLocaleDateString("en-GB"),
        startTime: String(b.event_start_time || "").slice(0, 5),
      })
    );
  } catch (err) {
    console.error("[reminder] SMS job failed:", err.message);
  }

  try {
    await runChannel("email", EMAIL_COL, (b) =>
      sendEventReminderEmail(b.email, {
        customerName: b.full_name,
        bookingRef: b.booking_ref,
        hallName: b.hall_name || "Aazath Plaza",
        eventDate: formatDate(b.event_date),
        startTime: String(b.event_start_time || "").slice(0, 5),
      })
    );
  } catch (err) {
    console.error("[reminder] Email job failed:", err.message);
  }
};

const startReminderJob = () => {
  const schedule = process.env.REMINDER_CRON || "0 9,15 * * *";
  if (!cron.validate(schedule)) {
    console.error(`[reminder] Invalid REMINDER_CRON "${schedule}" — job not started`);
    return;
  }
  cron.schedule(schedule, runReminders, { timezone: TIMEZONE });
  console.log(`[reminder] scheduled "${schedule}" (${TIMEZONE})`);
};

module.exports = { startReminderJob, runReminders };