const { recordCashPayment } = require("../services/cashPayment.service");
const {
  sendPaymentNotifications,
} = require("../services/paymentNotify.service");

// PATCH /api/bookings/:bookingId/payment/cash   Body: { note? }
const recordCashPaymentHandler = async (req, res, next) => {
  try {
    const bookingId = Number(req.params.bookingId);
    if (!Number.isInteger(bookingId) || bookingId < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid booking id." });
    }
    const note =
      typeof req.body?.note === "string"
        ? req.body.note.trim().slice(0, 200)
        : null;

    const payment = await recordCashPayment(bookingId, {
      staffId: req.user.id,
      note: note || null,
      ipAddress: req.ip ? String(req.ip).slice(0, 45) : null, // audit_log.ip_address is varchar(45)
      userAgent: req.get("user-agent") || null,
    });

    res
      .status(201)
      .json({ success: true, message: "Cash payment recorded", data: payment });

    // After the response (same pattern as notifyStatusChange): receipt email
    // with the PDF invoice (FR-017) + SMS (FR-016). Only fires on a real new
    // payment, because a repeat call 409s above. Never throws.
    if (payment.invoice_number) {
      sendPaymentNotifications("paid", bookingId, {
        amount: payment.amount,
        invoiceNumber: payment.invoice_number,
      });
    }
  } catch (err) {
    if (err.statusCode) {
      return res
        .status(err.statusCode)
        .json({ success: false, message: err.message });
    }
    next(err);
  }
};

module.exports = { recordCashPaymentHandler };