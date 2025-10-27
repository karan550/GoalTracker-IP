import api from './api';

// Get analytics overview
export const getOverview = async () => {
  const response = await api.get('/analytics/overview');
  return response;
};

// Get monthly progress
export const getMonthlyProgress = async (months = 6) => {
  const response = await api.get('/analytics/monthly', { params: { months } });
  return response;
};

// Get category breakdown
export const getCategoryBreakdown = async () => {
  const response = await api.get('/analytics/categories');
  return response;
};

// Get progress trends
export const getProgressTrend = async (months = 6) => {
  const response = await api.get('/analytics/trends', { params: { months } });
  return response;
};

// Default export
export default {
  getOverview,
  getMonthlyProgress,
  getCategoryBreakdown,
  getProgressTrend,
};
