import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { AppointmentsService } from '../services/appointments.service';
import { sendSuccess, sendError } from '../utils/response';
import { db } from '../config/firebase';
import logger from '../utils/logger';

const appointmentsService = new AppointmentsService();

export class AppointmentsController {
  async getAppointments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'AUTH_UNAUTHORIZED', 'User not authenticated', 401);
        return;
      }

      const appointments = await appointmentsService.getAppointments(req.user.uid, req.user.role);
      sendSuccess(res, { appointments }, 'Appointments fetched successfully');
    } catch (error: any) {
      logger.error('Get appointments controller error:', error);
      next(error);
    }
  }

  async getAppointment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'AUTH_UNAUTHORIZED', 'User not authenticated', 401);
        return;
      }

      const { id } = req.params;
      const appointment = await appointmentsService.getAppointment(id, req.user.uid, req.user.role);
      sendSuccess(res, { appointment }, 'Appointment fetched successfully');
    } catch (error: any) {
      logger.error('Get appointment controller error:', error);
      next(error);
    }
  }

  async createAppointment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'AUTH_UNAUTHORIZED', 'User not authenticated', 401);
        return;
      }

      if (req.user.role !== 'parent') {
        sendError(res, 'AUTH_UNAUTHORIZED', 'Only parents can create appointments', 403);
        return;
      }

      const { studentId, date, time, reason } = req.body;

      if (!studentId || !date || !time || !reason) {
        sendError(res, 'VALIDATION_ERROR', 'Student, date, time, and reason are required', 400);
        return;
      }

      // Get parent ID from user
      const parentDoc = await db.collection('parents')
        .where('userId', '==', req.user.uid)
        .limit(1)
        .get();

      if (parentDoc.empty) {
        sendError(res, 'NOT_FOUND', 'Parent profile not found', 404);
        return;
      }

      const parentId = parentDoc.docs[0].id;

      const appointment = await appointmentsService.createAppointment({
        studentId,
        date,
        time,
        reason,
        parentId,
      });

      sendSuccess(res, { appointment }, 'Appointment created successfully');
    } catch (error: any) {
      logger.error('Create appointment controller error:', error);
      next(error);
    }
  }

  async updateAppointmentStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'AUTH_UNAUTHORIZED', 'User not authenticated', 401);
        return;
      }

      const { id } = req.params;
      const { status, rejectionReason } = req.body;

      if (!status || !['approved', 'rejected', 'completed'].includes(status)) {
        sendError(res, 'VALIDATION_ERROR', 'Valid status (approved, rejected, completed) is required', 400);
        return;
      }

      const appointment = await appointmentsService.updateAppointmentStatus(
        id,
        status as 'approved' | 'rejected' | 'completed',
        req.user.uid,
        req.user.role,
        rejectionReason
      );

      sendSuccess(res, { appointment }, 'Appointment status updated successfully');
    } catch (error: any) {
      logger.error('Update appointment status controller error:', error);
      next(error);
    }
  }

  async cancelAppointment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'AUTH_UNAUTHORIZED', 'User not authenticated', 401);
        return;
      }

      const { id } = req.params;

      await appointmentsService.cancelAppointment(id, req.user.uid, req.user.role);
      sendSuccess(res, {}, 'Appointment cancelled successfully');
    } catch (error: any) {
      logger.error('Cancel appointment controller error:', error);
      next(error);
    }
  }

  async getPendingCount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'AUTH_UNAUTHORIZED', 'User not authenticated', 401);
        return;
      }

      const count = await appointmentsService.getPendingCount(req.user.uid, req.user.role);
      sendSuccess(res, { count }, 'Pending count fetched successfully');
    } catch (error: any) {
      logger.error('Get pending count controller error:', error);
      next(error);
    }
  }
}

export default new AppointmentsController();
