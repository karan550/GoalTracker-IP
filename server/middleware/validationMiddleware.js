import { body, param, query, validationResult } from 'express-validator';

// Validation result checker
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Auth validations
export const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
];

export const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validate
];

// Goal validations
export const validateGoal = [
  body('title')
    .trim()
    .notEmpty().withMessage('Goal title is required')
    .isLength({ max: 200 }).withMessage('Title cannot be more than 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot be more than 2000 characters'),
  body('category')
    .optional()
    .isIn(['health', 'career', 'education', 'finance', 'personal', 'other'])
    .withMessage('Invalid category'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority'),
  body('targetDate')
    .notEmpty().withMessage('Target date is required')
    .isISO8601().withMessage('Please provide a valid date'),
  validate
];

// Milestone validations
export const validateMilestone = [
  body('goalId')
    .notEmpty().withMessage('Goal ID is required')
    .isMongoId().withMessage('Invalid goal ID'),
  body('title')
    .trim()
    .notEmpty().withMessage('Milestone title is required')
    .isLength({ max: 200 }).withMessage('Title cannot be more than 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot be more than 1000 characters'),
  body('dueDate')
    .notEmpty().withMessage('Due date is required')
    .isISO8601().withMessage('Please provide a valid date'),
  validate
];

// Progress validations
export const validateProgress = [
  body('goalId')
    .notEmpty().withMessage('Goal ID is required')
    .isMongoId().withMessage('Invalid goal ID'),
  body('weekStartDate')
    .notEmpty().withMessage('Week start date is required')
    .isISO8601().withMessage('Please provide a valid date'),
  body('weekEndDate')
    .notEmpty().withMessage('Week end date is required')
    .isISO8601().withMessage('Please provide a valid date'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Notes cannot be more than 1000 characters'),
  body('progressPercentage')
    .optional()
    .isInt({ min: 0, max: 100 }).withMessage('Progress percentage must be between 0 and 100'),
  body('hoursSpent')
    .optional()
    .isFloat({ min: 0 }).withMessage('Hours spent must be a positive number'),
  validate
];

// Param validations
export const validateMongoId = [
  param('id').isMongoId().withMessage('Invalid ID'),
  validate
];
