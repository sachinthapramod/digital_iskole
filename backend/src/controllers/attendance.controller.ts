import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { AttendanceService } from '../services/attendance.service';
import { sendSuccess, sendError } from '../utils/response';
import logger from '../utils/logger';
import { db } from '../config/firebase';

const attendanceService = new AttendanceService();

export class AttendanceController {
  async getStudentsByClass(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { className } = req.query;
      
      if (!className || typeof className !== 'string') {
        sendError(res, 'VALIDATION_ERROR', 'Class name is required', 400);
        return;
      }

      const students = await attendanceService.getStudentsByClass(className);
      sendSuccess(res, { students }, 'Students fetched successfully');
    } catch (error: any) {
      logger.error('Get students by class controller error:', error);
      next(error);
    }
  }

  async getAttendanceByClassAndDate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { className, date } = req.query;
      
      if (!className || typeof className !== 'string') {
        sendError(res, 'VALIDATION_ERROR', 'Class name is required', 400);
        return;
      }
      
      if (!date || typeof date !== 'string') {
        sendError(res, 'VALIDATION_ERROR', 'Date is required', 400);
        return;
      }

      const attendance = await attendanceService.getAttendanceByClassAndDate(className, date);
      sendSuccess(res, { attendance }, 'Attendance fetched successfully');
    } catch (error: any) {
      logger.error('Get attendance by class and date controller error:', error);
      next(error);
    }
  }

  async markAttendance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentId, className, date, status, remarks } = req.body;
      
      if (!studentId || !className || !date || !status) {
        sendError(res, 'VALIDATION_ERROR', 'Missing required fields: studentId, className, date, status', 400);
        return;
      }

      if (!['present', 'absent', 'late'].includes(status)) {
        sendError(res, 'VALIDATION_ERROR', 'Invalid status. Must be: present, absent, or late', 400);
        return;
      }

      if (!req.user) {
        sendError(res, 'AUTH_UNAUTHORIZED', 'User not authenticated', 401);
        return;
      }

      const attendance = await attendanceService.markAttendance({
        studentId,
        className,
        date,
        status,
        markedBy: req.user.uid,
        markedByName: req.user.email || 'Unknown',
        remarks,
      });
      
      sendSuccess(res, { attendance }, 'Attendance marked successfully', 201);
    } catch (error: any) {
      logger.error('Mark attendance controller error:', error);
      next(error);
    }
  }

  async markBulkAttendance(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { className, date, attendance } = req.body;
      
      if (!className || !date || !attendance || !Array.isArray(attendance)) {
        sendError(res, 'VALIDATION_ERROR', 'Missing required fields: className, date, attendance (array)', 400);
        return;
      }

      if (!req.user) {
        sendError(res, 'AUTH_UNAUTHORIZED', 'User not authenticated', 401);
        return;
      }

      const result = await attendanceService.markBulkAttendance({
        className,
        date,
        attendance,
        markedBy: req.user.uid,
        markedByName: req.user.email || 'Unknown',
      });
      
      sendSuccess(res, result, 'Attendance marked successfully', 201);
    } catch (error: any) {
      logger.error('Mark bulk attendance controller error:', error);
      next(error);
    }
  }

  async getAttendanceStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentId } = req.params;
      
      const stats = await attendanceService.getAttendanceStats(studentId);
      sendSuccess(res, { stats }, 'Attendance stats fetched successfully');
    } catch (error: any) {
      logger.error('Get attendance stats controller error:', error);
      next(error);
    }
  }

  async getStudentAttendanceHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentId } = req.params;
      const { startDate, endDate } = req.query;

      if (!req.user) {
        sendError(res, 'AUTH_UNAUTHORIZED', 'User not authenticated', 401);
        return;
      }

      // Verify that the user has access to this student
      // Parents can only view their own children's attendance
      if (req.user.role === 'parent') {
        const studentDoc = await db.collection('students').doc(studentId).get();
        if (!studentDoc.exists) {
          sendError(res, 'NOT_FOUND', 'Student not found', 404);
          return;
        }

        // Check if this student belongs to the parent
        const parentDoc = await db.collection('parents')
          .where('userId', '==', req.user.uid)
          .limit(1)
          .get();

        if (parentDoc.empty) {
          sendError(res, 'AUTH_UNAUTHORIZED', 'Parent profile not found', 403);
          return;
        }

        const parentData = parentDoc.docs[0].data();
        if (!parentData.childrenIds || !parentData.childrenIds.includes(studentId)) {
          sendError(res, 'AUTH_UNAUTHORIZED', 'You do not have access to this student', 403);
          return;
        }
      }

      const history = await attendanceService.getStudentAttendanceHistory(
        studentId,
        startDate as string | undefined,
        endDate as string | undefined
      );
      sendSuccess(res, { history }, 'Attendance history fetched successfully');
    } catch (error: any) {
      logger.error('Get student attendance history controller error:', error);
      next(error);
    }
  }

  async getAttendanceHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { className, startDate, endDate } = req.query;
      
      if (!className || typeof className !== 'string') {
        sendError(res, 'VALIDATION_ERROR', 'Class name is required', 400);
        return;
      }
      
      if (!startDate || typeof startDate !== 'string') {
        sendError(res, 'VALIDATION_ERROR', 'Start date is required', 400);
        return;
      }
      
      if (!endDate || typeof endDate !== 'string') {
        sendError(res, 'VALIDATION_ERROR', 'End date is required', 400);
        return;
      }

      const history = await attendanceService.getAttendanceHistory(className, startDate, endDate);
      sendSuccess(res, { history }, 'Attendance history fetched successfully');
    } catch (error: any) {
      logger.error('Get attendance history controller error:', error);
      next(error);
    }
  }
}

export default new AttendanceController();
