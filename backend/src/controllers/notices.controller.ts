import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { NoticesService } from '../services/notices.service';
import { sendSuccess, sendError } from '../utils/response';
import logger from '../utils/logger';

const noticesService = new NoticesService();

export class NoticesController {
  async getNotices(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { target } = req.query;
      const notices = await noticesService.getNotices(target as string | undefined);
      sendSuccess(res, { notices }, 'Notices fetched successfully');
    } catch (error: any) {
      logger.error('Get notices controller error:', error);
      next(error);
    }
  }

  async getNotice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const notice = await noticesService.getNotice(id);
      sendSuccess(res, { notice }, 'Notice fetched successfully');
    } catch (error: any) {
      logger.error('Get notice controller error:', error);
      next(error);
    }
  }

  async createNotice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, content, priority, target, expiresAt } = req.body;
      
      if (!title || !content || !priority || !target) {
        sendError(res, 'VALIDATION_ERROR', 'Missing required fields: title, content, priority, target', 400);
        return;
      }

      if (!req.user) {
        sendError(res, 'AUTH_UNAUTHORIZED', 'User not authenticated', 401);
        return;
      }

      const role = (req.user.role || 'teacher').toString().toLowerCase();
      const notice = await noticesService.createNotice({
        title,
        content,
        priority,
        target,
        authorId: req.user.uid,
        authorName: (req.user as any).email || (role === 'admin' ? 'Admin' : 'Teacher'),
        authorRole: role === 'admin' ? 'admin' : 'teacher',
        expiresAt,
      });
      
      sendSuccess(res, { notice }, 'Notice created successfully', 201);
    } catch (error: any) {
      logger.error('Create notice controller error:', error);
      next(error);
    }
  }

  async updateNotice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'AUTH_UNAUTHORIZED', 'User not authenticated', 401);
        return;
      }
      const { id } = req.params;
      const { title, content, priority, target, expiresAt } = req.body;
      const role = (req.user.role || '').toString().toLowerCase();
      if (role === 'teacher') {
        const existing = await noticesService.getNotice(id);
        if (existing.authorId !== req.user.uid) {
          sendError(res, 'AUTH_UNAUTHORIZED', 'You can only update your own notices', 403);
          return;
        }
      }
      const notice = await noticesService.updateNotice(id, {
        title,
        content,
        priority,
        target,
        expiresAt,
      });
      sendSuccess(res, { notice }, 'Notice updated successfully');
    } catch (error: any) {
      logger.error('Update notice controller error:', error);
      next(error);
    }
  }

  async deleteNotice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'AUTH_UNAUTHORIZED', 'User not authenticated', 401);
        return;
      }
      const { id } = req.params;
      const role = (req.user.role || '').toString().toLowerCase();
      if (role === 'teacher') {
        const existing = await noticesService.getNotice(id);
        if (existing.authorId !== req.user.uid) {
          sendError(res, 'AUTH_UNAUTHORIZED', 'You can only delete your own notices', 403);
          return;
        }
      }
      await noticesService.deleteNotice(id);
      sendSuccess(res, {}, 'Notice deleted successfully');
    } catch (error: any) {
      logger.error('Delete notice controller error:', error);
      next(error);
    }
  }
}

export default new NoticesController();
