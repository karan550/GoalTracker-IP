import express from 'express';
import {
  logProgress,
  getProgressHistory,
  getWeeklyProgress,
  updateProgress,
  deleteProgress
} from '../controllers/progressController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateProgress, validateMongoId } from '../middleware/validationMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/', validateProgress, logProgress);
router.get('/weekly', getWeeklyProgress);
router.get('/goal/:goalId', validateMongoId, getProgressHistory);

router.route('/:id')
  .put(validateMongoId, updateProgress)
  .delete(validateMongoId, deleteProgress);

export default router;
