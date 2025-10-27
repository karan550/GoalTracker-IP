import Progress from '../models/Progress.js';
import Goal from '../models/Goal.js';

// @desc    Log weekly progress for a goal
// @route   POST /api/progress
// @access  Private
export const logProgress = async (req, res, next) => {
  try {
    const { goalId, weekStartDate, weekEndDate, notes, progressPercentage, hoursSpent } = req.body;

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
        message: 'Not authorized to log progress for this goal'
      });
    }

    // Check if progress entry already exists for this week
    const existingProgress = await Progress.findOne({
      userId: req.user._id,
      goalId,
      weekStartDate: new Date(weekStartDate)
    });

    if (existingProgress) {
      return res.status(400).json({
        success: false,
        message: 'Progress already logged for this week. Use update instead.'
      });
    }

    const progress = await Progress.create({
      userId: req.user._id,
      goalId,
      weekStartDate,
      weekEndDate,
      notes,
      progressPercentage,
      hoursSpent
    });

    res.status(201).json({
      success: true,
      message: 'Progress logged successfully',
      data: { progress }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get progress history for a goal
// @route   GET /api/progress/goal/:goalId
// @access  Private
export const getProgressHistory = async (req, res, next) => {
  try {
    const { goalId } = req.params;
    const { limit = 10 } = req.query;

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
        message: 'Not authorized to view progress for this goal'
      });
    }

    const progressHistory = await Progress.find({ goalId })
      .sort({ weekStartDate: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: progressHistory.length,
      data: { progressHistory }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current week's progress for all goals
// @route   GET /api/progress/weekly
// @access  Private
export const getWeeklyProgress = async (req, res, next) => {
  try {
    // Calculate current week start and end
    const today = new Date();
    const dayOfWeek = today.getDay();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weeklyProgress = await Progress.find({
      userId: req.user._id,
      weekStartDate: { $gte: weekStart, $lte: weekEnd }
    }).populate('goalId', 'title category');

    res.json({
      success: true,
      count: weeklyProgress.length,
      data: { 
        weeklyProgress,
        weekStart,
        weekEnd
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update progress entry
// @route   PUT /api/progress/:id
// @access  Private
export const updateProgress = async (req, res, next) => {
  try {
    let progress = await Progress.findById(req.params.id);

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress entry not found'
      });
    }

    // Verify ownership
    if (progress.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this progress entry'
      });
    }

    const { notes, progressPercentage, hoursSpent } = req.body;

    if (notes !== undefined) progress.notes = notes;
    if (progressPercentage !== undefined) progress.progressPercentage = progressPercentage;
    if (hoursSpent !== undefined) progress.hoursSpent = hoursSpent;

    await progress.save();

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: { progress }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete progress entry
// @route   DELETE /api/progress/:id
// @access  Private
export const deleteProgress = async (req, res, next) => {
  try {
    const progress = await Progress.findById(req.params.id);

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress entry not found'
      });
    }

    // Verify ownership
    if (progress.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this progress entry'
      });
    }

    await Progress.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Progress entry deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
