import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, Textarea, Modal } from '../ui';
import { validateMilestoneTitle, validateDueDate } from '../../utils/validators';

const MilestoneForm = ({ isOpen, onClose, onSubmit, goalId, goalTargetDate, milestone = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (milestone) {
      setFormData({
        title: milestone.title || '',
        description: milestone.description || '',
        dueDate: milestone.dueDate ? new Date(milestone.dueDate).toISOString().split('T')[0] : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        dueDate: '',
      });
    }
    setErrors({});
  }, [milestone, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const titleError = validateMilestoneTitle(formData.title);
    if (titleError) newErrors.title = titleError;

    const dueDateError = validateDueDate(formData.dueDate, goalTargetDate);
    if (dueDateError) newErrors.dueDate = dueDateError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        goalId: goalId,
      });
      onClose();
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || 'Failed to save milestone'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={milestone ? 'Edit Milestone' : 'Add Milestone'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.submit && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {errors.submit}
          </div>
        )}

        <Input
          label="Milestone Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          placeholder="e.g., Complete first draft"
          required
          autoFocus
        />

        <Textarea
          label="Description (Optional)"
          name="description"
          value={formData.description}
          onChange={handleChange}
          error={errors.description}
          placeholder="Add details about this milestone..."
          rows={3}
          maxLength={1000}
          showCount
        />

        <Input
          label="Due Date"
          name="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={handleChange}
          error={errors.dueDate}
          required
        />

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            fullWidth
          >
            {milestone ? 'Update' : 'Create'} Milestone
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MilestoneForm;
