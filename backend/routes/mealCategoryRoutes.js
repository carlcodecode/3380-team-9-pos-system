import express from 'express';
import { getAllMealCategories, getMealCategoryById, createMealCategory, updateMealCategory, deleteMealCategory } from '../controllers/mealCategoryController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateToken, requireRole('staff'), createMealCategory);
router.get('/', authenticateToken, requireRole('staff'), getAllMealCategories);
router.get('/:id', authenticateToken, requireRole('staff'), getMealCategoryById);
router.put('/:id', authenticateToken, requireRole('staff'), updateMealCategory);
router.delete('/:id', authenticateToken, requireRole('staff'), deleteMealCategory);

export default router;