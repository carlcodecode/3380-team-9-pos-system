import { authenticateToken } from '../middleware/auth.js';
import {
  getCustomerProfile,
  updateCustomerProfile,
  getPaymentMethods,
  addPaymentMethod,
  deletePaymentMethod
} from '../controllers/customerController.js';

export default function customerRoutes(req, res, pathname, method) {
  // All routes require authentication
  
  // GET /api/customers/profile
  if (pathname === '/api/customers/profile' && method === 'GET') {
    return authenticateToken(req, res, () => getCustomerProfile(req, res));
  }

  // PUT /api/customers/profile
  if (pathname === '/api/customers/profile' && method === 'PUT') {
    return authenticateToken(req, res, () => updateCustomerProfile(req, res));
  }

  // GET /api/customers/payment-methods
  if (pathname === '/api/customers/payment-methods' && method === 'GET') {
    return authenticateToken(req, res, () => getPaymentMethods(req, res));
  }

  // POST /api/customers/payment-methods
  if (pathname === '/api/customers/payment-methods' && method === 'POST') {
    return authenticateToken(req, res, () => addPaymentMethod(req, res));
  }

  // DELETE /api/customers/payment-methods/:id
  if (pathname.startsWith('/api/customers/payment-methods/') && method === 'DELETE') {
    const paymentMethodId = pathname.split('/').pop();
    req.params = { paymentMethodId };
    return authenticateToken(req, res, () => deletePaymentMethod(req, res));
  }

  // Method not allowed
  res.json({ error: 'Method not allowed' }, 405);
}
