const { verifyToken } = require('../utils/token');

// Verifies the JWT and attaches { id, role } to req.user.
// Any protected route must run this first.
function protect(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = { id: decoded.id, role: decoded.role };
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

// Usage: requireRole(['admin']) or requireRole(['admin', 'doctor'])
// Must run AFTER protect(), since it relies on req.user being set.
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Role '${req.user.role}' is not authorized to access this resource`,
      });
    }
    return next();
  };
}

module.exports = { protect, requireRole };
