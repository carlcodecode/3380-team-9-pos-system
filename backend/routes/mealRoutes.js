import express from 'express';
import { createMeal, getAllMeals, getMealById, updateMeal, deleteMeal } from '../controllers/mealController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require staff role (staff or admin)
router.post('/', authenticateToken, requireRole('staff'), createMeal);
router.get('/', authenticateToken, requireRole('staff'), getAllMeals);
router.get('/:id', authenticateToken, requireRole('staff'), getMealById);
router.put('/:id', authenticateToken, requireRole('staff'), updateMeal);
router.delete('/:id', authenticateToken, requireRole('staff'), deleteMeal);

export default router;