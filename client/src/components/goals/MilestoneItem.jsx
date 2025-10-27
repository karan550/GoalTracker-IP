import React, { useState } from 'react';
import { CheckCircle, Circle, Trash2, Calendar, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate } from '../../utils/dateHelpers';
import { Badge } from '../ui';
import toast from 'react-hot-toast';

const MilestoneItem = ({ 
  milestone, 
  onToggle, 
  onDelete,
  isLoading = false 
}) => {
  const [showActions, setShowActions] = useState(false);

  const handleToggle = async () => {
    try {
      await onToggle(milestone._id);
      toast.success(milestone.completed ? 'Milestone marked as incomplete' : 'Milestone completed! 🎉');
    } catch (error) {
      toast.error('Failed to update milestone');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this milestone?')) {
      try {
        await onDelete(milestone._id);
        toast.success('Milestone deleted');
      } catch (error) {
        toast.error('Failed to delete milestone');
      }
    }
  };

  const isOverdue = !milestone.completed && new Date(milestone.dueDate) < new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className={`
        group relative flex items-start gap-3 p-4 rounded-xl 
        bg-dark-800 border transition-all duration-200
        ${milestone.completed 
          ? 'border-green-500/20 bg-green-500/5' 
          : isOverdue 
            ? 'border-red-500/20 bg-red-500/5'
            : 'border-dark-700 hover:border-dark-600'
        }
      `}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`
          flex-shrink-0 mt-0.5 transition-all duration-200
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}
        `}
      >
        {milestone.completed ? (
          <CheckCircle className="w-6 h-6 text-green-500 fill-green-500/10" />
        ) : (
          <Circle className="w-6 h-6 text-gray-400 hover:text-primary-400" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className={`
          text-base font-medium mb-1
          ${milestone.completed ? 'text-gray-500 line-through' : 'text-white'}
        `}>
          {milestone.title}
        </h4>

        {milestone.description && (
          <p className={`
            text-sm mb-2
            ${milestone.completed ? 'text-gray-600' : 'text-gray-400'}
          `}>
            {milestone.description}
          </p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>Due {formatDate(milestone.dueDate)}</span>
          </div>

          {isOverdue && !milestone.completed && (
            <Badge variant="danger" size="sm">
              Overdue
            </Badge>
          )}

          {milestone.completed && milestone.completedAt && (
            <Badge variant="success" size="sm">
              Completed {formatDate(milestone.completedAt)}
            </Badge>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 relative">
        <button
          onClick={() => setShowActions(!showActions)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700 transition-colors opacity-0 group-hover:opacity-100"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {showActions && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowActions(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="absolute right-0 top-8 z-20 w-40 glass border border-white/10 rounded-lg shadow-xl overflow-hidden"
            >
              <button
                onClick={handleDelete}
                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default MilestoneItem;
