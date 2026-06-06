// ─────────────────────────────────────────────────────────────────────────────
//  src/routes/hall.routes.js
// ─────────────────────────────────────────────────────────────────────────────
const express = require('express');

const { authenticate, restrictTo } = require('../middleware/auth.middleware');
const { validate }                 = require('../middleware/validate');
const {
  validateCheckAvailability,
  validateGetAvailableHalls,
  validateGetSchedule,
  validateAssignHall,
  validateReleaseHall,
} = require('../validators/hall.validator');
const {
  checkHallAvailability,
  listAvailableHalls,
  getSchedule,
  assignHall,
  releaseHall,
} = require('../controllers/hall.controller');

const router = express.Router();

// All hall routes require a valid token
router.use(authenticate);

// ─────────────────────────────────────────────────────────────────────────────
//  READ — availability queries (customer-facing + staff)
// ─────────────────────────────────────────────────────────────────────────────

// Check if a specific hall is free for a given date + time slot
// GET /api/halls/availability?hall_id=1&event_date=2026-08-15&start_time=09:00&end_time=14:00
router.get(
  '/availability',
  restrictTo('admin', 'manager', 'front_desk', 'customer'),
  validateCheckAvailability,
  validate,
  checkHallAvailability
);

// List all halls that are free for a given slot (with optional floor/capacity filters)
// GET /api/halls/available?event_date=2026-08-15&start_time=09:00&end_time=14:00&floor_number=1&guest_count=200
router.get(
  '/available',
  restrictTo('admin', 'manager', 'front_desk', 'customer'),
  validateGetAvailableHalls,
  validate,
  listAvailableHalls
);

// Full day schedule for a specific hall
// GET /api/halls/:hallId/schedule?event_date=2026-08-15
router.get(
  '/:hallId/schedule',
  restrictTo('admin', 'manager', 'front_desk'),
  validateGetSchedule,
  validate,
  getSchedule
);

// ─────────────────────────────────────────────────────────────────────────────
//  WRITE — hall assignments (staff only)
// ─────────────────────────────────────────────────────────────────────────────

// Assign a hall to a booking (after conflict check)
// POST /api/halls/assign
router.post(
  '/assign',
  restrictTo('admin', 'manager', 'front_desk'),
  validateAssignHall,
  validate,
  assignHall
);

// Cancel / release a hall assignment
// DELETE /api/halls/assign/:hallBookingId
router.delete(
  '/assign/:hallBookingId',
  restrictTo('admin', 'manager'),
  validateReleaseHall,
  validate,
  releaseHall
);

module.exports = router;
