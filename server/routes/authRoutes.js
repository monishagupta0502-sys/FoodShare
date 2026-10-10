const express = require('express');
const { check } = require('express-validator');
const { register, login, getMe } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

router.post(
  '/register',
  [
    check('name', 'Name is required').notEmpty().trim(),
    check('email', 'Please provide a valid email').isEmail().normalizeEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('role', 'Role must be either donor or ngo').isIn(['donor', 'ngo']),
    validate,
  ],
  register
);

router.post(
  '/login',
  [
    check('email', 'Please provide a valid email').isEmail().normalizeEmail(),
    check('password', 'Password is required').exists(),
    validate,
  ],
  login
);

router.get('/me', protect, getMe);

module.exports = router;
