const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'blood_donation_secure_jwt_secret_key_2026';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['x-access-token'];
  if (!authHeader) {
    return res.status(401).json({ msg: 'Access denied. No authorization token provided.' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ msg: 'Invalid or expired authentication token.' });
  }
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['x-access-token'];
  if (authHeader) {
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader;
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      // Ignore token failure for optional endpoints
    }
  }
  next();
};

const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ msg: 'Authentication required.' });
    }
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ msg: 'Access forbidden: insufficient permissions.' });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  optionalAuth,
  requireRole,
  JWT_SECRET
};

