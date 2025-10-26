import { createStaff, getAllStaff, getStaffById, updateStaff, deleteStaff, getStaffMealCreatedReport, getStaffMealUpdatedReport } from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

export default function adminRoutes(req, res, pathname, method) {
  // All routes require admin role
  const withAuth = (handler) => authenticateToken(req, res, () => requireRole('admin')(req, res, handler));
  const withStaffAuth = (handler) => authenticateToken(req, res, () => requireRole('staff')(req, res, handler));

  // Staff management routes
  if (pathname === '/api/admin/staff' && method === 'POST') {
    return withAuth(() => createStaff(req, res));
  }

  if (pathname === '/api/admin/staff' && method === 'GET') {
    return withAuth(() => getAllStaff(req, res));
  }

  // Staff by ID routes
  const staffIdMatch = pathname.match(/^\/api\/admin\/staff\/(\d+)$/);
  if (staffIdMatch) {
    const id = staffIdMatch[1];

    if (method === 'GET') {
      return withAuth(() => getStaffById({ ...req, params: { id } }, res));
    }

    if (method === 'PUT') {
      return withAuth(() => updateStaff({ ...req, params: { id } }, res));
    }

    if (method === 'DELETE') {
      return withAuth(() => deleteStaff({ ...req, params: { id } }, res));
    }
  }

  // Report routes
  if (pathname === '/api/admin/reports/staff-meal-created' && method === 'GET') {
    return withAuth(() => getStaffMealCreatedReport(req, res));
  }

  if (pathname === '/api/admin/reports/staff-meal-updated' && method === 'GET') {
    return withAuth(() => getStaffMealUpdatedReport(req, res));
  }

  // Method not allowed
  res.json({ error: 'Method not allowed' }, 405);
}