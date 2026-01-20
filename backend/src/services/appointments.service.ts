import { db } from '../config/firebase';
import { Timestamp } from 'firebase-admin/firestore';
import { ApiErrorResponse } from '../utils/response';
import { Appointment } from '../types/appointment.types';
import { NotificationsService } from './notifications.service';
import logger from '../utils/logger';

const notificationsService = new NotificationsService();

export class AppointmentsService {
  async getAppointments(userId: string, userRole: string): Promise<any[]> {
    try {
      let appointmentsSnapshot;
      
      if (userRole === 'parent') {
        // Get parent ID from user
        const parentDoc = await db.collection('parents')
          .where('userId', '==', userId)
          .limit(1)
          .get();
        
        if (parentDoc.empty) {
          return [];
        }
        
        const parentId = parentDoc.docs[0].id;
        appointmentsSnapshot = await db.collection('appointments')
          .where('parentId', '==', parentId)
          .get();
      } else if (userRole === 'teacher') {
        // Get teacher ID from user
        const teacherDoc = await db.collection('teachers')
          .where('userId', '==', userId)
          .limit(1)
          .get();
        
        if (teacherDoc.empty) {
          return [];
        }
        
        const teacherId = teacherDoc.docs[0].id;
        appointmentsSnapshot = await db.collection('appointments')
          .where('teacherId', '==', teacherId)
          .get();
      } else if (userRole === 'admin') {
        // Admin can see all appointments
        appointmentsSnapshot = await db.collection('appointments').get();
      } else {
        return [];
      }
      
      const appointments: any[] = [];
      
      for (const doc of appointmentsSnapshot.docs) {
        const appointmentData = doc.data() as Appointment;
        const date = appointmentData.date as Timestamp;
        const createdAt = appointmentData.createdAt as Timestamp;
        const updatedAt = appointmentData.updatedAt as Timestamp;
        
        appointments.push({
          id: doc.id,
          parentId: appointmentData.parentId,
          parentName: appointmentData.parentName,
          teacherId: appointmentData.teacherId,
          teacherName: appointmentData.teacherName,
          studentId: appointmentData.studentId,
          studentName: appointmentData.studentName,
          classId: appointmentData.classId,
          className: appointmentData.className,
          date: date ? date.toDate().toISOString().split('T')[0] : '',
          time: appointmentData.time || '',
          reason: appointmentData.reason || '',
          status: appointmentData.status || 'pending',
          rejectionReason: appointmentData.rejectionReason,
          notes: appointmentData.notes,
          createdAt: createdAt ? createdAt.toDate().toISOString() : '',
          updatedAt: updatedAt ? updatedAt.toDate().toISOString() : '',
        });
      }
      
      // Sort by date descending (newest first)
      appointments.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      });
      
      return appointments;
    } catch (error: any) {
      logger.error('Get appointments error:', error);
      throw new ApiErrorResponse('FETCH_FAILED', 'Failed to fetch appointments', 500);
    }
  }

  async getAppointment(id: string, userId: string, userRole: string): Promise<any> {
    try {
      const appointmentDoc = await db.collection('appointments').doc(id).get();
      
      if (!appointmentDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Appointment not found', 404);
      }
      
      const appointmentData = appointmentDoc.data() as Appointment;
      
      // Check authorization
      if (userRole === 'parent') {
        const parentDoc = await db.collection('parents')
          .where('userId', '==', userId)
          .limit(1)
          .get();
        
        if (parentDoc.empty || parentDoc.docs[0].id !== appointmentData.parentId) {
          throw new ApiErrorResponse('AUTH_UNAUTHORIZED', 'Not authorized to view this appointment', 403);
        }
      } else if (userRole === 'teacher') {
        const teacherDoc = await db.collection('teachers')
          .where('userId', '==', userId)
          .limit(1)
          .get();
        
        if (teacherDoc.empty || teacherDoc.docs[0].id !== appointmentData.teacherId) {
          throw new ApiErrorResponse('AUTH_UNAUTHORIZED', 'Not authorized to view this appointment', 403);
        }
      }
      
      const date = appointmentData.date as Timestamp;
      const createdAt = appointmentData.createdAt as Timestamp;
      const updatedAt = appointmentData.updatedAt as Timestamp;
      
      return {
        id: appointmentDoc.id,
        parentId: appointmentData.parentId,
        parentName: appointmentData.parentName,
        teacherId: appointmentData.teacherId,
        teacherName: appointmentData.teacherName,
        studentId: appointmentData.studentId,
        studentName: appointmentData.studentName,
        classId: appointmentData.classId,
        className: appointmentData.className,
        date: date ? date.toDate().toISOString().split('T')[0] : '',
        time: appointmentData.time || '',
        reason: appointmentData.reason || '',
        status: appointmentData.status || 'pending',
        rejectionReason: appointmentData.rejectionReason,
        notes: appointmentData.notes,
        createdAt: createdAt ? createdAt.toDate().toISOString() : '',
        updatedAt: updatedAt ? updatedAt.toDate().toISOString() : '',
      };
    } catch (error: any) {
      logger.error('Get appointment error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('FETCH_FAILED', 'Failed to fetch appointment', 500);
    }
  }

  async createAppointment(data: {
    studentId: string;
    date: string;
    time: string;
    reason: string;
    parentId: string;
  }): Promise<any> {
    try {
      // Validate input
      if (!data.studentId || !data.date || !data.time || !data.reason) {
        throw new ApiErrorResponse('VALIDATION_ERROR', 'Student, date, time, and reason are required', 400);
      }

      // Get student details
      const studentDoc = await db.collection('students').doc(data.studentId).get();
      if (!studentDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Student not found', 404);
      }

      const studentData = studentDoc.data();
      const classId = studentData?.classId;
      const className = studentData?.className;

      if (!classId || !className) {
        throw new ApiErrorResponse('VALIDATION_ERROR', 'Student is not assigned to a class', 400);
      }

      // Get class details to find class teacher
      // Try to find class by ID first, then by name if ID doesn't work
      let classDoc = await db.collection('classes').doc(classId).get();
      
      // If class not found by ID, try to find by name (for backwards compatibility)
      if (!classDoc.exists) {
        const classesSnapshot = await db.collection('classes')
          .where('name', '==', className)
          .limit(1)
          .get();
        
        if (!classesSnapshot.empty) {
          classDoc = classesSnapshot.docs[0];
          // Update student's classId to the correct document ID for future use
          try {
            await db.collection('students').doc(data.studentId).update({
              classId: classDoc.id,
              updatedAt: Timestamp.now(),
            });
          } catch (updateError: any) {
            logger.warn('Failed to update student classId:', updateError);
          }
        }
      }
      
      if (!classDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', `Class "${className}" not found. Please ensure the student is assigned to a valid class.`, 404);
      }

      const classData = classDoc.data();
      const teacherId = classData?.classTeacherId;

      if (!teacherId) {
        throw new ApiErrorResponse('VALIDATION_ERROR', 'No class teacher assigned to this class', 400);
      }

      // Get teacher details
      const teacherDoc = await db.collection('teachers').doc(teacherId).get();
      if (!teacherDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Teacher not found', 404);
      }

      const teacherData = teacherDoc.data();
      const teacherUserId = teacherData?.userId;

      // Get parent details and verify student belongs to parent
      const parentDoc = await db.collection('parents').doc(data.parentId).get();
      if (!parentDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Parent not found', 404);
      }

      const parentData = parentDoc.data();
      const parentName = parentData?.fullName || parentData?.nameWithInitials || '';
      
      // Verify student belongs to the parent
      const parentChildren = parentData?.children || [];
      if (!parentChildren.includes(data.studentId)) {
        throw new ApiErrorResponse('VALIDATION_ERROR', 'This student does not belong to you', 403);
      }

      // Validate date
      const appointmentDate = new Date(data.date);
      if (isNaN(appointmentDate.getTime())) {
        throw new ApiErrorResponse('VALIDATION_ERROR', 'Invalid date format', 400);
      }

      // Create appointment
      const appointmentData: Omit<Appointment, 'id'> = {
        parentId: data.parentId,
        parentName,
        teacherId,
        teacherName: teacherData?.fullName || teacherData?.nameWithInitials || '',
        studentId: data.studentId,
        studentName: studentData?.fullName || '',
        classId,
        className,
        date: Timestamp.fromDate(appointmentDate),
        time: data.time,
        reason: data.reason,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const appointmentRef = await db.collection('appointments').add(appointmentData);

      // Create notification for teacher
      if (teacherUserId) {
        try {
          await notificationsService.createNotification({
            userId: teacherUserId,
            type: 'appointment',
            title: 'New Appointment Request',
            message: `${parentName} has requested an appointment regarding ${studentData?.fullName || ''}`,
            link: '/dashboard/appointments',
            data: { appointmentId: appointmentRef.id },
            priority: 'normal',
          });
        } catch (notifError: any) {
          logger.error('Failed to create notification for appointment:', notifError);
        }
      }

      const date = appointmentData.date as Timestamp;
      const createdAt = appointmentData.createdAt as Timestamp;
      const updatedAt = appointmentData.updatedAt as Timestamp;

      return {
        id: appointmentRef.id,
        parentId: appointmentData.parentId,
        parentName: appointmentData.parentName,
        teacherId: appointmentData.teacherId,
        teacherName: appointmentData.teacherName,
        studentId: appointmentData.studentId,
        studentName: appointmentData.studentName,
        classId: appointmentData.classId,
        className: appointmentData.className,
        date: date ? date.toDate().toISOString().split('T')[0] : '',
        time: appointmentData.time,
        reason: appointmentData.reason,
        status: appointmentData.status,
        createdAt: createdAt ? createdAt.toDate().toISOString() : '',
        updatedAt: updatedAt ? updatedAt.toDate().toISOString() : '',
      };
    } catch (error: any) {
      logger.error('Create appointment error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('CREATE_FAILED', 'Failed to create appointment', 500);
    }
  }

  async updateAppointmentStatus(id: string, status: 'approved' | 'rejected' | 'completed', userId: string, userRole: string, rejectionReason?: string): Promise<any> {
    try {
      if (userRole !== 'teacher' && userRole !== 'admin') {
        throw new ApiErrorResponse('AUTH_UNAUTHORIZED', 'Only teachers and admins can update appointment status', 403);
      }

      const appointmentDoc = await db.collection('appointments').doc(id).get();
      
      if (!appointmentDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Appointment not found', 404);
      }

      const appointmentData = appointmentDoc.data() as Appointment;

      // Verify teacher authorization (unless admin)
      if (userRole === 'teacher') {
        const teacherDoc = await db.collection('teachers')
          .where('userId', '==', userId)
          .limit(1)
          .get();
        
        if (teacherDoc.empty || teacherDoc.docs[0].id !== appointmentData.teacherId) {
          throw new ApiErrorResponse('AUTH_UNAUTHORIZED', 'Not authorized to update this appointment', 403);
        }
      }

      const updateData: any = {
        status,
        updatedAt: Timestamp.now(),
      };

      if (status === 'rejected' && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }

      await db.collection('appointments').doc(id).update(updateData);

      // Create notification for parent
      try {
        const parentDoc = await db.collection('parents').doc(appointmentData.parentId).get();
        if (parentDoc.exists) {
          const parentData = parentDoc.data();
          const parentUserId = parentData?.userId;
          
          if (parentUserId) {
            let message = '';
            if (status === 'approved') {
              message = `Your appointment with ${appointmentData.teacherName} has been approved for ${appointmentData.time}`;
            } else if (status === 'rejected') {
              message = `Your appointment request has been rejected. ${rejectionReason || ''}`;
            } else if (status === 'completed') {
              message = `Your appointment with ${appointmentData.teacherName} has been marked as completed`;
            }

            await notificationsService.createNotification({
              userId: parentUserId,
              type: 'appointment',
              title: status === 'approved' ? 'Appointment Approved' : status === 'rejected' ? 'Appointment Rejected' : 'Appointment Completed',
              message,
              link: '/dashboard/appointments',
              data: { appointmentId: id },
              priority: status === 'approved' ? 'high' : 'normal',
            });
          }
        }
      } catch (notifError: any) {
        logger.error('Failed to create notification for appointment status update:', notifError);
      }

      const updatedDoc = await db.collection('appointments').doc(id).get();
      const updatedData = updatedDoc.data() as Appointment;
      const date = updatedData.date as Timestamp;
      const createdAt = updatedData.createdAt as Timestamp;
      const updatedAt = updatedData.updatedAt as Timestamp;

      return {
        id: updatedDoc.id,
        parentId: updatedData.parentId,
        parentName: updatedData.parentName,
        teacherId: updatedData.teacherId,
        teacherName: updatedData.teacherName,
        studentId: updatedData.studentId,
        studentName: updatedData.studentName,
        classId: updatedData.classId,
        className: updatedData.className,
        date: date ? date.toDate().toISOString().split('T')[0] : '',
        time: updatedData.time,
        reason: updatedData.reason,
        status: updatedData.status,
        rejectionReason: updatedData.rejectionReason,
        notes: updatedData.notes,
        createdAt: createdAt ? createdAt.toDate().toISOString() : '',
        updatedAt: updatedAt ? updatedAt.toDate().toISOString() : '',
      };
    } catch (error: any) {
      logger.error('Update appointment status error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('UPDATE_FAILED', 'Failed to update appointment status', 500);
    }
  }

  async cancelAppointment(id: string, userId: string, userRole: string): Promise<void> {
    try {
      if (userRole !== 'parent') {
        throw new ApiErrorResponse('AUTH_UNAUTHORIZED', 'Only parents can cancel appointments', 403);
      }

      const appointmentDoc = await db.collection('appointments').doc(id).get();
      
      if (!appointmentDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Appointment not found', 404);
      }

      const appointmentData = appointmentDoc.data() as Appointment;

      // Verify parent authorization
      const parentDoc = await db.collection('parents')
        .where('userId', '==', userId)
        .limit(1)
        .get();
      
      if (parentDoc.empty || parentDoc.docs[0].id !== appointmentData.parentId) {
        throw new ApiErrorResponse('AUTH_UNAUTHORIZED', 'Not authorized to cancel this appointment', 403);
      }

      if (appointmentData.status === 'completed') {
        throw new ApiErrorResponse('VALIDATION_ERROR', 'Cannot cancel a completed appointment', 400);
      }

      await db.collection('appointments').doc(id).update({
        status: 'cancelled',
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      logger.error('Cancel appointment error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('UPDATE_FAILED', 'Failed to cancel appointment', 500);
    }
  }

  async getPendingCount(userId: string, userRole: string): Promise<number> {
    try {
      let appointmentsSnapshot;
      
      if (userRole === 'teacher') {
        const teacherDoc = await db.collection('teachers')
          .where('userId', '==', userId)
          .limit(1)
          .get();
        
        if (teacherDoc.empty) {
          return 0;
        }
        
        const teacherId = teacherDoc.docs[0].id;
        appointmentsSnapshot = await db.collection('appointments')
          .where('teacherId', '==', teacherId)
          .where('status', '==', 'pending')
          .get();
      } else if (userRole === 'admin') {
        appointmentsSnapshot = await db.collection('appointments')
          .where('status', '==', 'pending')
          .get();
      } else {
        return 0;
      }
      
      return appointmentsSnapshot.size;
    } catch (error: any) {
      logger.error('Get pending count error:', error);
      return 0;
    }
  }
}
