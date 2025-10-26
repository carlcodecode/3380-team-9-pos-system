import { authenticateToken, requireRole } from '../middleware/auth.js';
import {
  getAllOrders,
  getCustomerOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus
} from '../controllers/orderController.js';

export default function orderRoutes(req, res, pathname, method) {
  // GET /api/orders/all - Get all orders (staff/admin only)
  if (pathname === '/api/orders/all' && method === 'GET') {
    return authenticateToken(req, res, () => 
      requireRole('staff', 'admin')(req, res, () => getAllOrders(req, res))
    );
  }

  // GET /api/orders - Get all orders for authenticated customer
  if (pathname === '/api/orders' && method === 'GET') {
    return authenticateToken(req, res, () => getCustomerOrders(req, res));
  }

  // PUT /api/orders/:id/status - Update order status (staff/admin only)
  if (pathname.match(/^\/api\/orders\/\d+\/status$/) && method === 'PUT') {
    const orderId = pathname.split('/')[3];
    req.params = { orderId };
    return authenticateToken(req, res, () =>
      requireRole('staff', 'admin')(req, res, () => updateOrderStatus(req, res))
    );
  }

  // GET /api/orders/:id - Get specific order by ID
  if (pathname.match(/^\/api\/orders\/\d+$/) && method === 'GET') {
    const orderId = pathname.split('/').pop();
    req.params = { orderId };
    return authenticateToken(req, res, () => getOrderById(req, res));
  }

  // POST /api/orders - Create new order (after payment)
  if (pathname === '/api/orders' && method === 'POST') {
    return authenticateToken(req, res, () => createOrder(req, res));
  }

  // PUT /api/orders/:id - Update order (customer can update notes/shipping)
  if (pathname.match(/^\/api\/orders\/\d+$/) && method === 'PUT') {
    const orderId = pathname.split('/').pop();
    req.params = { orderId };
    return authenticateToken(req, res, () => updateOrder(req, res));
  }

  // Method not allowed
  res.json({ error: 'Method not allowed' }, 405);
}
