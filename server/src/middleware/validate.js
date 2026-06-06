const { validationResult } = require('express-validator');

/**
 * Reads express-validator results and short-circuits with 422
 * if any validation errors exist.
 *
 * Usage: place after validator arrays in route definitions.
 *   router.get('/', validateListCustomers, validate, controller.list)
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
        value: err.value,
      })),
    });
  }

  next();
};

module.exports = { validate };
