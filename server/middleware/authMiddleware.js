const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes by validating JWT Bearer token
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'foodshare_secret_key_2026');

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User belonging to this token no longer exists.',
          data: null,
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Your account is deactivated. Please contact support.',
          data: null,
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed or expired.',
        data: null,
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided.',
      data: null,
    });
  }
};

module.exports = protect;
