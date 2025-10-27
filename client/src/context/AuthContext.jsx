import { createContext, useContext, useState, useEffect } from 'react';
import { getUser, getToken } from '../utils/localStorage';
import * as authService from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = () => {
      const token = getToken();
      const storedUser = getUser();
      
      if (token && storedUser) {
        setUser(storedUser);
        setIsAuthenticated(true);
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Register
  const register = async (name, email, password) => {
    try {
      const response = await authService.register({ name, email, password });
      setUser(response.data.user);
      setIsAuthenticated(true);
      toast.success('Registration successful!');
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      setUser(response.data.user);
      setIsAuthenticated(true);
      toast.success('Welcome back!');
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    } catch (error) {
      // Still clear local state even if API call fails
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Update profile
  const updateProfile = async (data) => {
    try {
      const response = await authService.updateProfile(data);
      setUser(response.data.user);
      toast.success('Profile updated successfully');
      return response;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    register,
    login,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
