import cron from 'node-cron';
import User from '../models/User.js';
import Goal from '../models/Goal.js';
import Milestone from '../models/Milestone.js';
import { sendMilestoneReminder, sendWeeklyDigest } from './emailService.js';

// Send daily milestone reminders at 9:00 AM
export const setupDailyReminderCron = () => {
  // Run every day at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    try {
      console.log('Running daily milestone reminder cron job...');

      const users = await User.find({ 'emailPreferences.milestoneReminders': true });

      for (const user of users) {
        // Get user's active goals
        const userGoals = await Goal.find({ userId: user._id, status: 'active' });
        const goalIds = userGoals.map(g => g._id);

        // Find milestones due in the next 3 days
        const today = new Date();
        const threeDaysLater = new Date();
        threeDaysLater.setDate(today.getDate() + 3);

        const upcomingMilestones = await Milestone.find({
          goalId: { $in: goalIds },
          completed: false,
          dueDate: {
            $gte: today,
            $lte: threeDaysLater
          }
        }).populate('goalId', 'title');

        if (upcomingMilestones.length > 0) {
          // Format milestones with goal title
          const formattedMilestones = upcomingMilestones.map(m => ({
            title: m.title,
            dueDate: m.dueDate,
            goalTitle: m.goalId.title
          }));

          await sendMilestoneReminder(user, formattedMilestones);
        }
      }

      console.log('Daily milestone reminder cron job completed');
    } catch (error) {
      console.error('Error in daily reminder cron job:', error);
    }
  });

  console.log('Daily milestone reminder cron job scheduled (9:00 AM daily)');
};

// Send weekly digest every Monday at 8:00 AM
export const setupWeeklyDigestCron = () => {
  // Run every Monday at 8:00 AM
  cron.schedule('0 8 * * 1', async () => {
    try {
      console.log('Running weekly digest cron job...');

      const users = await User.find({ 'emailPreferences.weeklyDigest': true });

      for (const user of users) {
        // Calculate stats for the past week
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const userGoals = await Goal.find({ userId: user._id });
        const goalIds = userGoals.map(g => g._id);

        // Count milestones completed this week
        const milestonesCompleted = await Milestone.countDocuments({
          goalId: { $in: goalIds },
          completed: true,
          completedAt: { $gte: weekAgo }
        });

        // Count active goals
        const activeGoals = userGoals.filter(g => g.status === 'active').length;

        // Calculate average progress
        const activeGoalsList = userGoals.filter(g => g.status === 'active');
        const totalProgress = activeGoalsList.reduce((sum, g) => sum + g.progress, 0);
        const avgProgress = activeGoalsList.length > 0
          ? Math.round(totalProgress / activeGoalsList.length)
          : 0;

        const stats = {
          milestonesCompleted,
          activeGoals,
          totalProgress: avgProgress
        };

        await sendWeeklyDigest(user, stats);
      }

      console.log('Weekly digest cron job completed');
    } catch (error) {
      console.error('Error in weekly digest cron job:', error);
    }
  });

  console.log('Weekly digest cron job scheduled (Monday 8:00 AM)');
};

// Cleanup expired tokens every day at midnight
export const setupTokenCleanupCron = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Running token cleanup cron job...');

      // Remove expired reset password tokens
      const result = await User.updateMany(
        { resetPasswordExpires: { $lt: new Date() } },
        {
          $unset: {
            resetPasswordToken: '',
            resetPasswordExpires: ''
          }
        }
      );

      console.log(`Token cleanup completed. Removed ${result.modifiedCount} expired tokens`);
    } catch (error) {
      console.error('Error in token cleanup cron job:', error);
    }
  });

  console.log('Token cleanup cron job scheduled (midnight daily)');
};

// Initialize all cron jobs
export const initializeCronJobs = () => {
  setupDailyReminderCron();
  setupWeeklyDigestCron();
  setupTokenCleanupCron();
  console.log('All cron jobs initialized successfully');
};
