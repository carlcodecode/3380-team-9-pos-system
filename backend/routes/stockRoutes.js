import {
  getAllStocks,
  getStockById,
  updateStock,
  updateStockSettings,
  restockMeal,
} from '../controllers/stockController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import {
  getLowStockAlerts,
  markAlertResolved,
  getDeliveryAlerts,
} from '../controllers/triggerController.js';

export default function stockRoutes(req, res, pathname, method) {
  // All routes require staff or admin access
  const withStaffAuth = (handler) =>
    authenticateToken(req, res, () => requireRole('staff', 'admin')(req, res, handler));

  // Get delivery alerts
  if (pathname === '/api/stocks/delivery-alerts' && method === 'GET') {
    return withStaffAuth(() => getDeliveryAlerts(req, res));
  }

  // Low Stock Alerts — Get All (Unresolved)
  if (pathname === '/api/stocks/alerts' && method === 'GET') {
    return withStaffAuth(() => getLowStockAlerts(req, res));
  }

  // Get All Stocks
  if (pathname === '/api/stocks' && method === 'GET') {
    return withStaffAuth(() => getAllStocks(req, res));
  }

  const deliveryResolveMatch = pathname.match(/^\/api\/stocks\/delivery-alerts\/(\d+)\/resolve$/);
  if (deliveryResolveMatch) {
    const eventId = deliveryResolveMatch[1];

    if (method === 'PUT') {
      return withStaffAuth(() => markAlertResolved({ ...req, params: { eventId } }, res));
    }
  }

  // Get or Update Stock by ID
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

  // Update Stock Settings
  const stockSettingsMatch = pathname.match(/^\/api\/stocks\/(\d+)\/settings$/);
  if (stockSettingsMatch) {
    const id = stockSettingsMatch[1];

    if (method === 'PUT') {
      return withStaffAuth(() => updateStockSettings({ ...req, params: { id } }, res));
    }
  }

  // Restock Meal
  const stockRestockMatch = pathname.match(/^\/api\/stocks\/(\d+)\/restock$/);
  if (stockRestockMatch) {
    const id = stockRestockMatch[1];

    if (method === 'POST') {
      return withStaffAuth(() => restockMeal({ ...req, params: { id } }, res));
    }
  }

  // Mark as resolved
  const alertResolveMatch = pathname.match(/^\/api\/stocks\/alerts\/(\d+)\/resolve$/);
  if (alertResolveMatch) {
    const eventId = alertResolveMatch[1];

    if (method === 'PUT') {
      return withStaffAuth(() => markAlertResolved({ ...req, params: { eventId } }, res));
    }
  }

  // Default fallback
  return res.status(405).json({ error: 'Method not allowed' });
}
