const { body, query, param } = require('express-validator');

/**
 * Validate query params for listing customers
 */
const validateListCustomers = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100')
    .toInt(),

  query('search')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('search term must not exceed 100 characters'),

  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
    .toBoolean(),

  query('sortBy')
    .optional()
    .isIn(['firstName', 'lastName', 'email', 'createdAt', 'totalBookings'])
    .withMessage('sortBy must be one of: firstName, lastName, email, createdAt, totalBookings'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('sortOrder must be asc or desc'),
];

/**
 * Validate :id param (shared across routes)
 */
const validateCustomerId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Customer ID must be a positive integer')
    .toInt(),
];

/**
 * Validate PUT /api/customers/:id body
 */
const validateUpdateCustomer = [
  ...validateCustomerId,

  body('firstName')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('firstName must be between 1 and 50 characters'),

  body('lastName')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('lastName must be between 1 and 50 characters'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('email must not exceed 255 characters'),

  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-().]{7,20}$/)
    .withMessage('Must be a valid phone number'),

  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('dateOfBirth must be a valid ISO 8601 date (YYYY-MM-DD)')
    .toDate()
    .custom((value) => {
      const age = (Date.now() - value.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (age < 0 || age > 120) {
        throw new Error('dateOfBirth must represent a realistic age');
      }
      return true;
    }),

  body('address')
    .optional()
    .isObject()
    .withMessage('address must be an object'),

  body('address.street')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 200 })
    .withMessage('street must not exceed 200 characters'),

  body('address.city')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('city must not exceed 100 characters'),

  body('address.state')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('state must not exceed 100 characters'),

  body('address.postalCode')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 20 })
    .withMessage('postalCode must not exceed 20 characters'),

  body('address.country')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('country must not exceed 100 characters'),

  body('emergencyContact')
    .optional()
    .isObject()
    .withMessage('emergencyContact must be an object'),

  body('emergencyContact.name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('emergencyContact.name must be between 1 and 100 characters'),

  body('emergencyContact.phone')
    .optional()
    .matches(/^\+?[\d\s\-().]{7,20}$/)
    .withMessage('emergencyContact.phone must be a valid phone number'),

  body('emergencyContact.relationship')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('emergencyContact.relationship must not exceed 50 characters'),

  body('notes')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('notes must not exceed 1000 characters'),

  // Prevent clients from directly patching sensitive fields
  body('passwordHash').not().exists().withMessage('passwordHash cannot be updated via this endpoint'),
  body('isActive').not().exists().withMessage('isActive cannot be changed via this endpoint'),
  body('role').not().exists().withMessage('role cannot be changed via this endpoint'),
];

/**
 * Validate query params for customer bookings list
 */
const validateCustomerBookingsQuery = [
  ...validateCustomerId,

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('limit must be between 1 and 50')
    .toInt(),

  query('status')
    .optional()
    .isIn(['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW'])
    .withMessage('Invalid booking status'),

  query('fromDate')
    .optional()
    .isISO8601()
    .withMessage('fromDate must be a valid ISO 8601 date')
    .toDate(),

  query('toDate')
    .optional()
    .isISO8601()
    .withMessage('toDate must be a valid ISO 8601 date')
    .toDate()
    .custom((toDate, { req }) => {
      if (req.query.fromDate && toDate < new Date(req.query.fromDate)) {
        throw new Error('toDate must be after fromDate');
      }
      return true;
    }),
];

module.exports = {
  validateListCustomers,
  validateCustomerId,
  validateUpdateCustomer,
  validateCustomerBookingsQuery,
};
