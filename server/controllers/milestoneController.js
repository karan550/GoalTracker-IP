import Milestone from '../models/Milestone.js';
import Goal from '../models/Goal.js';

// @desc    Create a new milestone
// @route   POST /api/milestones
// @access  Private
export const createMilestone = async (req, res, next) => {
  try {
    const { goalId, title, description, dueDate, order } = req.body;

    // Verify goal exists and belongs to user
    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add milestone to this goal'
      });
    }

    const milestone = await Milestone.create({
      goalId,
      title,
      description,
      dueDate,
      order: order || 0
    });

    // Update goal progress after creating milestone
    await goal.updateProgress();
    await goal.save();

    res.status(201).json({
      success: true,
      message: 'Milestone created successfully',
      data: { milestone }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get milestones by goal ID
// @route   GET /api/milestones/goal/:goalId
// @access  Private
export const getMilestonesByGoal = async (req, res, next) => {
  try {
    const { goalId } = req.params;

    // Verify goal belongs to user
    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view milestones for this goal'
      });
    }

    const milestones = await Milestone.find({ goalId }).sort({ order: 1, dueDate: 1 });

    res.json({
      success: true,
      count: milestones.length,
      data: { milestones }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get upcoming milestones across all goals
// @route   GET /api/milestones/upcoming
// @access  Private
export const getUpcomingMilestones = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;

    // Get user's goals
    const userGoals = await Goal.find({ userId: req.user._id, status: 'active' });
    const goalIds = userGoals.map(g => g._id);

    // Calculate date range
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + parseInt(days));

    // Find upcoming incomplete milestones
    const milestones = await Milestone.find({
      goalId: { $in: goalIds },
      completed: false,
      dueDate: {
        $gte: today,
        $lte: futureDate
      }
    })
      .populate('goalId', 'title category')
      .sort({ dueDate: 1 });

    res.json({
      success: true,
      count: milestones.length,
      data: { milestones }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update milestone
// @route   PUT /api/milestones/:id
// @access  Private
export const updateMilestone = async (req, res, next) => {
  try {
    let milestone = await Milestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
    }

    // Verify goal belongs to user
    const goal = await Goal.findById(milestone.goalId);
    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this milestone'
      });
    }

    const { title, description, dueDate, order } = req.body;

    if (title) milestone.title = title;
    if (description !== undefined) milestone.description = description;
    if (dueDate) milestone.dueDate = dueDate;
    if (order !== undefined) milestone.order = order;

    await milestone.save();

    res.json({
      success: true,
      message: 'Milestone updated successfully',
      data: { milestone }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle milestone completion
// @route   PATCH /api/milestones/:id/toggle
// @access  Private
export const toggleMilestoneComplete = async (req, res, next) => {
  try {
    const milestone = await Milestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
    }

    // Verify goal belongs to user
    const goal = await Goal.findById(milestone.goalId);
    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this milestone'
      });
    }

    milestone.completed = !milestone.completed;
    milestone.completedAt = milestone.completed ? new Date() : null;
    
    await milestone.save();

    // Update goal progress after toggling milestone
    await goal.updateProgress();
    await goal.save();

    res.json({
      success: true,
      message: `Milestone marked as ${milestone.completed ? 'complete' : 'incomplete'}`,
      data: { milestone }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete milestone
// @route   DELETE /api/milestones/:id
// @access  Private
export const deleteMilestone = async (req, res, next) => {
  try {
    const milestone = await Milestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
    }

    // Verify goal belongs to user
    const goal = await Goal.findById(milestone.goalId);
    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this milestone'
      });
    }

    await Milestone.findByIdAndDelete(req.params.id);

    // Update goal progress after deleting milestone
    await goal.updateProgress();
    await goal.save();

    res.json({
      success: true,
      message: 'Milestone deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
