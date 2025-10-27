import express from 'express';
import {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  archiveGoal,
  getGoalStats
} from '../controllers/goalController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateGoal, validateMongoId } from '../middleware/validationMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Goal CRUD routes
router.route('/')
  .get(getGoals)
  .post(validateGoal, createGoal);

router.get('/stats', getGoalStats);

router.route('/:id')
  .get(validateMongoId, getGoalById)
  .put(validateMongoId, updateGoal)
  .delete(validateMongoId, deleteGoal);

router.patch('/:id/archive', validateMongoId, archiveGoal);

export default router;
