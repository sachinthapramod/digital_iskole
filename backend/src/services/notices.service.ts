import { db } from '../config/firebase';
import { Timestamp } from 'firebase-admin/firestore';
import { ApiErrorResponse } from '../utils/response';
import { Notice } from '../types/notice.types';
import { NotificationsService } from './notifications.service';
import logger from '../utils/logger';

const notificationsService = new NotificationsService();

export class NoticesService {
  async getNotices(targetAudience?: string): Promise<any[]> {
    try {
      let query = db.collection('notices').where('status', '==', 'published');
      
      const noticesSnapshot = await query.get();
      const notices: any[] = [];
      
      for (const doc of noticesSnapshot.docs) {
        const noticeData = doc.data() as Notice;
        const publishedAt = noticeData.publishedAt as Timestamp;
        const expiresAt = noticeData.expiresAt as Timestamp;
        const createdAt = noticeData.createdAt as Timestamp;
        const updatedAt = noticeData.updatedAt as Timestamp;
        
        // Check if notice has expired
        if (expiresAt && expiresAt.toDate() < new Date()) {
          continue; // Skip expired notices
        }
        
        // Filter by target audience if specified
        if (targetAudience && targetAudience !== 'all') {
          const targetAudiences = noticeData.targetAudience || [];
          if (!targetAudiences.includes('all') && !targetAudiences.includes(targetAudience as any)) {
            continue; // Skip if notice doesn't target this audience
          }
        }
        
        notices.push({
          id: doc.id,
          title: noticeData.title,
          content: noticeData.content,
          priority: noticeData.priority,
          target: noticeData.targetAudience?.includes('all') ? 'all' : noticeData.targetAudience?.[0] || 'all',
          targetAudience: noticeData.targetAudience,
          author: noticeData.authorName,
          authorId: noticeData.authorId,
          authorRole: noticeData.authorRole,
          date: publishedAt ? publishedAt.toDate().toISOString().split('T')[0] : '',
          publishedAt: publishedAt ? publishedAt.toDate().toISOString() : '',
          expiresAt: expiresAt ? expiresAt.toDate().toISOString() : '',
          createdAt: createdAt ? createdAt.toDate().toISOString() : '',
          updatedAt: updatedAt ? updatedAt.toDate().toISOString() : '',
        });
      }
      
      // Sort by published date (newest first)
      notices.sort((a, b) => {
        const dateA = new Date(a.publishedAt || a.date).getTime();
        const dateB = new Date(b.publishedAt || b.date).getTime();
        return dateB - dateA;
      });
      
      return notices;
    } catch (error: any) {
      logger.error('Get notices error:', error);
      throw new ApiErrorResponse('FETCH_FAILED', 'Failed to fetch notices', 500);
    }
  }

  async getNotice(id: string): Promise<any> {
    try {
      const noticeDoc = await db.collection('notices').doc(id).get();
      
      if (!noticeDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Notice not found', 404);
      }
      
      const noticeData = noticeDoc.data() as Notice;
      const publishedAt = noticeData.publishedAt as Timestamp;
      const expiresAt = noticeData.expiresAt as Timestamp;
      const createdAt = noticeData.createdAt as Timestamp;
      const updatedAt = noticeData.updatedAt as Timestamp;
      
      return {
        id: noticeDoc.id,
        title: noticeData.title,
        content: noticeData.content,
        priority: noticeData.priority,
        target: noticeData.targetAudience?.includes('all') ? 'all' : noticeData.targetAudience?.[0] || 'all',
        targetAudience: noticeData.targetAudience,
        author: noticeData.authorName,
        authorId: noticeData.authorId,
        authorRole: noticeData.authorRole,
        date: publishedAt ? publishedAt.toDate().toISOString().split('T')[0] : '',
        publishedAt: publishedAt ? publishedAt.toDate().toISOString() : '',
        expiresAt: expiresAt ? expiresAt.toDate().toISOString() : '',
        createdAt: createdAt ? createdAt.toDate().toISOString() : '',
        updatedAt: updatedAt ? updatedAt.toDate().toISOString() : '',
      };
    } catch (error: any) {
      logger.error('Get notice error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('FETCH_FAILED', 'Failed to fetch notice', 500);
    }
  }

  async createNotice(data: {
    title: string;
    content: string;
    priority: 'high' | 'medium' | 'low';
    target: string;
    authorId: string;
    authorName: string;
    authorRole: 'admin' | 'teacher';
    expiresAt?: string;
  }): Promise<any> {
    try {
      if (!data.title || !data.content) {
        throw new ApiErrorResponse('VALIDATION_ERROR', 'Title and content are required', 400);
      }

      // Map priority from frontend format to backend format
      const priorityMap: Record<string, 'high' | 'medium' | 'normal'> = {
        'high': 'high',
        'medium': 'medium',
        'low': 'normal',
      };

      // Map target to targetAudience array
      const targetAudience: ('all' | 'teachers' | 'parents' | 'students')[] = 
        data.target === 'all' ? ['all'] : [data.target as 'teachers' | 'parents' | 'students'];

      const noticeData: Omit<Notice, 'id'> = {
        title: data.title,
        content: data.content,
        priority: priorityMap[data.priority] || 'medium',
        targetAudience,
        authorId: data.authorId,
        authorName: data.authorName,
        authorRole: data.authorRole,
        publishedAt: Timestamp.now(),
        expiresAt: data.expiresAt ? Timestamp.fromDate(new Date(data.expiresAt)) : undefined,
        status: 'published',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      const noticeRef = await db.collection('notices').add(noticeData);
      
      // Create notifications for target audience
      try {
        const targetAudiences = targetAudience.includes('all') 
          ? ['all'] 
          : targetAudience;
        
        // Get user IDs based on target audience
        let userIds: string[] = [];
        
        if (targetAudiences.includes('all')) {
          // Get all users, then filter active in memory (avoid composite indexes and support both schemas)
          const usersSnapshot = await db.collection('users').get();
          userIds = usersSnapshot.docs
            .filter((doc) => {
              const u = doc.data() as any;
              return u?.isActive === true || u?.status === 'active';
            })
            .map(doc => doc.id);
        } else {
          // Get users by role
          const roleMap: Record<string, string> = {
            'teachers': 'teacher',
            'parents': 'parent',
            'students': 'parent', // Students don't have accounts, notify their parents
          };
          
          for (const audience of targetAudiences) {
            const role = roleMap[audience];
            if (role) {
              // Query by role only (avoids composite index), then filter active in memory
              const usersSnapshot = await db.collection('users')
                .where('role', '==', role)
                .get();
              userIds.push(
                ...usersSnapshot.docs
                  .filter((doc) => {
                    const u = doc.data() as any;
                    return u?.isActive === true || u?.status === 'active';
                  })
                  .map(doc => doc.id)
              );
            }
          }
          
          // Remove duplicates
          userIds = Array.from(new Set(userIds));
        }
        
        // Create bulk notifications
        if (userIds.length > 0) {
          await notificationsService.createBulkNotifications(userIds, {
            type: 'notice',
            title: 'New Notice: ' + data.title,
            message: data.content.substring(0, 100) + (data.content.length > 100 ? '...' : ''),
            link: '/dashboard/notices',
            data: { noticeId: noticeRef.id },
            priority: data.priority === 'high' ? 'high' : 'normal',
          });
        }
      } catch (notifError: any) {
        // Log error but don't fail notice creation
        logger.error('Failed to create notifications for notice:', notifError);
      }
      
      return {
        id: noticeRef.id,
        title: noticeData.title,
        content: noticeData.content,
        priority: data.priority,
        target: data.target,
        author: noticeData.authorName,
        date: noticeData.publishedAt.toDate().toISOString().split('T')[0],
      };
    } catch (error: any) {
      logger.error('Create notice error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('CREATE_FAILED', 'Failed to create notice', 500);
    }
  }

  async updateNotice(id: string, data: {
    title?: string;
    content?: string;
    priority?: 'high' | 'medium' | 'low';
    target?: string;
    expiresAt?: string;
  }): Promise<any> {
    try {
      const noticeDoc = await db.collection('notices').doc(id).get();
      
      if (!noticeDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Notice not found', 404);
      }
      
      const updateData: any = {
        updatedAt: Timestamp.now(),
      };
      
      if (data.title !== undefined) updateData.title = data.title;
      if (data.content !== undefined) updateData.content = data.content;
      if (data.priority !== undefined) {
        const priorityMap: Record<string, 'high' | 'medium' | 'normal'> = {
          'high': 'high',
          'medium': 'medium',
          'low': 'normal',
        };
        updateData.priority = priorityMap[data.priority] || 'medium';
      }
      if (data.target !== undefined) {
        const targetAudience: ('all' | 'teachers' | 'parents' | 'students')[] = 
          data.target === 'all' ? ['all'] : [data.target as 'teachers' | 'parents' | 'students'];
        updateData.targetAudience = targetAudience;
      }
      if (data.expiresAt !== undefined) {
        updateData.expiresAt = data.expiresAt ? Timestamp.fromDate(new Date(data.expiresAt)) : undefined;
      }
      
      await db.collection('notices').doc(id).update(updateData);
      
      return await this.getNotice(id);
    } catch (error: any) {
      logger.error('Update notice error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('UPDATE_FAILED', 'Failed to update notice', 500);
    }
  }

  async deleteNotice(id: string): Promise<void> {
    try {
      const noticeDoc = await db.collection('notices').doc(id).get();
      
      if (!noticeDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Notice not found', 404);
      }
      
      await db.collection('notices').doc(id).delete();
    } catch (error: any) {
      logger.error('Delete notice error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('DELETE_FAILED', 'Failed to delete notice', 500);
    }
  }
}
