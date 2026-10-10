const jwt = require('jsonwebtoken');

/**
 * Sign JWT token with 7-day expiration
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'foodshare_secret_key_2026', {
    expiresIn: '7d',
  });
};

module.exports = generateToken;
