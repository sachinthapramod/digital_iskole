import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { SettingsService } from '../services/settings.service';
import { sendSuccess, sendError } from '../utils/response';
import logger from '../utils/logger';

const settingsService = new SettingsService();

export class SettingsController {
  async getGradingScale(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const grades = await settingsService.getGradingScale();
      sendSuccess(res, { grades }, 'Grading scale fetched successfully');
    } catch (error: any) {
      logger.error('Get grading scale controller error:', error);
      next(error);
    }
  }

  async updateGradingScale(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { grades } = req.body;
      
      if (!Array.isArray(grades)) {
        sendError(res, 'VALIDATION_ERROR', 'Grades must be an array', 400);
        return;
      }

      const updatedGrades = await settingsService.updateGradingScale(grades);
      sendSuccess(res, { grades: updatedGrades }, 'Grading scale updated successfully');
    } catch (error: any) {
      logger.error('Update grading scale controller error:', error);
      next(error);
    }
  }

  async getAcademicYears(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const years = await settingsService.getAcademicYears();
      sendSuccess(res, { years }, 'Academic years fetched successfully');
    } catch (error: any) {
      logger.error('Get academic years controller error:', error);
      next(error);
    }
  }

  async getCurrentAcademicYear(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const year = await settingsService.getCurrentAcademicYear();
      sendSuccess(res, { year }, 'Current academic year fetched successfully');
    } catch (error: any) {
      logger.error('Get current academic year controller error:', error);
      next(error);
    }
  }

  async createAcademicYear(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { year, startDate, endDate } = req.body;
      
      if (!year || !startDate || !endDate) {
        sendError(res, 'VALIDATION_ERROR', 'Year, startDate, and endDate are required', 400);
        return;
      }

      const newYear = await settingsService.createAcademicYear({ year, startDate, endDate });
      sendSuccess(res, { year: newYear }, 'Academic year created successfully');
    } catch (error: any) {
      logger.error('Create academic year controller error:', error);
      next(error);
    }
  }

  async updateAcademicYear(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { year, startDate, endDate } = req.body;

      const updatedYear = await settingsService.updateAcademicYear(id, { year, startDate, endDate });
      sendSuccess(res, { year: updatedYear }, 'Academic year updated successfully');
    } catch (error: any) {
      logger.error('Update academic year controller error:', error);
      next(error);
    }
  }

  async setCurrentAcademicYear(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const updatedYear = await settingsService.setCurrentAcademicYear(id);
      sendSuccess(res, { year: updatedYear }, 'Current academic year set successfully');
    } catch (error: any) {
      logger.error('Set current academic year controller error:', error);
      next(error);
    }
  }

  async deleteAcademicYear(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      await settingsService.deleteAcademicYear(id);
      sendSuccess(res, {}, 'Academic year deleted successfully');
    } catch (error: any) {
      logger.error('Delete academic year controller error:', error);
      next(error);
    }
  }

  async getUserPreferences(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'AUTH_UNAUTHORIZED', 'User not authenticated', 401);
        return;
      }

      const preferences = await settingsService.getUserPreferences(req.user.uid);
      sendSuccess(res, { preferences }, 'User preferences fetched successfully');
    } catch (error: any) {
      logger.error('Get user preferences controller error:', error);
      next(error);
    }
  }

  async updateUserPreferences(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'AUTH_UNAUTHORIZED', 'User not authenticated', 401);
        return;
      }

      const preferences = await settingsService.updateUserPreferences(req.user.uid, req.body);
      sendSuccess(res, { preferences }, 'User preferences updated successfully');
    } catch (error: any) {
      logger.error('Update user preferences controller error:', error);
      next(error);
    }
  }
}

export default new SettingsController();
