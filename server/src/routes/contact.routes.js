const express = require("express");
const rateLimit = require("express-rate-limit");
const { body } = require("express-validator");
const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate");
const { sendContactMessageEmail } = require("../services/email.service");

const router = express.Router();

const TOPICS = [
  "Booking enquiry",
  "Catering",
  "Accommodation",
  "Event organizers and sponsors",
  "Payment or invoice",
  "Other",
];

// 5 messages per hour per logged-in user — stops the form being used to spam the inbox
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => `contact-${req.user?.id ?? req.ip}`,
  validate: { keyGeneratorIpFallback: false },
  message: { message: "You have sent several messages recently. Please try again later." },
});

const validateContact = [
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Please enter your name."),
  body("email").trim().isEmail().withMessage("Please enter a valid email address."),
  body("phone")
    .optional({ values: "falsy" })
    .trim()
    .matches(/^[+\d][\d\s-]{6,19}$/)
    .withMessage("Please enter a valid phone number."),
  body("subject").isIn(TOPICS).withMessage("Please choose a topic."),
  body("message")
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Message must be between 10 and 2000 characters."),
];

router.use(authenticate);

// POST /api/contact — any logged-in user sends a message to the hall
router.post("/", contactLimiter, validateContact, validate, async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  const sent = await sendContactMessageEmail({ name, email, phone, subject, message });
  if (!sent) {
    return res
      .status(502)
      .json({ message: "We couldn't send your message right now. Please try again shortly." });
  }
  res.status(200).json({ success: true });
});

module.exports = router;