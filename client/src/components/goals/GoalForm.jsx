import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal, Button, Input, Textarea, Select } from '../ui';
import { GOAL_CATEGORIES, GOAL_PRIORITIES, GOAL_STATUSES } from '../../utils/constants';
import { validateGoalTitle, validateTargetDate } from '../../utils/validators';
import { formatDateForInput } from '../../utils/dateHelpers';
import toast from 'react-hot-toast';

const GoalForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  goal = null,
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    status: 'not-started',
    targetDate: '',
    milestones: [],
  });

  const [errors, setErrors] = useState({});
  const [newMilestone, setNewMilestone] = useState({ title: '', dueDate: '' });

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || '',
        description: goal.description || '',
        category: goal.category || '',
        priority: goal.priority || 'medium',
        status: goal.status || 'not-started',
        targetDate: formatDateForInput(goal.targetDate) || '',
        milestones: goal.milestones || [],
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        status: 'not-started',
        targetDate: '',
        milestones: [],
      });
    }
    setErrors({});
  }, [goal, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddMilestone = () => {
    if (!newMilestone.title.trim()) {
      toast.error('Please enter a milestone title');
      return;
    }
    if (!newMilestone.dueDate) {
      toast.error('Please select a due date for the milestone');
      return;
    }

    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, { ...newMilestone, completed: false }],
    }));
    setNewMilestone({ title: '', dueDate: '' });
    toast.success('Milestone added');
  };

  const handleRemoveMilestone = (index) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    const titleError = validateGoalTitle(formData.title);
    if (titleError) newErrors.title = titleError;

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    const dateError = validateTargetDate(formData.targetDate);
    if (dateError) newErrors.targetDate = dateError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
      onClose();
      toast.success(goal ? 'Goal updated successfully' : 'Goal created successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save goal');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={goal ? 'Edit Goal' : 'Create New Goal'}
      size="lg"
      closeOnOverlayClick={!isLoading}
      showCloseButton={!isLoading}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <Input
          label="Goal Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          placeholder="e.g., Learn React and Build 3 Projects"
          required
          autoFocus
        />

        {/* Description */}
        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your goal in detail..."
          rows={3}
          maxLength={500}
          showCount
        />

        {/* Category and Priority */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            error={errors.category}
            options={GOAL_CATEGORIES.map(cat => ({
              value: cat.value,
              label: cat.label,
            }))}
            placeholder="Select category"
            required
          />

          <Select
            label="Priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            options={GOAL_PRIORITIES.map(p => ({
              value: p.value,
              label: p.label,
            }))}
            required
          />
        </div>

        {/* Status and Target Date */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={GOAL_STATUSES.map(s => ({
              value: s.value,
              label: s.label,
            }))}
            required
          />

          <Input
            label="Target Date"
            name="targetDate"
            type="date"
            value={formData.targetDate}
            onChange={handleChange}
            error={errors.targetDate}
            required
          />
        </div>

        {/* Milestones */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-3">
            Milestones (Optional)
          </label>

          {/* Existing Milestones */}
          <AnimatePresence>
            {formData.milestones.length > 0 && (
              <div className="space-y-2 mb-3">
                {formData.milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-2 p-3 bg-dark-700 rounded-lg border border-dark-600"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">
                        {milestone.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        Due: {new Date(milestone.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(index)}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Add Milestone */}
          <div className="space-y-2">
            <Input
              placeholder="Milestone title"
              value={newMilestone.title}
              onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
            />
            <div className="flex gap-2">
              <Input
                type="date"
                value={newMilestone.dueDate}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, dueDate: e.target.value }))}
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddMilestone}
                icon={Plus}
              >
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
          >
            {goal ? 'Update Goal' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GoalForm;
