const { body } = require('express-validator');

/**
 * Validation rules for user registration
 */
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one letter and one number'),
];

/**
 * Validation rules for user login
 */
const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * Validation rules for creating/updating a note
 */
const noteValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),

  body('content')
    .optional()
    .trim(),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  body('color')
    .optional()
    .isString()
    .matches(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
    .withMessage('Color must be a valid hex color'),

  body('reminder')
    .optional()
    .if((value) => value !== null && value !== undefined && value !== '')
    .isISO8601()
    .withMessage('Please provide a valid date/time for the reminder'),
];

/**
 * Validation rules for categories
 */
const categoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Category name must be between 1 and 50 characters'),

  body('color')
    .optional()
    .isString()
    .matches(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
    .withMessage('Color must be a valid hex color'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters'),
];

/**
 * Validation rules for profile updates
 */
const profileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
];

/**
 * Validation rules for password change
 */
const passwordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one letter and one number'),
];

module.exports = {
  registerValidation,
  loginValidation,
  noteValidation,
  categoryValidation,
  profileValidation,
  passwordValidation,
};
