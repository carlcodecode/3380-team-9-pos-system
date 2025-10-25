import {
  getAllStocks,
  getStockById,
  updateStock,
  updateStockSettings,
  restockMeal,
} from '../controllers/stockController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

export default function stockRoutes(req, res, pathname, method) {
  const withStaffAuth = (handler) =>
    authenticateToken(req, res, () => requireRole('staff')(req, res, handler));


  if (pathname === '/api/stocks' && method === 'GET') {
    return withStaffAuth(() => getAllStocks(req, res));
  }

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

  const stockSettingsMatch = pathname.match(/^\/api\/stocks\/(\d+)\/settings$/);
  if (stockSettingsMatch) {
    const id = stockSettingsMatch[1];

    if (method === 'PUT') {
      return withStaffAuth(() =>
        updateStockSettings({ ...req, params: { id } }, res)
      );
    }
  }

  const stockRestockMatch = pathname.match(/^\/api\/stocks\/(\d+)\/restock$/);
  if (stockRestockMatch) {
    const id = stockRestockMatch[1];

    if (method === 'POST') {
      return withStaffAuth(() =>
        restockMeal({ ...req, params: { id } }, res)
      );
    }
  }
  res.json({ error: 'Method not allowed' }, 405);
}
