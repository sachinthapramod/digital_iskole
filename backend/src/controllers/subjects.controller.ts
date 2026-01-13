import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { SubjectsService } from '../services/subjects.service';
import { sendSuccess, sendError } from '../utils/response';
import logger from '../utils/logger';

const subjectsService = new SubjectsService();

export class SubjectsController {
  async getSubjects(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const subjects = await subjectsService.getSubjects();
      sendSuccess(res, { subjects }, 'Subjects fetched successfully');
    } catch (error: any) {
      logger.error('Get subjects controller error:', error);
      next(error);
    }
  }

  async getSubject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const subject = await subjectsService.getSubject(id);
      sendSuccess(res, { subject }, 'Subject fetched successfully');
    } catch (error: any) {
      logger.error('Get subject controller error:', error);
      next(error);
    }
  }

  async createSubject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, code, description } = req.body;
      
      if (!name || !code) {
        sendError(res, 'VALIDATION_ERROR', 'Missing required fields: name, code', 400);
        return;
      }

      const subject = await subjectsService.createSubject({
        name,
        code,
        description,
      });
      
      sendSuccess(res, { subject }, 'Subject created successfully', 201);
    } catch (error: any) {
      logger.error('Create subject controller error:', error);
      next(error);
    }
  }

  async updateSubject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { name, code, description, status } = req.body;

      const subject = await subjectsService.updateSubject(id, {
        name,
        code,
        description,
        status,
      });
      
      sendSuccess(res, { subject }, 'Subject updated successfully');
    } catch (error: any) {
      logger.error('Update subject controller error:', error);
      next(error);
    }
  }

  async deleteSubject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await subjectsService.deleteSubject(id);
      sendSuccess(res, {}, 'Subject deleted successfully');
    } catch (error: any) {
      logger.error('Delete subject controller error:', error);
      next(error);
    }
  }
}

export default new SubjectsController();
