import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Archive,
  Calendar,
  Target,
  Plus,
  TrendingUp,
  CheckCircle,
  Play
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Card, Badge, LoadingSpinner, ConfirmDialog } from '../components/ui';
import { ProgressRing, MilestoneItem, MilestoneForm, GoalForm } from '../components/goals';
import goalService from '../services/goalService';
import milestoneService from '../services/milestoneService';
import { formatDate, getRelativeTime } from '../utils/dateHelpers';
import { GOAL_CATEGORIES, GOAL_PRIORITIES } from '../utils/constants';
import toast from 'react-hot-toast';

const GoalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);

  useEffect(() => {
    fetchGoal();
  }, [id]);

  const fetchGoal = async () => {
    try {
      setIsLoading(true);
      const response = await goalService.getGoal(id);
      setGoal(response.data.data.goal);
    } catch (error) {
      toast.error('Failed to load goal');
      navigate('/goals');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateGoal = async (formData) => {
    try {
      await goalService.updateGoal(id, formData);
      toast.success('Goal updated successfully');
      fetchGoal();
      setShowEditModal(false);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteGoal = async () => {
    try {
      await goalService.deleteGoal(id);
      toast.success('Goal deleted successfully');
      navigate('/goals');
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  };

  const handleStatusToggle = async () => {
    try {
      const newStatus = goal.status === 'completed' ? 'in-progress' : 'completed';
      await goalService.updateGoal(id, { status: newStatus });
      toast.success(`Goal marked as ${newStatus === 'completed' ? 'complete' : 'in progress'}!`);
      fetchGoal();
    } catch (error) {
      toast.error('Failed to update goal status');
    }
  };

  const handleArchiveGoal = async () => {
    try {
      await goalService.archiveGoal(id);
      toast.success('Goal archived successfully');
      navigate('/goals');
    } catch (error) {
      toast.error('Failed to archive goal');
    }
  };

  const handleToggleMilestone = async (milestoneId) => {
    try {
      await milestoneService.toggleMilestone(milestoneId);
      toast.success('Milestone updated');
      fetchGoal(); // Refresh to get updated progress
    } catch (error) {
      toast.error('Failed to update milestone');
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    try {
      await milestoneService.deleteMilestone(milestoneId);
      toast.success('Milestone deleted');
      fetchGoal(); // Refresh to get updated progress
    } catch (error) {
      toast.error('Failed to delete milestone');
    }
  };

  const handleCreateMilestone = async (formData) => {
    try {
      await milestoneService.createMilestone(formData);
      toast.success('Milestone created successfully');
      fetchGoal(); // Refresh to get new milestone and updated progress
      setShowMilestoneForm(false);
    } catch (error) {
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading goal..." />
      </div>
    );
  }

  if (!goal) return null;

  const category = GOAL_CATEGORIES.find(cat => cat.value === goal.category);
  const priority = GOAL_PRIORITIES.find(p => p.value === goal.priority);
  const isOverdue = goal.status !== 'completed' && new Date(goal.targetDate) < new Date();

  const getProgressColor = () => {
    if (goal.status === 'completed') return 'success';
    if (isOverdue) return 'danger';
    if (goal.progress >= 75) return 'success';
    if (goal.progress >= 50) return 'primary';
    if (goal.progress >= 25) return 'warning';
    return 'danger';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          variant="ghost"
          icon={ArrowLeft}
          onClick={() => navigate('/goals')}
          className="mb-4"
        >
          Back to Goals
        </Button>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {category && (
                <div 
                  className="p-2 rounded-lg flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <span>{category.icon}</span>
                </div>
              )}
              <Badge variant={priority?.color || 'default'}>
                {priority?.label}
              </Badge>
              <Badge 
                variant={
                  goal.status === 'completed' ? 'success' :
                  goal.status === 'in-progress' ? 'primary' :
                  'default'
                }
              >
                {goal.status.replace('-', ' ')}
              </Badge>
              {goal.isArchived && (
                <Badge variant="default">
                  <Archive className="w-3 h-3 mr-1" />
                  Archived
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold text-white mb-3">{goal.title}</h1>
            {goal.description && (
              <p className="text-gray-400 text-lg">{goal.description}</p>
            )}
          </div>

          <div className="flex flex-col items-center gap-4">
            <ProgressRing
              progress={goal.progress}
              size={140}
              strokeWidth={10}
              color={getProgressColor()}
            />
            
            <div className="flex flex-col items-center gap-2 w-full">
              {/* Status Toggle Button */}
              {goal.status !== 'archived' && (
                <Button 
                  variant={goal.status === 'completed' ? 'warning' : 'success'}
                  icon={goal.status === 'completed' ? Play : CheckCircle}
                  onClick={handleStatusToggle}
                  fullWidth
                >
                  {goal.status === 'completed' ? 'Mark In Progress' : 'Mark Complete'}
                </Button>
              )}
              
              <div className="flex items-center gap-2 w-full">
                <Button variant="primary" icon={Edit} onClick={() => setShowEditModal(true)} fullWidth>
                  Edit
                </Button>
                <Button variant="danger" icon={Trash2} onClick={() => setShowDeleteDialog(true)} fullWidth>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <Card variant="glass">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary-500/10">
              <Target className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Milestones</p>
              <p className="text-2xl font-bold text-white">{goal.milestones?.length || 0}</p>
            </div>
          </div>
        </Card>

        <Card variant="glass">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-green-500/10">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-white">{goal.completedMilestones || 0}</p>
            </div>
          </div>
        </Card>

        <Card variant="glass">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${isOverdue ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
              <Calendar className={`w-6 h-6 ${isOverdue ? 'text-red-400' : 'text-blue-400'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Target Date</p>
              <p className={`text-lg font-bold ${isOverdue ? 'text-red-400' : 'text-white'}`}>
                {getRelativeTime(goal.targetDate)}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Milestones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card variant="glass">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Milestones</h2>
            <Button 
              variant="primary" 
              size="sm" 
              icon={Plus}
              onClick={() => setShowMilestoneForm(true)}
            >
              Add Milestone
            </Button>
          </div>

          {goal.milestones && goal.milestones.length > 0 ? (
            <div className="space-y-3">
              {goal.milestones.map((milestone) => (
                <MilestoneItem
                  key={milestone._id}
                  milestone={milestone}
                  onToggle={handleToggleMilestone}
                  onDelete={handleDeleteMilestone}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No milestones yet</p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Modals */}
      <GoalForm
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdateGoal}
        goal={goal}
      />

      <MilestoneForm
        isOpen={showMilestoneForm}
        onClose={() => setShowMilestoneForm(false)}
        onSubmit={handleCreateMilestone}
        goalId={id}
        goalTargetDate={goal?.targetDate}
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteGoal}
        title="Delete Goal"
        message="Are you sure you want to delete this goal? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default GoalDetail;
