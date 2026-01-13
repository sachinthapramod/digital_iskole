import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { ClassesService } from '../services/classes.service';
import { sendSuccess, sendError } from '../utils/response';
import logger from '../utils/logger';

const classesService = new ClassesService();

export class ClassesController {
  async getClasses(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const classes = await classesService.getClasses();
      sendSuccess(res, { classes }, 'Classes fetched successfully');
    } catch (error: any) {
      logger.error('Get classes controller error:', error);
      next(error);
    }
  }

  async getClass(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const classData = await classesService.getClass(id);
      sendSuccess(res, { class: classData }, 'Class fetched successfully');
    } catch (error: any) {
      logger.error('Get class controller error:', error);
      next(error);
    }
  }

  async createClass(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { grade, section, classTeacher, room } = req.body;
      
      if (!grade || !section) {
        sendError(res, 'VALIDATION_ERROR', 'Missing required fields: grade, section', 400);
        return;
      }

      const classData = await classesService.createClass({
        grade,
        section,
        classTeacher: classTeacher || 'Not assigned',
        room,
      });
      
      sendSuccess(res, { class: classData }, 'Class created successfully', 201);
    } catch (error: any) {
      logger.error('Create class controller error:', error);
      next(error);
    }
  }

  async updateClass(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { grade, section, classTeacher, room, status } = req.body;

      const classData = await classesService.updateClass(id, {
        grade,
        section,
        classTeacher,
        room,
        status,
      });
      
      sendSuccess(res, { class: classData }, 'Class updated successfully');
    } catch (error: any) {
      logger.error('Update class controller error:', error);
      next(error);
    }
  }

  async deleteClass(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await classesService.deleteClass(id);
      sendSuccess(res, {}, 'Class deleted successfully');
    } catch (error: any) {
      logger.error('Delete class controller error:', error);
      next(error);
    }
  }
}

export default new ClassesController();
