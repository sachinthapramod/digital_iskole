import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { authRateLimiter } from '../middleware/rateLimit.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  loginValidator,
  refreshTokenValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
  updateProfileValidator,
} from '../validators/auth.validator';

const router = Router();

// Public routes
router.post('/login', authRateLimiter, validate(loginValidator), authController.login.bind(authController));
router.post('/refresh', authRateLimiter, validate(refreshTokenValidator), authController.refreshToken.bind(authController));
router.post('/forgot-password', authRateLimiter, validate(forgotPasswordValidator), authController.forgotPassword.bind(authController));
router.post('/reset-password', authRateLimiter, validate(resetPasswordValidator), authController.resetPassword.bind(authController));

// Protected routes
router.post('/logout', authenticateToken, authController.logout.bind(authController));
router.get('/me', authenticateToken, authController.getCurrentUser.bind(authController));
router.put('/profile', authenticateToken, validate(updateProfileValidator), authController.updateProfile.bind(authController));
router.post('/change-password', authenticateToken, validate(changePasswordValidator), authController.changePassword.bind(authController));

export default router;


