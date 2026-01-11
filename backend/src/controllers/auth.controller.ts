import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import logger from '../utils/logger';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      sendSuccess(res, result, 'Login successful');
    } catch (error: any) {
      logger.error('Login controller error:', error);
      next(error);
    }
  }

  async logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user) {
        await authService.logout(req.user.uid);
      }
      sendSuccess(res, null, 'Logout successful');
    } catch (error: any) {
      logger.error('Logout controller error:', error);
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        sendError(res, 'VALIDATION_ERROR', 'Refresh token is required', 400);
        return;
      }
      const result = await authService.refreshToken(refreshToken);
      sendSuccess(res, result, 'Token refreshed successfully');
    } catch (error: any) {
      logger.error('Refresh token controller error:', error);
      next(error);
    }
  }

  async getCurrentUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'AUTH_UNAUTHORIZED', 'User not authenticated', 401);
        return;
      }
      const user = await authService.getCurrentUser(req.user.uid);
      sendSuccess(res, { user }, 'User retrieved successfully');
    } catch (error: any) {
      logger.error('Get current user controller error:', error);
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);
      sendSuccess(res, null, 'If the email exists, a password reset link has been sent');
    } catch (error: any) {
      logger.error('Forgot password controller error:', error);
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      await authService.resetPassword(token, newPassword);
      sendSuccess(res, null, 'Password reset successfully');
    } catch (error: any) {
      logger.error('Reset password controller error:', error);
      next(error);
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'AUTH_UNAUTHORIZED', 'User not authenticated', 401);
        return;
      }
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.user.uid, currentPassword, newPassword);
      sendSuccess(res, null, 'Password changed successfully');
    } catch (error: any) {
      logger.error('Change password controller error:', error);
      next(error);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'AUTH_UNAUTHORIZED', 'User not authenticated', 401);
        return;
      }
      const { displayName, phone, photoURL } = req.body;
      const updatedUser = await authService.updateProfile(req.user.uid, {
        displayName,
        phone,
        photoURL,
      });
      sendSuccess(res, { user: updatedUser }, 'Profile updated successfully');
    } catch (error: any) {
      logger.error('Update profile controller error:', error);
      next(error);
    }
  }
}

export default new AuthController();


