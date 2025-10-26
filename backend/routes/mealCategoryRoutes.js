import { getAllMealCategories, getMealCategoryById, createMealCategory, updateMealCategory, deleteMealCategory } from '../controllers/mealCategoryController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

export default function mealCategoryRoutes(req, res, pathname, method) {
  // All routes require staff role (staff or admin)
  const withStaffAuth = (handler) => authenticateToken(req, res, () => requireRole('staff')(req, res, handler));

  // Meal category CRUD routes
  if (pathname === '/api/meal-categories' && method === 'POST') {
    return withStaffAuth(() => createMealCategory(req, res));
  }

  if (pathname === '/api/meal-categories' && method === 'GET') {
    return getAllMealCategories(req, res);
  }

  // Meal category by ID routes
  const mealCategoryIdMatch = pathname.match(/^\/api\/meal-categories\/(\d+)$/);
  if (mealCategoryIdMatch) {
    const id = mealCategoryIdMatch[1];

    if (method === 'GET') {
      return withStaffAuth(() => getMealCategoryById({ ...req, params: { id } }, res));
    }

    if (method === 'PUT') {
      return withStaffAuth(() => updateMealCategory({ ...req, params: { id } }, res));
    }

    if (method === 'DELETE') {
      return withStaffAuth(() => deleteMealCategory({ ...req, params: { id } }, res));
    }
  }

  // Method not allowed
  res.json({ error: 'Method not allowed' }, 405);
}