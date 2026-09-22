const PDFDocument = require('pdfkit');

// Builds a one-page invoice PDF in memory and resolves with the finished
// Buffer — no temp files, no disk writes, safe to call per-request.
const generateInvoicePdf = ({ booking, payment, customer }) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const money = (n) => `LKR ${Number(n).toFixed(2)}`;

    // ── Header ──────────────────────────────────────────────
    doc.fontSize(20).text('Aazath Plaza', { align: 'left' });
    doc
      .fontSize(9)
      .fillColor('gray')
      .text('Colombo - Batticaloa Hwy, Kalmunai 32300, Sri Lanka');
    doc.fillColor('black');
    doc.moveDown();

    doc.fontSize(16).text('INVOICE', { align: 'left' });
    doc.fontSize(10).text(`Invoice #: ${payment.invoice_number || 'N/A'}`);
    doc.text(`Date: ${payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : 'N/A'}`);
    doc.moveDown();

    // ── Bill to ─────────────────────────────────────────────
    doc.fontSize(12).text('Bill To', { underline: true });
    doc.fontSize(10);
    doc.text(customer.full_name);
    doc.text(customer.email);
    if (customer.phone) doc.text(customer.phone);
    doc.moveDown();

    // ── Booking details ─────────────────────────────────────
    doc.fontSize(12).text('Booking Details', { underline: true });
    doc.fontSize(10);
    doc.text(`Reference: ${booking.booking_ref}`);
    doc.text(`Hall: ${booking.hall_name || 'N/A'}`);
    doc.text(`Date: ${booking.event_date}`);
    doc.text(`Time: ${booking.event_start_time} - ${booking.event_end_time}`);
    doc.text(`Event type: ${booking.event_type}`);
    doc.text(`Guests: ${booking.guest_count}`);
    doc.moveDown();

    // ── Charges ─────────────────────────────────────────────
    doc.fontSize(12).text('Charges', { underline: true });
    doc.fontSize(10);
    doc.text(`Base amount: ${money(booking.base_amount)}`);
    doc.text(`Add-ons: ${money(booking.addon_amount)}`);
    doc.text(`Discount: -${money(booking.discount_amount)}`);
    doc.text(`Tax: ${money(booking.tax_amount)}`);
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Total Paid: ${money(payment.amount)}`, { underline: true });
    doc.moveDown();

    // ── Payment info ────────────────────────────────────────
    doc.fontSize(9).fillColor('gray');
    doc.text(`Payment method: ${payment.payment_method}`);
    doc.text(`Transaction ID: ${payment.transaction_id || 'N/A'}`);
    doc.text(`Paid at: ${payment.paid_at ? new Date(payment.paid_at).toLocaleString() : 'N/A'}`);
    doc.fillColor('black');

    doc.end();
  });
};

module.exports = { generateInvoicePdf };