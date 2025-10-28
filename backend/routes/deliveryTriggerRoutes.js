import { authenticateToken } from '../middleware/auth.js';
import { getCustomerDeliveryAlerts, markAlertResolved } from '../controllers/triggerController.js';

export default function deliveryTriggerRoutes(req, res, pathname, method) {
  // ✅ GET /api/triggers/alerts/customer/:customerId
  if (pathname.match(/^\/api\/triggers\/alerts\/customer\/\d+$/) && method === 'GET') {
    const customerId = pathname.split('/').pop();
    req.params = { customerId };
    return authenticateToken(req, res, () => getCustomerDeliveryAlerts(req, res));
  }

  // ✅ PUT /api/triggers/alerts/:eventId/resolve
  if (pathname.match(/^\/api\/triggers\/alerts\/\d+\/resolve$/) && method === 'PUT') {
    const eventId = pathname.split('/')[4];
    console.log("🟡 Route matched for markAlertResolved, eventId:", eventId);

    req.params = { eventId };
    return markAlertResolved(req, res); // must be inside return
  }

  // ❌ Catch-all for unsupported routes
  res.statusCode = 405;
  res.json({ error: 'Method not allowed' });
}
