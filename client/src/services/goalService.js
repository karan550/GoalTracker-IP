import api from './api';

// Create goal
export const createGoal = async (data) => {
  const response = await api.post('/goals', data);
  return response;
};

// Get all goals
export const getGoals = async (params = {}) => {
  const response = await api.get('/goals', { params });
  return response;
};

// Get goal by ID
export const getGoal = async (id) => {
  const response = await api.get(`/goals/${id}`);
  console.log('Goal fetched:', response.data.data.goal);
  console.log('Progress:', response.data.data.goal.progress);
  console.log('Milestones:', response.data.data.goal.milestones);
  return response;
};

// Update goal
export const updateGoal = async (id, data) => {
  const response = await api.put(`/goals/${id}`, data);
  return response;
};

// Delete goal
export const deleteGoal = async (id) => {
  const response = await api.delete(`/goals/${id}`);
  return response;
};

// Archive goal
export const archiveGoal = async (id) => {
  const response = await api.patch(`/goals/${id}/archive`);
  return response;
};

// Get goal stats
export const getGoalStats = async () => {
  const response = await api.get('/goals/stats');
  return response;
};

// Default export
export default {
  createGoal,
  getGoals,
  getGoal,
  updateGoal,
  deleteGoal,
  archiveGoal,
  getGoalStats,
};
