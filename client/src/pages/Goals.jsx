import React, { useState, useEffect } from 'react';
import { Plus, Grid, List, Archive } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, LoadingSpinner } from '../components/ui';
import { GoalCard, GoalForm, GoalFilters } from '../components/goals';
import goalService from '../services/goalService';
import toast from 'react-hot-toast';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    category: 'all',
    priority: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    minProgress: 0,
    includeArchived: false,
  });

  useEffect(() => {
    fetchGoals();
  }, [filters]);

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      const params = {
        ...filters,
        status: filters.status === 'all' ? undefined : filters.status,
        category: filters.category === 'all' ? undefined : filters.category,
        priority: filters.priority === 'all' ? undefined : filters.priority,
      };
      
      const response = await goalService.getGoals(params);
      setGoals(response.data.data.goals);
    } catch (error) {
      toast.error('Failed to load goals');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGoal = async (formData) => {
    try {
      await goalService.createGoal(formData);
      fetchGoals();
      setShowGoalForm(false);
    } catch (error) {
      throw error;
    }
  };

  const handleEditGoal = async (formData) => {
    try {
      await goalService.updateGoal(selectedGoal._id, formData);
      fetchGoals();
      setShowGoalForm(false);
      setSelectedGoal(null);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    
    try {
      await goalService.deleteGoal(goalId);
      toast.success('Goal deleted successfully');
      fetchGoals();
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  };

  const handleArchiveGoal = async (goalId) => {
    try {
      await goalService.archiveGoal(goalId);
      toast.success('Goal archived successfully');
      fetchGoals();
    } catch (error) {
      toast.error('Failed to archive goal');
    }
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      category: 'all',
      priority: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      minProgress: 0,
      includeArchived: false,
    });
  };

  const openEditModal = (goal) => {
    setSelectedGoal(goal);
    setShowGoalForm(true);
  };

  const closeModal = () => {
    setShowGoalForm(false);
    setSelectedGoal(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Goals</h1>
          <p className="text-gray-400">
            {goals.length} {goals.length === 1 ? 'goal' : 'goals'} in total
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 p-1 bg-dark-800 rounded-lg border border-dark-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowGoalForm(true)}
          >
            New Goal
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GoalFilters
          filters={filters}
          onFilterChange={setFilters}
          onClearFilters={handleClearFilters}
          showAdvanced={showAdvancedFilters}
          onToggleAdvanced={() => setShowAdvancedFilters(!showAdvancedFilters)}
        />
      </motion.div>

      {/* Goals Grid/List */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Loading goals..." />
        </div>
      ) : goals.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-4'
          }
        >
          {goals.map((goal, index) => (
            <GoalCard
              key={goal._id}
              goal={goal}
              index={index}
              onEdit={() => openEditModal(goal)}
              onDelete={() => handleDeleteGoal(goal._id)}
              onArchive={() => handleArchiveGoal(goal._id)}
              onUpdate={fetchGoals}
            />
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl border border-white/10 p-12 text-center"
        >
          <Archive className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No goals found</h3>
          <p className="text-gray-400 mb-6">
            {filters.search || filters.status !== 'all' || filters.category !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first goal to get started'}
          </p>
          {!filters.search && filters.status === 'all' && filters.category === 'all' && (
            <Button variant="primary" icon={Plus} onClick={() => setShowGoalForm(true)}>
              Create Your First Goal
            </Button>
          )}
        </motion.div>
      )}

      {/* Goal Form Modal */}
      <GoalForm
        isOpen={showGoalForm}
        onClose={closeModal}
        onSubmit={selectedGoal ? handleEditGoal : handleCreateGoal}
        goal={selectedGoal}
      />
    </div>
  );
};

export default Goals;
