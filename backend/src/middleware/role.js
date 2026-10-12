// Role Based Access Control Middleware

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.user.role;
    // 'admin' role always has full access
    if (userRole === 'admin' || allowedRoles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({
      error: `Access forbidden. Required role: [${allowedRoles.join(', ')}], your role: [${userRole}]`
    });
  };
}

module.exports = { requireRole };
