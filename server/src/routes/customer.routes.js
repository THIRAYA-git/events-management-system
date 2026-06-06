const express = require('express');

const { authenticate, restrictTo }  = require('../middleware/auth.middleware');
const { validate }                  = require('../middleware/validate');
const {
  validateListCustomers,
  validateCustomerId,
  validateUpdateCustomer,
  validateCustomerBookingsQuery,
} = require('../validators/customer.validator');
const {
  listCustomers,
  getCustomer,
  updateCustomer,
  deactivateCustomer,
  getCustomerBookings,
} = require('../controllers/customer.controller');

const router = express.Router();

// All customer routes require a valid token
router.use(authenticate);

// GET /api/customers — admin | manager | front_desk
router.get(
  '/',
  restrictTo('admin', 'manager', 'front_desk'),
  validateListCustomers,
  validate,
  listCustomers
);

// GET /api/customers/:id — admin | manager | front_desk
router.get(
  '/:id',
  restrictTo('admin', 'manager', 'front_desk'),
  validateCustomerId,
  validate,
  getCustomer
);

// PUT /api/customers/:id — admin | manager | front_desk
router.put(
  '/:id',
  restrictTo('admin', 'manager', 'front_desk'),
  validateUpdateCustomer,
  validate,
  updateCustomer
);

// DELETE /api/customers/:id — admin only (soft-deactivate)
router.delete(
  '/:id',
  restrictTo('admin'),
  validateCustomerId,
  validate,
  deactivateCustomer
);

// GET /api/customers/:id/bookings — admin | manager | front_desk
router.get(
  '/:id/bookings',
  restrictTo('admin', 'manager', 'front_desk'),
  validateCustomerBookingsQuery,
  validate,
  getCustomerBookings
);

module.exports = router;