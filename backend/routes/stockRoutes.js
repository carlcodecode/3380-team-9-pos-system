import express from 'express';
import { getAllStocks, getStockById, updateStock} from '../controllers/stockController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, requireRole('staff'), getAllStocks);
router.get('/:id', authenticateToken, requireRole('staff'), getStockById);
router.put('/:id', authenticateToken, requireRole('staff'), updateStock);

export default router;
