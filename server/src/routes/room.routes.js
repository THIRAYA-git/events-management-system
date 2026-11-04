const router = require("express").Router();
const { authenticate, authorize } = require("../middleware/auth.middleware");
const c = require("../controllers/room.controller");

router.get("/availability", authenticate, authorize("room:browse"), c.availabilityHandler);
router.post("/reservations", authenticate, authorize("room:create"), c.createHandler);
router.get("/reservations/mine", authenticate, authorize("room:read_own"), c.mineHandler);
router.patch("/reservations/:id/cancel", authenticate, authorize("room:cancel_own"), c.cancelHandler);
router.get("/reservations", authenticate, authorize("room:read_all"), c.allHandler);
router.patch("/reservations/:id/status", authenticate, authorize("room:manage"), c.statusHandler);
router.post("/payments/initiate", authenticate, authorize("room:create"), c.payInitiateHandler);
router.get("/payments/:groupRef", authenticate, authorize("room:read_own"), c.payStatusHandler);
router.post("/payments/notify", c.payNotifyHandler); // no auth: PayHere calls it
router.get("/reservations/groups", authenticate, authorize("room:read_all"), c.groupsHandler);
router.patch("/reservations/groups/:groupRef/cash-payment", authenticate, authorize("room:manage"), c.cashHandler);
// Staff (any) and customers (own only, checked in the service)
router.get("/reservations/groups/:groupRef/invoice", authenticate, c.invoiceHandler);

module.exports = router;