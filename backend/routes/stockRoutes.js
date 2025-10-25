import { getAllStocks, getStockById, updateStock } from '../controllers/stockController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

export default function stockRoutes(req, res, pathname, method) {
  // All routes require staff role (staff or admin)
  const withStaffAuth = (handler) => authenticateToken(req, res, () => requireRole('staff')(req, res, handler));

  // Stock routes
  if (pathname === '/api/stocks' && method === 'GET') {
    return withStaffAuth(() => getAllStocks(req, res));
  }

  // Stock by ID routes
  const stockIdMatch = pathname.match(/^\/api\/stocks\/(\d+)$/);
  if (stockIdMatch) {
    const id = stockIdMatch[1];

    if (method === 'GET') {
      return withStaffAuth(() => getStockById({ ...req, params: { id } }, res));
    }

    if (method === 'PUT') {
      return withStaffAuth(() => updateStock({ ...req, params: { id } }, res));
    }
  }

  // Method not allowed
  res.json({ error: 'Method not allowed' }, 405);
}
