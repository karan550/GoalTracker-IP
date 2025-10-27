import api from './api';

// Create milestone
export const createMilestone = async (data) => {
  console.log('Creating milestone with data:', data);
  const response = await api.post('/milestones', data);
  console.log('Milestone created response:', response.data);
  return response;
};

// Get all milestones
export const getMilestones = async (params = {}) => {
  const response = await api.get('/milestones', { params });
  return response;
};

// Get milestones by goal ID
export const getMilestonesByGoal = async (goalId) => {
  const response = await api.get(`/milestones/goal/${goalId}`);
  return response;
};

// Get upcoming milestones
export const getUpcomingMilestones = async (days = 7) => {
  const response = await api.get('/milestones/upcoming', { params: { days } });
  return response;
};

// Update milestone
export const updateMilestone = async (id, data) => {
  const response = await api.put(`/milestones/${id}`, data);
  return response;
};

// Toggle milestone completion
export const toggleMilestone = async (id) => {
  console.log('Toggling milestone:', id);
  const response = await api.patch(`/milestones/${id}/toggle`);
  console.log('Toggle response:', response.data);
  return response;
};

// Delete milestone
export const deleteMilestone = async (id) => {
  const response = await api.delete(`/milestones/${id}`);
  return response;
};

// Default export
export default {
  createMilestone,
  getMilestones,
  getMilestonesByGoal,
  getUpcomingMilestones,
  updateMilestone,
  toggleMilestone,
  deleteMilestone,
};
