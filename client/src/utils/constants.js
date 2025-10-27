// API Base URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Token keys
export const ACCESS_TOKEN_KEY = 'accessToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';
export const USER_KEY = 'user';

// Goal categories
export const GOAL_CATEGORIES = [
  { value: 'health', label: 'Health & Fitness', color: '#10b981', icon: '💪' },
  { value: 'career', label: 'Career', color: '#3b82f6', icon: '💼' },
  { value: 'education', label: 'Education', color: '#8b5cf6', icon: '📚' },
  { value: 'finance', label: 'Finance', color: '#f59e0b', icon: '💰' },
  { value: 'personal', label: 'Personal Growth', color: '#ec4899', icon: '🌱' },
  { value: 'other', label: 'Other', color: '#6b7280', icon: '📌' }
];

// Goal priorities
export const GOAL_PRIORITIES = [
  { value: 'low', label: 'Low', color: '#6b7280' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#ef4444' }
];

// Goal statuses
export const GOAL_STATUSES = [
  { value: 'active', label: 'Active', color: '#3b82f6' },
  { value: 'completed', label: 'Completed', color: '#10b981' },
  { value: 'archived', label: 'Archived', color: '#6b7280' }
];

// Date formats
export const DATE_FORMAT = 'MMM dd, yyyy';
export const DATE_TIME_FORMAT = 'MMM dd, yyyy HH:mm';
export const SHORT_DATE_FORMAT = 'MMM dd';

// Validation patterns
export const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
export const PASSWORD_MIN_LENGTH = 6;

// Pagination
export const DEFAULT_PAGE_SIZE = 10;

// Chart colors
export const CHART_COLORS = [
  '#8b5cf6',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#06b6d4',
  '#6366f1'
];
