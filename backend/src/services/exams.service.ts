import { db } from '../config/firebase';
import { Timestamp } from 'firebase-admin/firestore';
import { ApiErrorResponse } from '../utils/response';
import { NotificationsService } from './notifications.service';
import logger from '../utils/logger';

const notificationsService = new NotificationsService();

interface ExamData {
  name: string;
  type: 'first-term' | 'second-term' | 'third-term' | 'monthly-test' | 'quiz' | 'assignment';
  startDate: Timestamp;
  endDate: Timestamp;
  grades: string[];
  description?: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class ExamsService {
  async getExams(): Promise<any[]> {
    try {
      // Fetch all exams without orderBy to avoid index requirement
      const examsSnapshot = await db.collection('exams').get();
      
      const exams: any[] = [];
      
      for (const doc of examsSnapshot.docs) {
        const examData = doc.data() as ExamData;
        const startDate = examData.startDate as Timestamp;
        const endDate = examData.endDate as Timestamp;
        
        // Determine status based on dates
        const now = Timestamp.now();
        let status = 'upcoming';
        if (startDate && endDate) {
          if (now < startDate) {
            status = 'upcoming';
          } else if (now >= startDate && now <= endDate) {
            status = 'ongoing';
          } else {
            status = 'completed';
          }
        }
        
        exams.push({
          id: doc.id,
          name: examData.name,
          type: examData.type,
          startDate: startDate ? startDate.toDate().toISOString().split('T')[0] : '',
          endDate: endDate ? endDate.toDate().toISOString().split('T')[0] : '',
          grades: examData.grades || [],
          status,
        });
      }
      
      // Sort by startDate descending in memory
      exams.sort((a, b) => {
        const dateA = new Date(a.startDate).getTime();
        const dateB = new Date(b.startDate).getTime();
        return dateB - dateA;
      });
      
      return exams;
    } catch (error: any) {
      logger.error('Get exams error:', error);
      throw new ApiErrorResponse('FETCH_FAILED', 'Failed to fetch exams', 500);
    }
  }

  async getExam(id: string): Promise<any> {
    try {
      const examDoc = await db.collection('exams').doc(id).get();
      
      if (!examDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Exam not found', 404);
      }
      
      const examData = examDoc.data() as ExamData;
      const startDate = examData.startDate as Timestamp;
      const endDate = examData.endDate as Timestamp;
      
      return {
        id: examDoc.id,
        name: examData.name,
        type: examData.type,
        startDate: startDate ? startDate.toDate().toISOString().split('T')[0] : '',
        endDate: endDate ? endDate.toDate().toISOString().split('T')[0] : '',
        grades: examData.grades || [],
        description: examData.description || '',
      };
    } catch (error: any) {
      logger.error('Get exam error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('FETCH_FAILED', 'Failed to fetch exam', 500);
    }
  }

  async createExam(data: {
    name: string;
    type: 'first-term' | 'second-term' | 'third-term' | 'monthly-test' | 'quiz' | 'assignment';
    startDate: string;
    endDate: string;
    grades: string[];
    description?: string;
    createdBy: string;
  }): Promise<any> {
    try {
      // Validate dates
      const startDateObj = new Date(data.startDate);
      const endDateObj = new Date(data.endDate);
      
      if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
        throw new ApiErrorResponse('VALIDATION_ERROR', 'Invalid date format', 400);
      }
      
      if (endDateObj < startDateObj) {
        throw new ApiErrorResponse('VALIDATION_ERROR', 'End date must be after start date', 400);
      }
      
      // Validate exam type
      const validTypes = ['first-term', 'second-term', 'third-term', 'monthly-test', 'quiz', 'assignment'];
      if (!validTypes.includes(data.type)) {
        throw new ApiErrorResponse('VALIDATION_ERROR', `Invalid exam type. Must be one of: ${validTypes.join(', ')}`, 400);
      }
      
      const examData: ExamData = {
        name: data.name,
        type: data.type,
        startDate: Timestamp.fromDate(startDateObj),
        endDate: Timestamp.fromDate(endDateObj),
        grades: data.grades || [],
        description: data.description || '',
        createdBy: data.createdBy,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      const examRef = await db.collection('exams').add(examData);
      
      // Create notifications for all users about the new exam
      try {
        // Fetch all users, then filter active in memory (avoid composite indexes and support both schemas)
        const usersSnapshot = await db.collection('users').get();
        const userIds = usersSnapshot.docs
          .filter((doc) => {
            const u = doc.data() as any;
            return u?.isActive === true || u?.status === 'active';
          })
          .map(doc => doc.id);
        
        if (userIds.length > 0) {
          await notificationsService.createBulkNotifications(userIds, {
            type: 'exams',
            title: `New Exam Scheduled: ${data.name}`,
            message: `A new ${data.type.replace('-', ' ')} exam has been scheduled. Start date: ${data.startDate}`,
            link: '/dashboard/exams',
            data: { examId: examRef.id },
            priority: 'normal',
          });
        }
      } catch (notifError: any) {
        // Log error but don't fail exam creation
        logger.error('Failed to create notifications for exam:', notifError);
      }
      
      return {
        id: examRef.id,
        name: examData.name,
        type: examData.type,
        startDate: data.startDate,
        endDate: data.endDate,
        grades: examData.grades,
        description: examData.description,
      };
    } catch (error: any) {
      logger.error('Create exam error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('CREATE_FAILED', 'Failed to create exam', 500);
    }
  }

  async updateExam(id: string, data: {
    name?: string;
    type?: 'first-term' | 'second-term' | 'third-term' | 'monthly-test' | 'quiz' | 'assignment';
    startDate?: string;
    endDate?: string;
    grades?: string[];
    description?: string;
  }): Promise<any> {
    try {
      const examDoc = await db.collection('exams').doc(id).get();
      
      if (!examDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Exam not found', 404);
      }
      
      const updateData: any = {
        updatedAt: Timestamp.now(),
      };
      
      if (data.name !== undefined) updateData.name = data.name;
      if (data.type !== undefined) {
        const validTypes = ['first-term', 'second-term', 'third-term', 'monthly-test', 'quiz', 'assignment'];
        if (!validTypes.includes(data.type)) {
          throw new ApiErrorResponse('VALIDATION_ERROR', `Invalid exam type. Must be one of: ${validTypes.join(', ')}`, 400);
        }
        updateData.type = data.type;
      }
      if (data.startDate !== undefined) {
        const startDateObj = new Date(data.startDate);
        if (isNaN(startDateObj.getTime())) {
          throw new ApiErrorResponse('VALIDATION_ERROR', 'Invalid start date format', 400);
        }
        updateData.startDate = Timestamp.fromDate(startDateObj);
      }
      if (data.endDate !== undefined) {
        const endDateObj = new Date(data.endDate);
        if (isNaN(endDateObj.getTime())) {
          throw new ApiErrorResponse('VALIDATION_ERROR', 'Invalid end date format', 400);
        }
        updateData.endDate = Timestamp.fromDate(endDateObj);
      }
      if (data.grades !== undefined) updateData.grades = data.grades;
      if (data.description !== undefined) updateData.description = data.description;
      
      // Validate date range if both dates are being updated
      if (data.startDate && data.endDate) {
        const startDateObj = new Date(data.startDate);
        const endDateObj = new Date(data.endDate);
        if (endDateObj < startDateObj) {
          throw new ApiErrorResponse('VALIDATION_ERROR', 'End date must be after start date', 400);
        }
      }
      
      await db.collection('exams').doc(id).update(updateData);
      
      return await this.getExam(id);
    } catch (error: any) {
      logger.error('Update exam error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('UPDATE_FAILED', 'Failed to update exam', 500);
    }
  }

  async deleteExam(id: string): Promise<void> {
    try {
      const examDoc = await db.collection('exams').doc(id).get();
      
      if (!examDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Exam not found', 404);
      }
      
      // Check if exam has marks associated (optional - can be implemented later)
      // For now, just delete the exam
      
      await db.collection('exams').doc(id).delete();
    } catch (error: any) {
      logger.error('Delete exam error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('DELETE_FAILED', 'Failed to delete exam', 500);
    }
  }
}
