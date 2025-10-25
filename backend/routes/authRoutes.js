import { register, login, getCurrentUser, logout } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

export default function authRoutes(req, res, pathname, method) {
  // Public routes
  if (pathname === '/api/auth/register' && method === 'POST') {
    return register(req, res);
  }

  if (pathname === '/api/auth/login' && method === 'POST') {
    return login(req, res);
  }

  // Protected routes
  if (pathname === '/api/auth/me' && method === 'GET') {
    return authenticateToken(req, res, () => getCurrentUser(req, res));
  }

  if (pathname === '/api/auth/logout' && method === 'POST') {
    return authenticateToken(req, res, () => logout(req, res));
  }

  // Method not allowed
  res.json({ error: 'Method not allowed' }, 405);
}
