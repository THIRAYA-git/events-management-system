const svc = require("../services/room.service");
const payments = require("../services/room-payment.service");
const roomAdmin = require("../services/room-admin.service");
const roomInvoices = require("../services/room-invoice.service");

const wrap =
  (fn, okStatus = 200) =>
  async (req, res) => {
    try {
      const data = await fn(req);
      res.status(okStatus).json({ success: true, data });
    } catch (err) {
      res
        .status(err.statusCode || 500)
        .json({ success: false, message: err.message });
    }
  };

exports.availabilityHandler = wrap((req) =>
  svc.getAvailableRooms(req.query.checkIn, req.query.checkOut)
);
exports.createHandler = wrap(
  (req) => svc.createReservation(req.user.id, req.body),
  201
);
exports.mineHandler = wrap((req) => svc.getMyReservations(req.user.id));
exports.cancelHandler = wrap((req) =>
  svc.cancelMyReservation(req.user.id, Number(req.params.id))
);
exports.allHandler = wrap(() => svc.getAllReservations());
exports.statusHandler = wrap((req) =>
  svc.updateStatus(Number(req.params.id), req.body.status)
);
exports.payInitiateHandler = wrap((req) =>
  payments.initiateGroupPayment(req.user.id, req.body.groupRef)
);
exports.payStatusHandler = wrap((req) =>
  payments.getGroupStatus(req.user.id, req.params.groupRef)
);

// PayHere calls this server-to-server, so it can't use the JSON envelope
exports.payNotifyHandler = async (req, res) => {
  try {
    console.log("ROOM NOTIFY body:", req.body);
    const r = await payments.handleNotify(req.body);
    console.log("ROOM NOTIFY result:", r);
    res.sendStatus(r.ok ? 200 : 400);
  } catch (e) {
    console.error("room notify error", e);
    res.sendStatus(500); // PayHere will retry
  }
};

exports.groupsHandler = wrap(() => roomAdmin.getGroups());
exports.cashHandler = wrap((req) =>
  roomAdmin.recordCashPayment(req.params.groupRef, req.user.id, req.body.note)
);

// Returns a PDF, so it can't use the JSON wrap()
exports.invoiceHandler = async (req, res) => {
  try {
    const { buffer, filename } = await roomInvoices.getRoomInvoice(
      req.params.groupRef,
      req.user
    );
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": buffer.length,
    });
    res.send(buffer);
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ success: false, message: err.message });
  }
};
