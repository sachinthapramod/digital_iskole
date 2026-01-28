import { db } from '../config/firebase';
import { Timestamp } from 'firebase-admin/firestore';
import { ApiErrorResponse } from '../utils/response';
import { Notification } from '../types/notification.types';
import logger from '../utils/logger';

export class NotificationsService {
  async getNotifications(userId: string): Promise<any[]> {
    try {
      // OPTIMIZED: Use Firestore ordering and limit if index exists, otherwise fallback to in-memory sort
      let notificationsSnapshot;
      let usedFallback = false;
      try {
        // Try with orderBy first (requires index)
        notificationsSnapshot = await db.collection('notifications')
          .where('userId', '==', userId)
          .orderBy('createdAt', 'desc')
          .limit(100)
          .get();
      } catch (indexError: any) {
        // If index doesn't exist, fallback to query without orderBy and sort in memory
        if (indexError.code === 9 || indexError.message?.includes('index')) {
          logger.warn('Firestore index not found for notifications. Using fallback query. Please create index: notifications(userId, createdAt DESC)');
          notificationsSnapshot = await db.collection('notifications')
            .where('userId', '==', userId)
            .limit(100)
            .get();
          usedFallback = true;
        } else {
          throw indexError;
        }
      }
      
      const notifications: any[] = [];
      
      for (const doc of notificationsSnapshot.docs) {
        const notificationData = doc.data() as Notification;
        const createdAt = notificationData.createdAt as Timestamp;
        const readAt = notificationData.readAt as Timestamp;
        
        notifications.push({
          id: doc.id,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          link: notificationData.link,
          data: notificationData.data,
          read: notificationData.isRead,
          timestamp: createdAt ? createdAt.toDate().toISOString() : new Date().toISOString(),
          createdAt: createdAt ? createdAt.toDate().toISOString() : '',
          readAt: readAt ? readAt.toDate().toISOString() : undefined,
        });
      }
      
      // Sort in memory if we used fallback query (no orderBy)
      if (usedFallback) {
        notifications.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.timestamp).getTime();
          const dateB = new Date(b.createdAt || b.timestamp).getTime();
          return dateB - dateA;
        });
      }
      
      return notifications;
    } catch (error: any) {
      logger.error('Get notifications error:', error);
      throw new ApiErrorResponse('FETCH_FAILED', 'Failed to fetch notifications', 500);
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const notificationsSnapshot = await db.collection('notifications')
        .where('userId', '==', userId)
        .where('isRead', '==', false)
        .get();
      
      return notificationsSnapshot.size;
    } catch (error: any) {
      logger.error('Get unread count error:', error);
      return 0;
    }
  }

  async createNotification(data: {
    userId: string;
    type: 'appointment' | 'notice' | 'marks' | 'attendance' | 'system' | 'exams';
    title: string;
    message: string;
    link?: string;
    data?: Record<string, any>;
    priority?: 'high' | 'normal' | 'low';
  }): Promise<any> {
    try {
      const notificationData: Omit<Notification, 'id'> = {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
        data: data.data,
        isRead: false,
        priority: data.priority || 'normal',
        createdAt: Timestamp.now(),
      };
      
      const notificationRef = await db.collection('notifications').add(notificationData);
      
      return {
        id: notificationRef.id,
        ...notificationData,
        createdAt: notificationData.createdAt.toDate().toISOString(),
      };
    } catch (error: any) {
      logger.error('Create notification error:', error);
      throw new ApiErrorResponse('CREATE_FAILED', 'Failed to create notification', 500);
    }
  }

  async createBulkNotifications(userIds: string[], data: {
    type: 'appointment' | 'notice' | 'marks' | 'attendance' | 'system' | 'exams';
    title: string;
    message: string;
    link?: string;
    data?: Record<string, any>;
    priority?: 'high' | 'normal' | 'low';
  }): Promise<void> {
    try {
      if (userIds.length === 0) {
        return;
      }

      const batch = db.batch();
      const priority = data.priority || 'normal';

      for (const userId of userIds) {
        const notificationRef = db.collection('notifications').doc();
        batch.set(notificationRef, {
          userId,
          type: data.type,
          title: data.title,
          message: data.message,
          link: data.link,
          data: data.data,
          isRead: false,
          priority,
          createdAt: Timestamp.now(),
        });
      }

      await batch.commit();
    } catch (error: any) {
      logger.error('Create bulk notifications error:', error);
      throw new ApiErrorResponse('CREATE_FAILED', 'Failed to create bulk notifications', 500);
    }
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    try {
      const notificationDoc = await db.collection('notifications').doc(id).get();
      
      if (!notificationDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Notification not found', 404);
      }

      const notificationData = notificationDoc.data() as Notification;
      if (notificationData.userId !== userId) {
        throw new ApiErrorResponse('AUTH_UNAUTHORIZED', 'Not authorized to update this notification', 403);
      }

      await db.collection('notifications').doc(id).update({
        isRead: true,
        readAt: Timestamp.now(),
      });
    } catch (error: any) {
      logger.error('Mark as read error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('UPDATE_FAILED', 'Failed to mark notification as read', 500);
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      const notificationsSnapshot = await db.collection('notifications')
        .where('userId', '==', userId)
        .where('isRead', '==', false)
        .get();

      if (notificationsSnapshot.empty) {
        return;
      }

      const batch = db.batch();
      const now = Timestamp.now();

      notificationsSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          isRead: true,
          readAt: now,
        });
      });

      await batch.commit();
    } catch (error: any) {
      logger.error('Mark all as read error:', error);
      throw new ApiErrorResponse('UPDATE_FAILED', 'Failed to mark all notifications as read', 500);
    }
  }

  async deleteNotification(id: string, userId: string): Promise<void> {
    try {
      const notificationDoc = await db.collection('notifications').doc(id).get();
      
      if (!notificationDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Notification not found', 404);
      }

      const notificationData = notificationDoc.data() as Notification;
      if (notificationData.userId !== userId) {
        throw new ApiErrorResponse('AUTH_UNAUTHORIZED', 'Not authorized to delete this notification', 403);
      }

      await db.collection('notifications').doc(id).delete();
    } catch (error: any) {
      logger.error('Delete notification error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('DELETE_FAILED', 'Failed to delete notification', 500);
    }
  }

  async deleteAllRead(userId: string): Promise<void> {
    try {
      const notificationsSnapshot = await db.collection('notifications')
        .where('userId', '==', userId)
        .where('isRead', '==', true)
        .get();

      if (notificationsSnapshot.empty) {
        return;
      }

      const batch = db.batch();
      notificationsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
    } catch (error: any) {
      logger.error('Delete all read error:', error);
      throw new ApiErrorResponse('DELETE_FAILED', 'Failed to delete read notifications', 500);
    }
  }
}
