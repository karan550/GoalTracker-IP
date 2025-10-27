import api from './api';
import { setToken, setRefreshToken, setUser, clearAuth } from '../utils/localStorage';

// Register
export const register = async (data) => {
  const response = await api.post('/auth/register', data);
  const { user, accessToken, refreshToken } = response.data.data;
  
  setToken(accessToken);
  setRefreshToken(refreshToken);
  setUser(user);
  
  return response.data;
};

// Login
export const login = async (data) => {
  const response = await api.post('/auth/login', data);
  const { user, accessToken, refreshToken } = response.data.data;
  
  setToken(accessToken);
  setRefreshToken(refreshToken);
  setUser(user);
  
  return response.data;
};

// Logout
export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } finally {
    clearAuth();
  }
};

// Get profile
export const getProfile = async () => {
  const response = await api.get('/auth/profile');
  setUser(response.data.data.user);
  return response.data;
};

// Update profile
export const updateProfile = async (data) => {
  const response = await api.put('/auth/profile', data);
  setUser(response.data.data.user);
  return response.data;
};

// Forgot password
export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

// Reset password
export const resetPassword = async (token, password) => {
  const response = await api.post(`/auth/reset-password/${token}`, { password });
  return response.data;
};

// Verify email
export const verifyEmail = async (token) => {
  const response = await api.get(`/auth/verify-email/${token}`);
  return response.data;
};

// Default export
export default {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  verifyEmail,
};
