const nodemailer = require("nodemailer");

// SendGrid's SMTP relay: host is fixed, the "user" is literally the string
// "apikey" (not your account username), and EMAIL_PASS is your SendGrid
// API key. EMAIL_FROM must be a sender you've verified in SendGrid —
// SendGrid rejects sends from unverified addresses regardless of the API
// key being valid.
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false, // SendGrid uses STARTTLS on 587, not implicit TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html, text, replyTo }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text,
      ...(replyTo ? { replyTo } : {}),
    });
    return true;
  } catch (err) {
    // Email failures should never crash the calling request (e.g. a
    // password reset should still respond 200 even if delivery fails) —
    // log it and let the caller decide whether to surface anything.
    console.error("[email.service] Failed to send email:", err.message);
    return false;
  }
};

const sendPasswordResetEmail = async (to, resetLink) => {
  return sendEmail({
    to,
    subject: "Reset your Aazath Plaza password",
    text: `You requested a password reset. Use this link (valid for a limited time): ${resetLink}\n\nIf you did not request this, ignore this email.`,
    html: `
      <p>You requested a password reset for your Aazath Plaza account.</p>
      <p><a href="${resetLink}">Click here to reset your password</a></p>
      <p>This link is valid for a limited time. If you did not request this, you can safely ignore this email.</p>
    `,
  });
};

// Sent right after a booking is created. Bookings start in 'pending'
// status and need staff confirmation (see AdminBookingsPage), so this
// deliberately says "request received" rather than "confirmed" — an
// email promising a confirmed booking before staff have actually
// confirmed it would be misleading.
const sendBookingConfirmationEmail = async (to, booking) => {
  const {
    customerName,
    bookingRef,
    hallName,
    eventDate,
    startTime,
    endTime,
    eventType,
    guestCount,
    totalAmount,
  } = booking;

  return sendEmail({
    to,
    subject: `Booking request received — ${bookingRef}`,
    text:
      `Hi ${customerName},\n\n` +
      `We've received your booking request for Aazath Plaza. Here are the details:\n\n` +
      `Reference: ${bookingRef}\n` +
      `Hall: ${hallName}\n` +
      `Date: ${eventDate}\n` +
      `Time: ${startTime} - ${endTime}\n` +
      `Event type: ${eventType}\n` +
      `Guests: ${guestCount}\n` +
      `Total: LKR ${totalAmount}\n\n` +
      `Your booking is currently pending confirmation from our team. We'll notify you once it's confirmed.`,
    html: `
      <p>Hi ${customerName},</p>
      <p>We've received your booking request for Aazath Plaza. Here are the details:</p>
      <table cellpadding="4" cellspacing="0">
        <tr><td><strong>Reference</strong></td><td>${bookingRef}</td></tr>
        <tr><td><strong>Hall</strong></td><td>${hallName}</td></tr>
        <tr><td><strong>Date</strong></td><td>${eventDate}</td></tr>
        <tr><td><strong>Time</strong></td><td>${startTime} - ${endTime}</td></tr>
        <tr><td><strong>Event type</strong></td><td>${eventType}</td></tr>
        <tr><td><strong>Guests</strong></td><td>${guestCount}</td></tr>
        <tr><td><strong>Total</strong></td><td>LKR ${totalAmount}</td></tr>
      </table>
      <p>Your booking is currently <strong>pending confirmation</strong> from our team. We'll notify you once it's confirmed.</p>
    `,
  });
};

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Message from the Contact page, delivered to the hall's inbox. replyTo is the
// customer, so staff can answer straight from their mail client.
const sendContactMessageEmail = async ({ name, email, phone, subject, message }) => {
  const inbox = process.env.CONTACT_INBOX || process.env.EMAIL_FROM;
  return sendEmail({
    to: inbox,
    replyTo: email,
    subject: `[Contact] ${subject} - ${name}`,
    text: `From: ${name} <${email}>\nPhone: ${phone || "-"}\nTopic: ${subject}\n\n${message}`,
    html: `
      <p><strong>New message from the Contact page</strong></p>
      <table cellpadding="6">
        <tr><td><strong>Name</strong></td><td>${escapeHtml(name)}</td></tr>
        <tr><td><strong>Email</strong></td><td>${escapeHtml(email)}</td></tr>
        <tr><td><strong>Phone</strong></td><td>${escapeHtml(phone || "-")}</td></tr>
        <tr><td><strong>Topic</strong></td><td>${escapeHtml(subject)}</td></tr>
      </table>
      <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
    `,
  });
};

module.exports = {
  sendEmail,
  sendContactMessageEmail,
  sendPasswordResetEmail,
  sendBookingConfirmationEmail,
};