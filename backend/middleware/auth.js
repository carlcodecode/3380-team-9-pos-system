import jwt from 'jsonwebtoken';
import { getUserRole } from '../utils/roleHelper.js';

// Middleware to verify JWT token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.json({ error: 'Access token required' }, 401);
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      res.json({ error: 'Invalid or expired token' }, 403);
      return;
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
