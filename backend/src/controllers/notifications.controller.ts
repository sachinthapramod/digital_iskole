import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { NotificationsService } from '../services/notifications.service';
import { sendSuccess, sendError } from '../utils/response';
import logger from '../utils/logger';

const notificationsService = new NotificationsService();

export class NotificationsController {
  async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'AUTH_UNAUTHORIZED', 'User not authenticated', 401);
        return;
      }

      const notifications = await notificationsService.getNotifications(req.user.uid);
      sendSuccess(res, { notifications }, 'Notifications fetched successfully');
    } catch (error: any) {
      logger.error('Get notifications controller error:', error);
      next(error);
    }
  }

  async getUnreadCount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'AUTH_UNAUTHORIZED', 'User not authenticated', 401);
        return;
      }

      const count = await notificationsService.getUnreadCount(req.user.uid);
      sendSuccess(res, { count }, 'Unread count fetched successfully');
    } catch (error: any) {
      logger.error('Get unread count controller error:', error);
      next(error);
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'AUTH_UNAUTHORIZED', 'User not authenticated', 401);
        return;
      }

      const { id } = req.params;
      await notificationsService.markAsRead(id, req.user.uid);
      sendSuccess(res, {}, 'Notification marked as read');
    } catch (error: any) {
      logger.error('Mark as read controller error:', error);
      next(error);
    }
  }

  async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'AUTH_UNAUTHORIZED', 'User not authenticated', 401);
        return;
      }

      await notificationsService.markAllAsRead(req.user.uid);
      sendSuccess(res, {}, 'All notifications marked as read');
    } catch (error: any) {
      logger.error('Mark all as read controller error:', error);
      next(error);
    }
  }

  async deleteNotification(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'AUTH_UNAUTHORIZED', 'User not authenticated', 401);
        return;
      }

      const { id } = req.params;
      await notificationsService.deleteNotification(id, req.user.uid);
      sendSuccess(res, {}, 'Notification deleted successfully');
    } catch (error: any) {
      logger.error('Delete notification controller error:', error);
      next(error);
    }
  }

  async deleteAllRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'AUTH_UNAUTHORIZED', 'User not authenticated', 401);
        return;
      }

      await notificationsService.deleteAllRead(req.user.uid);
      sendSuccess(res, {}, 'All read notifications deleted successfully');
    } catch (error: any) {
      logger.error('Delete all read controller error:', error);
      next(error);
    }
  }
}

export default new NotificationsController();
