import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { ExamsService } from '../services/exams.service';
import { sendSuccess, sendError } from '../utils/response';
import logger from '../utils/logger';

const examsService = new ExamsService();

export class ExamsController {
  async getExams(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const exams = await examsService.getExams();
      sendSuccess(res, { exams }, 'Exams fetched successfully');
    } catch (error: any) {
      logger.error('Get exams controller error:', error);
      next(error);
    }
  }

  async getExam(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const exam = await examsService.getExam(id);
      sendSuccess(res, { exam }, 'Exam fetched successfully');
    } catch (error: any) {
      logger.error('Get exam controller error:', error);
      next(error);
    }
  }

  async createExam(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, type, startDate, endDate, grades, description } = req.body;
      
      if (!name || !type || !startDate || !endDate) {
        sendError(res, 'VALIDATION_ERROR', 'Missing required fields: name, type, startDate, endDate', 400);
        return;
      }

      if (!req.user) {
        sendError(res, 'AUTH_UNAUTHORIZED', 'User not authenticated', 401);
        return;
      }

      const createdByRole = (req.user.role || 'teacher').toString().toLowerCase() as 'admin' | 'teacher';
      const createdByName = (req.user as any).email || (req.user as any).name || (createdByRole === 'admin' ? 'Admin' : 'Teacher');
      const exam = await examsService.createExam({
        name,
        type,
        startDate,
        endDate,
        grades: grades || [],
        description,
        createdBy: req.user.uid,
        createdByName,
        createdByRole,
      });
      
      sendSuccess(res, { exam }, 'Exam created successfully', 201);
    } catch (error: any) {
      logger.error('Create exam controller error:', error);
      next(error);
    }
  }

  async updateExam(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { name, type, startDate, endDate, grades, description } = req.body;
      
      const exam = await examsService.updateExam(id, {
        name,
        type,
        startDate,
        endDate,
        grades,
        description,
      });
      
      sendSuccess(res, { exam }, 'Exam updated successfully');
    } catch (error: any) {
      logger.error('Update exam controller error:', error);
      next(error);
    }
  }

  async deleteExam(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await examsService.deleteExam(id);
      sendSuccess(res, {}, 'Exam deleted successfully');
    } catch (error: any) {
      logger.error('Delete exam controller error:', error);
      next(error);
    }
  }
}

export default new ExamsController();
