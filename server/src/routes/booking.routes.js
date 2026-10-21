// ─────────────────────────────────────────────────────────────────────────────
//  src/routes/booking.routes.js
// ─────────────────────────────────────────────────────────────────────────────
const express = require("express");

const {
  authenticate,
  authorize,
  restrictTo,
} = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate");
const {
  validateCreateBooking,
  validateGetBooking,
} = require("../validators/booking.validator");
const {
  createBookingHandler,
  getBookingHandler,
  listBookingsHandler,
  listMyBookingsHandler,
  updateBookingStatusHandler,
  listUpcomingConfirmedBookingsHandler
} = require("../controllers/booking.controller");
const {
  listOrganizersForBookingHandler,
  assignOrganizerHandler,
} = require("../controllers/organizer.controller");
const {
  listSponsorRequestsForBookingHandler,
  createSponsorRequestHandler,
  withdrawSponsorRequestHandler,
} = require("../controllers/sponsor.controller");
const {
  createCateringOrderHandler,
  listCateringOrdersForBookingHandler,
} = require("../controllers/catering.controller");
const {
  listTimelineHandler,
  createTimelineHandler,
  updateTimelineHandler,
  deleteTimelineHandler,
} = require("../controllers/timeline.controller");
const {
  validateListTimeline,
  validateCreateTimeline,
  validateUpdateTimeline,
  validateDeleteTimeline,
} = require("../validators/timeline.validator");
const {
  recordCashPaymentHandler,
} = require("../controllers/cashPayment.controller");

const router = express.Router();

// All booking routes require a valid token
router.use(authenticate);

// ─────────────────────────────────────────────────────────────────────────────
//  CREATE — customer (or staff, on a customer's behalf) creates a booking
//  POST /api/bookings
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/",
  restrictTo("admin", "front_desk", "customer"),
  validateCreateBooking,
  validate,
  createBookingHandler
);

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/bookings/mine — the logged-in customer's own booking history.
//  Must be registered before "/:bookingId" or Express would try to parse
//  "mine" as a bookingId.
// ─────────────────────────────────────────────────────────────────────────────
router.get("/mine", restrictTo("customer"), listMyBookingsHandler);

router.get(
  "/upcoming-public",
  authorize("booking:read_upcoming"),
  listUpcomingConfirmedBookingsHandler
);

// ─────────────────────────────────────────────────────────────────────────────
//  READ — fetch a single booking with hall + pricing details
//  GET /api/bookings/:bookingId
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/:bookingId",
  restrictTo("admin", "front_desk", "customer"),
  validateGetBooking,
  validate,
  getBookingHandler
);

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/bookings/:bookingId/organizers — organizers assigned to a booking
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/:bookingId/organizers",
  restrictTo("admin", "front_desk", "customer"),
  listOrganizersForBookingHandler
);

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/bookings/:bookingId/organizers — staff assigns an organizer
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/:bookingId/organizers",
  authorize("organizer:manage"),
  assignOrganizerHandler
);

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/bookings/:bookingId/sponsors — sponsor requests on a booking
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/:bookingId/sponsors",
  restrictTo("admin", "front_desk", "customer"),
  listSponsorRequestsForBookingHandler
);

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/bookings/:bookingId/sponsors — customer proposes a sponsor
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/:bookingId/sponsors",
  authorize("sponsor_request:create"),
  createSponsorRequestHandler
);

// ─────────────────────────────────────────────────────────────────────────────
//  PATCH /api/bookings/:bookingId/sponsors/:requestId/withdraw — customer withdraws
// ─────────────────────────────────────────────────────────────────────────────
router.patch(
  "/:bookingId/sponsors/:requestId/withdraw",
  authorize("sponsor_request:withdraw"),
  withdrawSponsorRequestHandler
);

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/bookings/:bookingId/catering-orders — catering orders on a booking
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/:bookingId/catering-orders",
  authorize("catering:read"),
  listCateringOrdersForBookingHandler
);

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/bookings/:bookingId/catering-orders — customer places a catering order
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/:bookingId/catering-orders",
  authorize("catering:create"),
  createCateringOrderHandler
);

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/bookings/:bookingId/timeline — list activities for a booking
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/:bookingId/timeline",
  authorize("timeline:read"),
  validateListTimeline,
  validate,
  listTimelineHandler
);

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/bookings/:bookingId/timeline — add an activity
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/:bookingId/timeline",
  authorize("timeline:manage"),
  validateCreateTimeline,
  validate,
  createTimelineHandler
);

// ─────────────────────────────────────────────────────────────────────────────
//  PATCH /api/bookings/:bookingId/timeline/:timelineId — edit an activity
// ─────────────────────────────────────────────────────────────────────────────
router.patch(
  "/:bookingId/timeline/:timelineId",
  authorize("timeline:manage"),
  validateUpdateTimeline,
  validate,
  updateTimelineHandler
);

// ─────────────────────────────────────────────────────────────────────────────
//  DELETE /api/bookings/:bookingId/timeline/:timelineId — remove an activity
// ─────────────────────────────────────────────────────────────────────────────
router.delete(
  "/:bookingId/timeline/:timelineId",
  authorize("timeline:manage"),
  validateDeleteTimeline,
  validate,
  deleteTimelineHandler
);

router.get(
  "/",
  restrictTo("admin", "front_desk"),
  listBookingsHandler
);

router.get(
  "/:bookingId",
  restrictTo("admin", "front_desk", "customer"),
  validateGetBooking,
  validate,
  getBookingHandler
);

router.patch(
  "/:bookingId/payment/cash",
  authorize("payment:record_cash"),
  recordCashPaymentHandler
);

router.patch(
  "/:bookingId/status",
  restrictTo("admin", "front_desk"),
  updateBookingStatusHandler
);

module.exports = router;
