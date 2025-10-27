import Goal from '../models/Goal.js';
import Milestone from '../models/Milestone.js';
import Progress from '../models/Progress.js';

// @desc    Get overall statistics
// @route   GET /api/analytics/overview
// @access  Private
export const getOverallStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get all goals
    const allGoals = await Goal.find({ userId });
    const activeGoals = allGoals.filter(g => g.status === 'in-progress' || g.status === 'not-started');
    const completedGoals = allGoals.filter(g => g.status === 'completed');

    // Get all milestones
    const goalIds = allGoals.map(g => g._id);
    const allMilestones = await Milestone.find({ goalId: { $in: goalIds } });
    const completedMilestones = allMilestones.filter(m => m.completed);

    // Calculate completion rate
    const completionRate = allGoals.length > 0
      ? Math.round((completedGoals.length / allGoals.length) * 100)
      : 0;

    // Calculate average progress for active goals
    const avgProgress = activeGoals.length > 0
      ? Math.round(activeGoals.reduce((sum, g) => sum + g.progress, 0) / activeGoals.length)
      : 0;

    // Calculate streak (consecutive days with milestone completions)
    const streak = await calculateStreak(userId);

    // Get this month's completed goals
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const goalsCompletedThisMonth = completedGoals.filter(
      g => g.completedAt && g.completedAt >= monthStart
    ).length;

    // Get upcoming milestones (next 7 days)
    const upcomingDate = new Date();
    upcomingDate.setDate(upcomingDate.getDate() + 7);
    const upcomingMilestones = allMilestones.filter(
      m => !m.completed && m.dueDate >= now && m.dueDate <= upcomingDate
    ).length;

    res.json({
      success: true,
      data: {
        totalGoals: allGoals.length,
        activeGoals: activeGoals.length,
        inProgressGoals: activeGoals.length,
        completedGoals: completedGoals.length,
        totalMilestones: allMilestones.length,
        completedMilestones: completedMilestones.length,
        completionRate,
        avgProgress,
        currentStreak: streak,
        goalsCompletedThisMonth,
        upcomingMilestones
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly statistics
// @route   GET /api/analytics/monthly
// @access  Private
export const getMonthlyStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { months = 6 } = req.query;

    const monthsData = [];
    const now = new Date();

    for (let i = parseInt(months) - 1; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const goalsCompleted = await Goal.countDocuments({
        userId,
        status: 'completed',
        completedAt: {
          $gte: monthDate,
          $lt: nextMonth
        }
      });

      const goalsCreated = await Goal.countDocuments({
        userId,
        createdAt: {
          $gte: monthDate,
          $lt: nextMonth
        }
      });

      monthsData.push({
        month: monthDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
        goalsCompleted,
        goalsCreated
      });
    }

    res.json({
      success: true,
      data: { monthlyStats: monthsData }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category breakdown
// @route   GET /api/analytics/categories
// @access  Private
export const getCategoryBreakdown = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const categories = await Goal.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$category',
          total: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          avgProgress: { $avg: '$progress' }
        }
      },
      {
        $project: {
          category: '$_id',
          total: 1,
          active: 1,
          completed: 1,
          avgProgress: { $round: ['$avgProgress', 0] }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json({
      success: true,
      data: { categoryBreakdown: categories }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get completion trends
// @route   GET /api/analytics/trends
// @access  Private
export const getCompletionTrends = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { period = 'week' } = req.query;

    let groupBy, dateRange;
    const now = new Date();

    if (period === 'week') {
      // Last 4 weeks
      dateRange = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
      groupBy = {
        $dateToString: { format: '%Y-W%U', date: '$completedAt' }
      };
    } else if (period === 'month') {
      // Last 12 months
      dateRange = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      groupBy = {
        $dateToString: { format: '%Y-%m', date: '$completedAt' }
      };
    } else {
      // Last 7 days (default)
      dateRange = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      groupBy = {
        $dateToString: { format: '%Y-%m-%d', date: '$completedAt' }
      };
    }

    // Goals completed over time
    const goalsData = await Goal.aggregate([
      {
        $match: {
          userId,
          status: 'completed',
          completedAt: { $gte: dateRange }
        }
      },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Milestones completed over time
    const userGoals = await Goal.find({ userId });
    const goalIds = userGoals.map(g => g._id);

    const milestonesData = await Milestone.aggregate([
      {
        $match: {
          goalId: { $in: goalIds },
          completed: true,
          completedAt: { $gte: dateRange }
        }
      },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        trends: {
          goals: goalsData,
          milestones: milestonesData
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to calculate streak
const calculateStreak = async (userId) => {
  try {
    const userGoals = await Goal.find({ userId });
    const goalIds = userGoals.map(g => g._id);

    // Get all completed milestones sorted by completion date
    const completedMilestones = await Milestone.find({
      goalId: { $in: goalIds },
      completed: true,
      completedAt: { $exists: true }
    }).sort({ completedAt: -1 });

    if (completedMilestones.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if there's activity today or yesterday
    const lastActivity = new Date(completedMilestones[0].completedAt);
    lastActivity.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));

    // If last activity was more than 1 day ago, streak is broken
    if (daysDiff > 1) return 0;

    // Count consecutive days
    const dateSet = new Set();
    completedMilestones.forEach(m => {
      const date = new Date(m.completedAt);
      date.setHours(0, 0, 0, 0);
      dateSet.add(date.getTime());
    });

    const sortedDates = Array.from(dateSet).sort((a, b) => b - a);
    
    let currentDate = sortedDates[0];
    streak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const diff = (currentDate - sortedDates[i]) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        streak++;
        currentDate = sortedDates[i];
      } else {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('Error calculating streak:', error);
    return 0;
  }
};
