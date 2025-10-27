import express from 'express';
import {
  createMilestone,
  getMilestonesByGoal,
  getUpcomingMilestones,
  updateMilestone,
  toggleMilestoneComplete,
  deleteMilestone
} from '../controllers/milestoneController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateMilestone, validateMongoId } from '../middleware/validationMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/upcoming', getUpcomingMilestones);
router.post('/', validateMilestone, createMilestone);
router.get('/goal/:goalId', validateMongoId, getMilestonesByGoal);

router.route('/:id')
  .put(validateMongoId, updateMilestone)
  .delete(validateMongoId, deleteMilestone);

router.patch('/:id/toggle', validateMongoId, toggleMilestoneComplete);

export default router;
