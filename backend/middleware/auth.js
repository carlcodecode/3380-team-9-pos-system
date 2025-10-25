import jwt from 'jsonwebtoken';
import { getUserRole } from '../utils/roleHelper.js';

// Middleware to verify JWT token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to check if user has required role
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.json({ error: 'Authentication required' }, 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.json({ error: 'Insufficient permissions' }, 403);
      return;
    }

    next();
  };
};
