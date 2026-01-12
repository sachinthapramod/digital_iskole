import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import usersService from '../services/users.service';
import { sendSuccess, sendError } from '../utils/response';
import logger from '../utils/logger';

export class UsersController {
  // ========== TEACHERS ==========

  async getTeachers(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const teachers = await usersService.getTeachers();
      sendSuccess(res, { teachers }, 'Teachers fetched successfully');
    } catch (error: any) {
      logger.error('Get teachers controller error:', error);
      next(error);
    }
  }

  async getTeacher(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const teacher = await usersService.getTeacher(id);
      sendSuccess(res, { teacher }, 'Teacher fetched successfully');
    } catch (error: any) {
      logger.error('Get teacher controller error:', error);
      next(error);
    }
  }

  async createTeacher(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, phone, subject, assignedClass, password } = req.body;
      
      if (!name || !email || !phone || !subject || !password) {
        sendError(res, 'VALIDATION_ERROR', 'Missing required fields: name, email, phone, subject, password', 400);
        return;
      }

      const teacher = await usersService.createTeacher({
        name,
        email,
        phone,
        subject,
        assignedClass,
        password,
      });
      
      sendSuccess(res, { teacher }, 'Teacher created successfully', 201);
    } catch (error: any) {
      logger.error('Create teacher controller error:', error);
      next(error);
    }
  }

  async updateTeacher(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { name, email, phone, subject, assignedClass, status } = req.body;
      
      const teacher = await usersService.updateTeacher(id, {
        name,
        email,
        phone,
        subject,
        assignedClass,
        status,
      });
      
      sendSuccess(res, { teacher }, 'Teacher updated successfully');
    } catch (error: any) {
      logger.error('Update teacher controller error:', error);
      next(error);
    }
  }

  async deleteTeacher(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await usersService.deleteTeacher(id);
      sendSuccess(res, {}, 'Teacher deleted successfully');
    } catch (error: any) {
      logger.error('Delete teacher controller error:', error);
      next(error);
    }
  }

  // ========== PARENTS ==========

  async getParents(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const parents = await usersService.getParents();
      sendSuccess(res, { parents }, 'Parents fetched successfully');
    } catch (error: any) {
      logger.error('Get parents controller error:', error);
      next(error);
    }
  }

  async getParent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const parent = await usersService.getParent(id);
      sendSuccess(res, { parent }, 'Parent fetched successfully');
    } catch (error: any) {
      logger.error('Get parent controller error:', error);
      next(error);
    }
  }

  async createParent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, phone, password } = req.body;
      
      if (!name || !email || !phone || !password) {
        sendError(res, 'VALIDATION_ERROR', 'Missing required fields: name, email, phone, password', 400);
        return;
      }

      const parent = await usersService.createParent({
        name,
        email,
        phone,
        password,
      });
      
      sendSuccess(res, { parent }, 'Parent created successfully', 201);
    } catch (error: any) {
      logger.error('Create parent controller error:', error);
      next(error);
    }
  }

  async updateParent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { name, email, phone, status } = req.body;
      
      const parent = await usersService.updateParent(id, {
        name,
        email,
        phone,
        status,
      });
      
      sendSuccess(res, { parent }, 'Parent updated successfully');
    } catch (error: any) {
      logger.error('Update parent controller error:', error);
      next(error);
    }
  }

  async deleteParent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await usersService.deleteParent(id);
      sendSuccess(res, {}, 'Parent deleted successfully');
    } catch (error: any) {
      logger.error('Delete parent controller error:', error);
      next(error);
    }
  }

  // ========== STUDENTS ==========

  async getStudents(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const students = await usersService.getStudents();
      sendSuccess(res, { students }, 'Students fetched successfully');
    } catch (error: any) {
      logger.error('Get students controller error:', error);
      next(error);
    }
  }

  async getStudent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const student = await usersService.getStudent(id);
      sendSuccess(res, { student }, 'Student fetched successfully');
    } catch (error: any) {
      logger.error('Get student controller error:', error);
      next(error);
    }
  }

  async createStudent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, class: className, parent } = req.body;
      
      if (!name || !className || !parent) {
        sendError(res, 'VALIDATION_ERROR', 'Missing required fields: name, class, parent', 400);
        return;
      }

      const student = await usersService.createStudent({
        name,
        class: className,
        parent,
      });
      
      sendSuccess(res, { student }, 'Student created successfully', 201);
    } catch (error: any) {
      logger.error('Create student controller error:', error);
      next(error);
    }
  }

  async updateStudent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { name, class: className, parent, status } = req.body;
      
      const student = await usersService.updateStudent(id, {
        name,
        class: className,
        parent,
        status,
      });
      
      sendSuccess(res, { student }, 'Student updated successfully');
    } catch (error: any) {
      logger.error('Update student controller error:', error);
      next(error);
    }
  }

  async deleteStudent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await usersService.deleteStudent(id);
      sendSuccess(res, {}, 'Student deleted successfully');
    } catch (error: any) {
      logger.error('Delete student controller error:', error);
      next(error);
    }
  }
}

export default new UsersController();
