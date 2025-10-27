import Goal from '../models/Goal.js';
import Milestone from '../models/Milestone.js';

// @desc    Create a new goal
// @route   POST /api/goals
// @access  Private
export const createGoal = async (req, res, next) => {
  try {
    const { title, description, category, priority, targetDate } = req.body;

    const goal = await Goal.create({
      userId: req.user._id,
      title,
      description,
      category,
      priority,
      targetDate
    });

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      data: { goal }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all user goals
// @route   GET /api/goals
// @access  Private
export const getGoals = async (req, res, next) => {
  try {
    const { status, category, search, sort } = req.query;

    // Build filter
    const filter = { userId: req.user._id };
    
    if (status) {
      filter.status = status;
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    let sortOption = {};
    switch (sort) {
      case 'recent':
        sortOption = { createdAt: -1 };
        break;
      case 'dueDate':
        sortOption = { targetDate: 1 };
        break;
      case 'priority':
        sortOption = { priority: -1 };
        break;
      case 'progress':
        sortOption = { progress: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const goals = await Goal.find(filter)
      .sort(sortOption);

    // Fetch milestones for each goal and add counts
    const goalsWithMilestones = await Promise.all(
      goals.map(async (goal) => {
        const milestones = await Milestone.find({ goalId: goal._id });
        const completedMilestones = milestones.filter(m => m.completed).length;
        
        return {
          ...goal.toObject(),
          milestones: milestones,
          completedMilestones: completedMilestones
        };
      })
    );

    res.json({
      success: true,
      count: goalsWithMilestones.length,
      data: { goals: goalsWithMilestones }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single goal by ID
// @route   GET /api/goals/:id
// @access  Private
export const getGoalById = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Check ownership
    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this goal'
      });
    }

    // Fetch milestones and add counts
    const milestones = await Milestone.find({ goalId: goal._id }).sort({ order: 1, dueDate: 1 });
    const completedMilestones = milestones.filter(m => m.completed).length;

    const goalWithMilestones = {
      ...goal.toObject(),
      milestones: milestones,
      completedMilestones: completedMilestones
    };

    res.json({
      success: true,
      data: { goal: goalWithMilestones }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
export const updateGoal = async (req, res, next) => {
  try {
    let goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Check ownership
    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this goal'
      });
    }

    const { title, description, category, priority, targetDate, status, progress } = req.body;

    if (title) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (category) goal.category = category;
    if (priority) goal.priority = priority;
    if (targetDate) goal.targetDate = targetDate;
    if (status) {
      goal.status = status;
      if (status === 'completed' && !goal.completedAt) {
        goal.completedAt = new Date();
      } else if (status !== 'completed') {
        goal.completedAt = null;
      }
    }
    // Don't allow manual progress updates - it's calculated from milestones
    // if (progress !== undefined) goal.progress = progress;

    // Recalculate progress from milestones
    await goal.updateProgress();
    await goal.save();

    // Fetch milestones and add counts
    const milestones = await Milestone.find({ goalId: goal._id }).sort({ order: 1, dueDate: 1 });
    const completedMilestones = milestones.filter(m => m.completed).length;

    const goalWithMilestones = {
      ...goal.toObject(),
      milestones: milestones,
      completedMilestones: completedMilestones
    };

    res.json({
      success: true,
      message: 'Goal updated successfully',
      data: { goal: goalWithMilestones }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
export const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Check ownership
    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this goal'
      });
    }

    // Delete associated milestones
    await Milestone.deleteMany({ goalId: goal._id });

    // Delete goal
    await Goal.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Goal and associated milestones deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Archive goal
// @route   PATCH /api/goals/:id/archive
// @access  Private
export const archiveGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Check ownership
    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to archive this goal'
      });
    }

    goal.status = 'archived';
    await goal.save();

    res.json({
      success: true,
      message: 'Goal archived successfully',
      data: { goal }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get goal statistics
// @route   GET /api/goals/stats
// @access  Private
export const getGoalStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get all goals
    const allGoals = await Goal.find({ userId });
    
    // Calculate stats
    const total = allGoals.length;
    const active = allGoals.filter(g => g.status === 'active').length;
    const completed = allGoals.filter(g => g.status === 'completed').length;
    const archived = allGoals.filter(g => g.status === 'archived').length;
    
    // Calculate average progress
    const activeGoals = allGoals.filter(g => g.status === 'active');
    const avgProgress = activeGoals.length > 0
      ? Math.round(activeGoals.reduce((sum, g) => sum + g.progress, 0) / activeGoals.length)
      : 0;

    // Category breakdown
    const categoryBreakdown = allGoals.reduce((acc, goal) => {
      acc[goal.category] = (acc[goal.category] || 0) + 1;
      return acc;
    }, {});

    // Priority breakdown
    const priorityBreakdown = allGoals.reduce((acc, goal) => {
      acc[goal.priority] = (acc[goal.priority] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        stats: {
          total,
          active,
          completed,
          archived,
          avgProgress,
          categoryBreakdown,
          priorityBreakdown
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
