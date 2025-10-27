import { EMAIL_PATTERN, PASSWORD_MIN_LENGTH } from './constants';

// Email validation
export const validateEmail = (email) => {
  if (!email) {
    return 'Email is required';
  }
  if (!EMAIL_PATTERN.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

// Password validation
export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  }
  return null;
};

// Name validation
export const validateName = (name) => {
  if (!name) {
    return 'Name is required';
  }
  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters';
  }
  if (name.length > 50) {
    return 'Name must be less than 50 characters';
  }
  return null;
};

// Goal title validation
export const validateGoalTitle = (title) => {
  if (!title) {
    return 'Goal title is required';
  }
  if (title.trim().length < 3) {
    return 'Goal title must be at least 3 characters';
  }
  if (title.length > 200) {
    return 'Goal title must be less than 200 characters';
  }
  return null;
};

// Target date validation
export const validateTargetDate = (date) => {
  if (!date) {
    return 'Target date is required';
  }
  const targetDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (targetDate < today) {
    return 'Target date cannot be in the past';
  }
  return null;
};

// Milestone title validation
export const validateMilestoneTitle = (title) => {
  if (!title) {
    return 'Milestone title is required';
  }
  if (title.trim().length < 2) {
    return 'Milestone title must be at least 2 characters';
  }
  if (title.length > 200) {
    return 'Milestone title must be less than 200 characters';
  }
  return null;
};

// Due date validation
export const validateDueDate = (date, goalTargetDate) => {
  if (!date) {
    return 'Due date is required';
  }
  
  const dueDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (dueDate < today) {
    return 'Due date cannot be in the past';
  }
  
  if (goalTargetDate) {
    const targetDate = new Date(goalTargetDate);
    if (dueDate > targetDate) {
      return 'Due date cannot be after goal target date';
    }
  }
  
  return null;
};
