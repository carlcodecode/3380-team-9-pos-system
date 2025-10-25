import { createReview } from '../controllers/reviewController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

export default function reviewRoutes(req, res, pathname, method) {
  // Reviews require customer authentication
  const withCustomerAuth = (handler) => authenticateToken(req, res, () => requireRole('customer')(req, res, handler));

  // Create review route
  if (pathname === '/api/reviews' && method === 'POST') {
    return withCustomerAuth(() => createReview(req, res));
  }

  // Method not allowed
  res.json({ error: 'Method not allowed' }, 405);
}