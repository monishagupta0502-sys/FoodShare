const express = require('express');
const { check } = require('express-validator');
const { updateProfile, changePassword } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

router.put(
  '/profile',
  protect,
  [
    check('name', 'Name cannot be empty if provided').optional().notEmpty().trim(),
    validate,
  ],
  updateProfile
);

router.put(
  '/change-password',
  protect,
  [
    check('currentPassword', 'Current password is required').exists(),
    check('newPassword', 'New password must be at least 6 characters long').isLength({ min: 6 }),
    validate,
  ],
  changePassword
);

module.exports = router;
