import { createMeal, getAllMeals, getMealById, updateMeal, deleteMeal } from '../controllers/mealController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

export default function mealRoutes(req, res, pathname, method) {
  // All routes require staff or admin role
  const withStaffAuth = (handler) => authenticateToken(req, res, () => requireRole('staff', 'admin')(req, res, handler));

  // Meal CRUD routes
  if (pathname === '/api/meals' && method === 'POST') {
    return withStaffAuth(() => createMeal(req, res));
  }

  if (pathname === '/api/meals' && method === 'GET') {
    return getAllMeals(req, res);
  }

  // Meal by ID routes
  const mealIdMatch = pathname.match(/^\/api\/meals\/(\d+)$/);
  if (mealIdMatch) {
    const id = mealIdMatch[1];

    if (method === 'GET') {
      return withStaffAuth(() => getMealById({ ...req, params: { id } }, res));
    }

    if (method === 'PUT') {
      return withStaffAuth(() => updateMeal({ ...req, params: { id } }, res));
    }

    if (method === 'DELETE') {
      return withStaffAuth(() => deleteMeal({ ...req, params: { id } }, res));
    }
  }

  // Method not allowed
  res.json({ error: 'Method not allowed' }, 405);
}