// Email + SMS to the customer when a room booking is paid (online or cash).
// Called from the cash-payment flow and from the PayHere room notify handler.
const { sendEmail, layout, detailsTable, escapeHtml } = require("./email.service");
const { loadPaidGroup, ensureInvoiceNumber, renderInvoice } = require("./room-invoice.service");

const fmtLkr = (n) =>
  `LKR ${Number(n || 0).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtYmd = (v) => {
  const [y, m, d] = String(v).slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", { timeZone: "UTC" });
};

// Fully isolated: email and SMS each have their own try/catch and never throw.
async function sendRoomPaymentNotifications(groupRef) {
  let rows;
  try {
    rows = await loadPaidGroup(groupRef);
    if (!rows.length) return;
    await ensureInvoiceNumber(groupRef);
    rows = await loadPaidGroup(groupRef); // reload so invoice_number is present
  } catch (e) {
    console.error("[roomNotify] lookup failed:", e.message);
    return;
  }

  const first = rows[0];
  const name = first.full_name;
  const roomNames = rows.map((r) => r.room_name).join(", ");
  const checkIn = fmtYmd(first.check_in);
  const checkOut = fmtYmd(first.check_out);
  const amount = rows.reduce((s, r) => s + Number(r.total_amount), 0);
  const method = first.payment_method === "cash" ? "Cash" : "Online";

  // ── Email, with the PDF invoice attached ──
  try {
    if (first.email) {
      let invoicePdf = null;
      let invoiceNumber = first.invoice_number;
      try {
        const inv = await renderInvoice(groupRef, rows);
        invoicePdf = inv.buffer;
        invoiceNumber = inv.invoiceNumber;
      } catch (pdfErr) {
        console.error("[roomNotify] invoice PDF failed:", pdfErr.message);
      }
      await sendEmail({
        to: first.email,
        subject: `Room booking confirmed — ${groupRef} (Invoice ${invoiceNumber})`,
        log: { type: "payment_receipt", bookingRef: groupRef },
        text:
          `Hi ${name},\n\nWe received your payment of ${fmtLkr(amount)} for your room booking ${groupRef}.\n` +
          `Rooms: ${roomNames}\nCheck-in: ${checkIn}\nCheck-out: ${checkOut}\n` +
          `Invoice ${invoiceNumber} is attached.`,
        html: layout(
          "Room booking confirmed",
          `<p>Hi ${escapeHtml(name)},</p>
           <p>Thank you. Your payment was received and your room booking is confirmed.</p>` +
            detailsTable([
              ["Reference", groupRef],
              ["Rooms", roomNames],
              ["Check-in", checkIn],
              ["Check-out", checkOut],
              ["Nights", first.nights],
              ["Amount paid", fmtLkr(amount)],
              ["Method", method],
              ["Invoice", invoiceNumber],
            ]) +
            (invoicePdf ? `<p>Your invoice is attached as a PDF.</p>` : "")
        ),
        attachments: invoicePdf
          ? [{ filename: `${invoiceNumber}.pdf`, content: invoicePdf, contentType: "application/pdf" }]
          : undefined,
      });
    }
  } catch (e) {
    console.error("[roomNotify] email failed:", e.message);
  }

  // ── SMS ──
  // TODO: wire in sms.service once its send helper is shared (needs the same
  // text.lk helper that sendPaymentReceivedSms uses).
}

module.exports = { sendRoomPaymentNotifications };