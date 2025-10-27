import { createRevenueReport } from '../controllers/staffController.js';
import { authenticateToken } from '../middleware/auth.js';

const withStaffOrAdmin = (req, res, handler) =>
  authenticateToken(req, res, () => {
    const r = req.user?.role;
    if (r === 'staff' || r === 'admin') return handler();
    return res.json({ error: 'Forbidden' }, 403);
  });

export default function staffRoutes(req, res, pathname, method) {
  if (pathname === '/api/staff/reports/revenue' && method === 'POST') {
    return withStaffOrAdmin(req, res, () => createRevenueReport(req, res));
  }
  // Let other route modules handle anything else
}
