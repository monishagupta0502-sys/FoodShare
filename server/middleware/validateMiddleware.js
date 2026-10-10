const { validationResult } = require('express-validator');

/**
 * Middleware to check express-validator validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorList = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));
    return res.status(400).json({
      success: false,
      message: errorList[0].message || 'Validation error',
      data: { errors: errorList },
    });
  }
  next();
};

module.exports = validate;
