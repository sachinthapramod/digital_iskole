import { body } from 'express-validator';

export const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const refreshTokenValidator = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
];

export const forgotPasswordValidator = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
];

export const resetPasswordValidator = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword').notEmpty().withMessage('New password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').notEmpty().withMessage('New password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const updateProfileValidator = [
  body('displayName').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Display name must be between 2 and 100 characters'),
  body('phone').optional().trim().matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone number format'),
  body('photoURL').optional().isURL().withMessage('Invalid photo URL'),
  body('dateOfBirth').optional().isISO8601().withMessage('Invalid date format. Use YYYY-MM-DD format'),
];


