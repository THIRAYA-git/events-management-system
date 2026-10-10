// In-app notifications for the logged-in user (the bell in the navbar).
// Backed by the notifications table that notificationLog.service.js fills.
// SMS rows are hidden (the same event also has an email row, or a legacy
// 'both' row), so each event appears once, not twice.
const router = require("express").Router();
const { authenticate } = require("../middleware/auth.middleware");
const { query } = require("../config/db");

router.use(authenticate);

// GET /api/notifications  → { notifications: [...], unreadCount }
router.get("/", async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 50);

    const [list, unread] = await Promise.all([
      query(
        `SELECT n.notification_id, n.type, n.subject, n.message, n.is_read,
                (n.created_at AT TIME ZONE 'UTC') AS created_at,
                n.booking_id, b.booking_ref
           FROM notifications n
           LEFT JOIN bookings b ON b.booking_id = n.booking_id
          WHERE n.user_id = $1 AND n.channel <> 'sms'
          ORDER BY n.created_at DESC
          LIMIT $2`,
        [req.user.id, limit]
      ),
      query(
        `SELECT COUNT(*)::int AS count
           FROM notifications
          WHERE user_id = $1 AND channel <> 'sms' AND is_read = FALSE`,
        [req.user.id]
      ),
    ]);

    res.json({
      notifications: list.rows,
      unreadCount: unread.rows[0].count,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/notifications/read-all
router.patch("/read-all", async (req, res, next) => {
  try {
    await query(
      `UPDATE notifications SET is_read = TRUE
        WHERE user_id = $1 AND channel <> 'sms' AND is_read = FALSE`,
      [req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/notifications/:id/read
router.patch("/:id/read", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: "Invalid notification id" });
    }
    await query(
      `UPDATE notifications SET is_read = TRUE
        WHERE notification_id = $1 AND user_id = $2`,
      [id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
