import React from 'react';
import { Calendar, Target, TrendingUp, MoreVertical, Archive, CheckCircle, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { formatDate, getRelativeTime } from '../../utils/dateHelpers';
import { GOAL_CATEGORIES, GOAL_PRIORITIES } from '../../utils/constants';
import { Badge, Card, Button } from '../ui';
import ProgressRing from './ProgressRing';
import toast from 'react-hot-toast';
import goalService from '../../services/goalService';

const GoalCard = ({ goal, onEdit, onDelete, onArchive, onUpdate, index = 0 }) => {
  const navigate = useNavigate();

  const category = GOAL_CATEGORIES.find(cat => cat.value === goal.category);
  const priority = GOAL_PRIORITIES.find(p => p.value === goal.priority);

  const isOverdue = goal.status !== 'completed' && new Date(goal.targetDate) < new Date();
  const isNearDeadline = !isOverdue && new Date(goal.targetDate) - new Date() < 7 * 24 * 60 * 60 * 1000;

  const getProgressColor = () => {
    if (goal.status === 'completed') return 'success';
    if (isOverdue) return 'danger';
    if (goal.progress >= 75) return 'success';
    if (goal.progress >= 50) return 'primary';
    if (goal.progress >= 25) return 'warning';
    return 'danger';
  };

  const handleCardClick = (e) => {
    // Don't navigate if clicking on action buttons
    if (e.target.closest('button')) return;
    navigate(`/goals/${goal._id}`);
  };

  const handleStatusToggle = async (e) => {
    e.stopPropagation();
    try {
      const newStatus = goal.status === 'completed' ? 'in-progress' : 'completed';
      await goalService.updateGoal(goal._id, { status: newStatus });
      toast.success(`Goal marked as ${newStatus === 'completed' ? 'complete' : 'in progress'}!`);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Failed to update goal status');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        variant="glass"
        hover
        className="cursor-pointer group"
        onClick={handleCardClick}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {category && (
                <div 
                  className="p-1.5 rounded-lg flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <span className="text-base">{category.icon}</span>
                </div>
              )}
              <Badge variant={priority?.color || 'default'} size="sm">
                {priority?.label}
              </Badge>
              {goal.isArchived && (
                <Badge variant="default" size="sm">
                  <Archive className="w-3 h-3 mr-1" />
                  Archived
                </Badge>
              )}
            </div>

            <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2">
              {goal.title}
            </h3>

            {goal.description && (
              <p className="text-sm text-gray-400 line-clamp-2">
                {goal.description}
              </p>
            )}
          </div>

          {/* Progress Ring */}
          <ProgressRing
            progress={goal.progress}
            size={80}
            strokeWidth={6}
            color={getProgressColor()}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Target className="w-4 h-4 text-primary-400" />
            <span className="text-gray-400">
              {goal.milestones?.length || 0} milestones
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-gray-400">
              {goal.completedMilestones || 0} completed
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className={`text-sm ${
              isOverdue 
                ? 'text-red-400' 
                : isNearDeadline 
                  ? 'text-yellow-400' 
                  : 'text-gray-400'
            }`}>
              {isOverdue ? 'Overdue' : getRelativeTime(goal.targetDate)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Badge 
              variant={
                goal.status === 'completed' ? 'success' :
                goal.status === 'in-progress' ? 'primary' :
                'default'
              }
              size="sm"
            >
              {goal.status.replace('-', ' ')}
            </Badge>

            {/* Quick Status Toggle Button */}
            {goal.status !== 'archived' && (
              <button
                onClick={handleStatusToggle}
                className="p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                title={goal.status === 'completed' ? 'Mark as in progress' : 'Mark as complete'}
                style={{
                  color: goal.status === 'completed' ? '#f59e0b' : '#10b981',
                  backgroundColor: goal.status === 'completed' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)'
                }}
              >
                {goal.status === 'completed' ? (
                  <Play className="w-4 h-4" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Action Menu */}
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700 transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default GoalCard;
