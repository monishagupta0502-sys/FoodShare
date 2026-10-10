/**
 * Restrict routes to specified roles
 * @param  {...string} roles - Authorized roles ('donor', 'ngo', 'admin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before role check.',
        data: null,
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route. Required: [${roles.join(', ')}]`,
        data: null,
      });
    }

    next();
  };
};

module.exports = authorize;
