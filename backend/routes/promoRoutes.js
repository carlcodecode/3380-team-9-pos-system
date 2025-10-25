import {
  createPromo,
  getAllPromos,
  getPromoById,
  updatePromo,
  deletePromo,
} from '../controllers/promoController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

export default function promoRoutes(req, res, pathname, method) {
  // Allow staff or ad in
  const withStaffAuth = (handler) =>
    authenticateToken(req, res, () => requireRole('staff')(req, res, handler));

  // Create + list
  if (pathname === '/api/promotions' && method === 'POST') {
    return withStaffAuth(() => createPromo(req, res));
  }

  if (pathname === '/api/promotions' && method === 'GET') {
    return withStaffAuth(() => getAllPromos(req, res));
  }

  // Single promotion with ID
  const promoIdMatch = pathname.match(/^\/api\/promotions\/(\d+)$/);
  if (promoIdMatch) {
    const id = promoIdMatch[1];

    if (method === 'GET') {
      return withStaffAuth(() => getPromoById({ ...req, params: { id } }, res));
    }
    if (method === 'PUT') {
      return withStaffAuth(() => updatePromo({ ...req, params: { id } }, res));
    }
    if (method === 'DELETE') {
      return withStaffAuth(() => deletePromo({ ...req, params: { id } }, res));
    }
  }

  res.json({ error: 'Method not allowed' }, 405);
}
