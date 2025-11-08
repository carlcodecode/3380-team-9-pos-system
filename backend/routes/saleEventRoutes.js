import {
  createSaleEvent,
  getAllSaleEvents,
  getSaleEventById,
  updateSaleEvent,
  deleteSaleEvent,
} from '../controllers/saleEventController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

export default function saleEventRoutes(req, res, pathname, method) {
  // Allow staff or admin
  const withStaffAuth = (handler) =>
    authenticateToken(req, res, () => requireRole('staff', 'admin')(req, res, handler));

  // Create + list
  if (pathname === '/api/sale-events' && method === 'POST') {
    return withStaffAuth(() => createSaleEvent(req, res));
  }

  if (pathname === '/api/sale-events' && method === 'GET') {
    return getAllSaleEvents(req, res);
  }

  // Single sale event with ID
  const saleEventIdMatch = pathname.match(/^\/api\/sale-events\/(\d+)$/);
  if (saleEventIdMatch) {
    const id = saleEventIdMatch[1];

    if (method === 'GET') {
      return withStaffAuth(() => getSaleEventById({ ...req, params: { id } }, res));
    }
    if (method === 'PUT') {
      return withStaffAuth(() => updateSaleEvent({ ...req, params: { id } }, res));
    }
    if (method === 'DELETE') {
      return withStaffAuth(() => deleteSaleEvent({ ...req, params: { id } }, res));
    }
  }

  res.json({ error: 'Method not allowed' }, 405);
}
