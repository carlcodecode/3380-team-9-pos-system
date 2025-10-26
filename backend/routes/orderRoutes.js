import { 
  createOrder, 
  getCustomerOrders, 
  getAllOrders, 
  getOrderById, 
  updateOrderStatus 
} from '../controllers/orderController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

export default function orderRoutes(req, res, pathname, method) {
  // Helper to require customer role
  const withCustomerAuth = (handler) => authenticateToken(req, res, () => handler(req, res));

  // Helper to require staff role
  const withStaffAuth = (handler) => authenticateToken(req, res, () => requireRole('staff')(req, res, handler));

  // Create order (customers only)
  if (pathname === '/api/orders' && method === 'POST') {
    return withCustomerAuth(createOrder);
  }

  // Get customer's own orders
  if (pathname === '/api/orders/my-orders' && method === 'GET') {
    return withCustomerAuth(getCustomerOrders);
  }

  // Get all orders (staff only)
  if (pathname === '/api/orders' && method === 'GET') {
    return withStaffAuth(getAllOrders);
  }

  // Order by ID routes
  const orderIdMatch = pathname.match(/^\/api\/orders\/(\d+)$/);
  if (orderIdMatch) {
    const id = orderIdMatch[1];

    if (method === 'GET') {
      return withStaffAuth(() => getOrderById({ ...req, params: { id } }, res));
    }

    if (method === 'PUT') {
      return withStaffAuth(() => updateOrderStatus({ ...req, params: { id } }, res));
    }
  }

  // Update order status route
  const statusMatch = pathname.match(/^\/api\/orders\/(\d+)\/status$/);
  if (statusMatch && method === 'PUT') {
    const id = statusMatch[1];
    return withStaffAuth(() => updateOrderStatus({ ...req, params: { id } }, res));
  }

  // Method not allowed
  res.writeHead(405, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Method not allowed' }));
}
