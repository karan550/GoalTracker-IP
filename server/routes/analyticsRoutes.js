import express from 'express';
import {
  getOverallStats,
  getMonthlyStats,
  getCategoryBreakdown,
  getCompletionTrends
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/overview', getOverallStats);
router.get('/monthly', getMonthlyStats);
router.get('/categories', getCategoryBreakdown);
router.get('/trends', getCompletionTrends);

export default router;
