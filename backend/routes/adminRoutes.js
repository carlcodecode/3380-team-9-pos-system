import express from 'express';
import { createStaff, getAllStaff, getStaffById, updateStaff, deleteStaff } from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin role
router.post('/staff', authenticateToken, requireRole('admin'), createStaff);
router.get('/staff', authenticateToken, requireRole('admin'), getAllStaff);
router.get('/staff/:id', authenticateToken, requireRole('admin'), getStaffById);
router.put('/staff/:id', authenticateToken, requireRole('admin'), updateStaff);
router.delete('/staff/:id', authenticateToken, requireRole('admin'), deleteStaff);

export default router;