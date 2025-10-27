import { createRevenueReport } from '../controllers/staffController.js';
import { authenticateToken } from '../middleware/auth.js';

const withStaffOrAdmin = (req, res, handler) =>
  authenticateToken(req, res, () => {
    const r = req.user?.role;
    if (r === 'staff' || r === 'admin') return handler();
    return res.json({ error: 'Forbidden' }, 403);
  });

export default function staffRoutes(req, res, pathname, method) {
  if (method === 'POST' && pathname === '/api/staff/reports/revenue') {
    // Default = JSON for “View” in frontend
    return withStaffOrAdmin(req, res, () => createRevenueReport(req, res));
  }
  if (method === 'POST' && pathname === '/api/staff/reports/revenue.csv') {
    // Direct CSV download endpoint (button: “Download CSV”)
    return withStaffOrAdmin(req, res, () => createRevenueReport(req, res, 'csv'));
  }
  // Let other route modules handle anything else
}
