import React from 'react';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input, Select, Button, Badge } from '../ui';
import { GOAL_CATEGORIES, GOAL_PRIORITIES, GOAL_STATUSES } from '../../utils/constants';

const GoalFilters = ({ 
  filters, 
  onFilterChange, 
  onClearFilters,
  showAdvanced = false,
  onToggleAdvanced 
}) => {
  const activeFiltersCount = Object.values(filters).filter(v => v && v !== 'all').length;

  const handleChange = (name, value) => {
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <div className="space-y-4">
      {/* Search and Quick Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1">
          <Input
            placeholder="Search goals..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            icon={Search}
          />
        </div>

        {/* Status Filter */}
        <Select
          value={filters.status || 'all'}
          onChange={(e) => handleChange('status', e.target.value)}
          options={[
            { value: 'all', label: 'All Status' },
            ...GOAL_STATUSES.map(s => ({
              value: s.value,
              label: s.label,
            })),
          ]}
          className="w-full sm:w-48"
        />

        {/* Advanced Filters Toggle */}
        <Button
          variant="secondary"
          onClick={onToggleAdvanced}
          icon={SlidersHorizontal}
          className="relative"
        >
          Filters
          {activeFiltersCount > 0 && (
            <Badge 
              variant="primary" 
              size="sm"
              className="absolute -top-2 -right-2 min-w-[20px] h-5"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="glass rounded-xl p-4 border border-white/10 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Advanced Filters
                </h3>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearFilters}
                    icon={X}
                  >
                    Clear All
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Category */}
                <Select
                  label="Category"
                  value={filters.category || 'all'}
                  onChange={(e) => handleChange('category', e.target.value)}
                  options={[
                    { value: 'all', label: 'All Categories' },
                    ...GOAL_CATEGORIES.map(cat => ({
                      value: cat.value,
                      label: cat.label,
                    })),
                  ]}
                />

                {/* Priority */}
                <Select
                  label="Priority"
                  value={filters.priority || 'all'}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  options={[
                    { value: 'all', label: 'All Priorities' },
                    ...GOAL_PRIORITIES.map(p => ({
                      value: p.value,
                      label: p.label,
                    })),
                  ]}
                />

                {/* Sort By */}
                <Select
                  label="Sort By"
                  value={filters.sortBy || 'createdAt'}
                  onChange={(e) => handleChange('sortBy', e.target.value)}
                  options={[
                    { value: 'createdAt', label: 'Date Created' },
                    { value: 'targetDate', label: 'Target Date' },
                    { value: 'progress', label: 'Progress' },
                    { value: 'priority', label: 'Priority' },
                    { value: 'title', label: 'Title' },
                  ]}
                />

                {/* Sort Order */}
                <Select
                  label="Sort Order"
                  value={filters.sortOrder || 'desc'}
                  onChange={(e) => handleChange('sortOrder', e.target.value)}
                  options={[
                    { value: 'asc', label: 'Ascending' },
                    { value: 'desc', label: 'Descending' },
                  ]}
                />

                {/* Progress Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Min Progress
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.minProgress || 0}
                    onChange={(e) => handleChange('minProgress', parseInt(e.target.value))}
                    className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{filters.minProgress || 0}%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Show Archived */}
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.includeArchived || false}
                      onChange={(e) => handleChange('includeArchived', e.target.checked)}
                      className="w-4 h-4 rounded border-dark-600 bg-dark-700 text-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-dark-800"
                    />
                    <span className="text-sm text-gray-200">Show Archived</span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GoalFilters;
