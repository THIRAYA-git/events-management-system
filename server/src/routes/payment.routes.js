const express = require('express');
const router = express.Router();

const { generateCheckoutHash, verifyNotifySignature } = require('../services/payment.service');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { getBookingById } = require('../services/booking.service');
const { findUserById } = require('../models/user.model');
const { query } = require('../config/db');
const { generateInvoicePdf } = require('../services/pdf.service');

// ─────────────────────────────────────────────────────────────
//  POST /api/payments/initiate
// ─────────────────────────────────────────────────────────────
router.post('/initiate', authenticate, authorize('payment:create'), async (req, res) => {
  const { bookingId } = req.body;

  if (!bookingId) {
    return res.status(400).json({ error: 'bookingId is required' });
  }

  try {
    let booking;
    try {
      booking = await getBookingById(bookingId);
    } catch {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (req.user.role === 'customer' && booking.user_id !== req.user.id) {
      return res.status(403).json({ error: 'You do not have access to this booking' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ error: `Booking is '${booking.status}', not payable` });
    }

    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const orderId = `AZP-${booking.booking_id}-${Date.now()}`;
    const amount = booking.total_amount;

    const hash = generateCheckoutHash(orderId, amount);

    await query(
      `INSERT INTO payments (booking_id, amount, payment_method, payhere_order_id, status, currency)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [booking.booking_id, amount, 'credit_card', orderId, 'pending', 'LKR']
    );

    const nameParts = (user.full_name || '').trim().split(/\s+/);
    const firstName = nameParts[0] || 'Guest';
    const lastName = nameParts.slice(1).join(' ') || firstName;

    res.status(201).json({
      merchant_id: process.env.PAYHERE_MERCHANT_ID,
      order_id: orderId,
      amount: Number(amount).toFixed(2),
      currency: 'LKR',
      hash,
      notify_url: `${process.env.API_BASE_URL}/api/payments/notify`,
      return_url: `${process.env.CLIENT_BASE_URL}/payment/success`,
      cancel_url: `${process.env.CLIENT_BASE_URL}/payment/cancelled`,
      items: `${booking.event_type} - ${booking.hall_name || 'Azath Plaza'} (${booking.booking_ref})`,
      first_name: firstName,
      last_name: lastName,
      email: user.email,
      phone: user.phone || '0000000000',
      address: 'N/A',
      city: 'Oluvil',
      country: 'Sri Lanka',
    });
  } catch (err) {
    console.error('Payment initiation error:', err);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});




// ─────────────────────────────────────────────────────────────
//  POST /api/payments/notify  — PayHere webhook, no auth
// ─────────────────────────────────────────────────────────────
router.post('/notify', async (req, res) => {
  try {
    const isValid = verifyNotifySignature(req.body);

    if (!isValid) {
      console.warn('Invalid PayHere signature for order:', req.body.order_id);
      return res.status(400).send('Invalid signature');
    }
  
    

    const { order_id, status_code, payment_id } = req.body;

    const paymentStatus =
      status_code === '2' ? 'completed' :
      status_code === '0' ? 'pending' :
      status_code === '-1' ? 'failed' :  // no 'cancelled' enum value — closest fit
      status_code === '-2' ? 'failed' : 'failed';

    const result = await query(
      `UPDATE payments
       SET status = $1::payment_status,
           transaction_id = $2,
           paid_at = CASE WHEN $1::text = 'completed' THEN NOW() ELSE paid_at END,
           gateway_response = $3::jsonb,
           updated_at = NOW()
       WHERE payhere_order_id = $4
       RETURNING payment_id, booking_id`,
      [paymentStatus, payment_id, JSON.stringify(req.body), order_id]
    );

    const bookingId = result.rows[0]?.booking_id;
    const paymentRowId = result.rows[0]?.payment_id;

    if (bookingId && paymentStatus === 'completed') {
      await query(
        `UPDATE bookings SET status = 'confirmed', confirmed_at = NOW() WHERE booking_id = $1`,
        [bookingId]
      );

      // Invoice numbers are only ever assigned once a payment actually
      // completes — generated here rather than at insert time, since a
      // pending/failed payment should never have one.
      await query(
        `UPDATE payments
         SET invoice_number = 'INV-' || to_char(NOW(), 'YYYYMMDD') || '-' || payment_id
         WHERE payment_id = $1`,
        [paymentRowId]
      );
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('Payment notify error:', err);
    res.status(500).send('Error processing notification');
  }
});

// ─────────────────────────────────────────────────────────────
//  GET /api/payments/:bookingId
// ─────────────────────────────────────────────────────────────
router.get('/:bookingId', authenticate, authorize('payment:read_own'), async (req, res) => {
  const { bookingId } = req.params;

  try {
    let booking;
    try {
      booking = await getBookingById(bookingId);
    } catch {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // authorize('payment:read_own') only checks role, not ownership of
    // this specific booking — without this check, any customer could
    // read any other customer's payment status by guessing bookingIds.
    if (req.user.role === 'customer' && booking.user_id !== req.user.id) {
      return res.status(403).json({ error: 'You do not have access to this payment' });
    }

    const result = await query(
      `SELECT payment_id, booking_id, amount, payment_method, status, currency,
              transaction_id, payhere_order_id, invoice_number, paid_at, created_at
       FROM payments WHERE booking_id = $1
       ORDER BY created_at DESC LIMIT 1`,
      [bookingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No payment found for this booking' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Payment status fetch error:', err);
    res.status(500).json({ error: 'Failed to retrieve payment status' });
  }
});

// ─────────────────────────────────────────────────────────────
//  GET /api/payments/:bookingId/invoice — download a PDF invoice
//  for a completed payment. Generated on the fly, not stored.
// ─────────────────────────────────────────────────────────────
router.get('/:bookingId/invoice', authenticate, authorize('payment:read_own'), async (req, res) => {
  const { bookingId } = req.params;

  try {
    let booking;
    try {
      booking = await getBookingById(bookingId);
    } catch {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (req.user.role === 'customer' && booking.user_id !== req.user.id) {
      return res.status(403).json({ error: 'You do not have access to this invoice' });
    }

    const paymentResult = await query(
      `SELECT payment_id, invoice_number, amount, payment_method, currency,
              transaction_id, paid_at
       FROM payments
       WHERE booking_id = $1 AND status = 'completed'
       ORDER BY created_at DESC LIMIT 1`,
      [bookingId]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'No completed payment found for this booking' });
    }
    const payment = paymentResult.rows[0];

    const customer = await findUserById(booking.user_id);

    const pdfBuffer = await generateInvoicePdf({ booking, payment, customer });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="invoice-${payment.invoice_number || booking.booking_ref}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Invoice generation error:', err);
    res.status(500).json({ error: 'Failed to generate invoice' });
  }
});

module.exports = router;