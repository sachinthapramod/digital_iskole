import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import reportsService from '../services/reports.service';
import { sendSuccess, sendError } from '../utils/response';
import logger from '../utils/logger';
import { buildStudentReportHtml, buildClassReportHtml, buildSchoolReportHtml, renderHtmlToPdfBuffer } from '../utils/reportsPdf';

export class ReportsController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'AUTH_UNAUTHORIZED', 'User not authenticated', 401);
        return;
      }

      // Admin can list all reports; others see their own
      const reports =
        req.user.role === 'admin'
          ? await reportsService.listReportsForAdmin()
          : await reportsService.listReportsForUser(req.user.uid);

      sendSuccess(res, { reports }, 'Reports fetched successfully');
    } catch (error: any) {
      logger.error('List reports controller error:', error);
      next(error);
    }
  }

  async my(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'AUTH_UNAUTHORIZED', 'User not authenticated', 401);
        return;
      }

      const reports = await reportsService.listReportsForUser(req.user.uid);
      sendSuccess(res, { reports }, 'My reports fetched successfully');
    } catch (error: any) {
      logger.error('My reports controller error:', error);
      next(error);
    }
  }

  async get(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'AUTH_UNAUTHORIZED', 'User not authenticated', 401);
        return;
      }

      const { id } = req.params;
      const report = await reportsService.getReport(id, req.user.uid, req.user.role);
      sendSuccess(res, { report }, 'Report fetched successfully');
    } catch (error: any) {
      logger.error('Get report controller error:', error);
      next(error);
    }
  }

  async download(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'AUTH_UNAUTHORIZED', 'User not authenticated', 401);
        return;
      }

      const { id } = req.params;
      const report = await reportsService.getReport(id, req.user.uid, req.user.role);
      const data = report.data ?? null;

      let html: string | null = null;
      let filename: string | null = null;

      if (report.type === 'student') {
        const built = buildStudentReportHtml(data || {});
        html = built.html;
        filename = built.filename;
      } else if (report.type === 'class') {
        const built = buildClassReportHtml(data || {});
        html = built.html;
        filename = built.filename;
      } else if (report.type === 'school') {
        const built = buildSchoolReportHtml(data || {});
        html = built.html;
        filename = built.filename;
      }

      if (!html) {
        sendError(res, 'VALIDATION_ERROR', 'PDF download is not available for this report type', 400);
        return;
      }

      let pdfBuffer: Buffer;
      try {
        pdfBuffer = await renderHtmlToPdfBuffer(html);
      } catch (pdfError: any) {
        logger.error('PDF generation failed:', pdfError?.message || pdfError);
        sendError(
          res,
          'SERVICE_UNAVAILABLE',
          'PDF generation failed. Please try again or contact support.',
          503
        );
        return;
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename || `report-${id}.pdf`}"`);
      res.status(200).send(pdfBuffer);
    } catch (error: any) {
      logger.error('Download report controller error:', error);
      next(error);
    }
  }

  async remove(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'AUTH_UNAUTHORIZED', 'User not authenticated', 401);
        return;
      }

      const { id } = req.params;
      await reportsService.deleteReport(id, req.user.uid, req.user.role);
      sendSuccess(res, {}, 'Report deleted successfully');
    } catch (error: any) {
      logger.error('Delete report controller error:', error);
      next(error);
    }
  }

  async generateStudent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'AUTH_UNAUTHORIZED', 'User not authenticated', 401);
        return;
      }

      const { studentId, term, reportType } = req.body;
      if (!studentId) {
        sendError(res, 'VALIDATION_ERROR', 'studentId is required', 400);
        return;
      }

      // Authorization: Admin can generate for any student, parents/teachers only for their own
      if (req.user.role === 'parent') {
        // Verify the student belongs to this parent
        const { db } = await import('../config/firebase');
        const studentDoc = await db.collection('students').doc(studentId).get();
        if (!studentDoc.exists) {
          sendError(res, 'NOT_FOUND', 'Student not found', 404);
          return;
        }
        const studentData = studentDoc.data() as any;
        const parentDoc = await db.collection('parents').where('userId', '==', req.user.uid).limit(1).get();
        if (parentDoc.empty) {
          sendError(res, 'AUTH_UNAUTHORIZED', 'Parent profile not found', 403);
          return;
        }
        const parentData = parentDoc.docs[0].data();
        const parentId = parentDoc.docs[0].id;
        
        // Check if student's parentId matches or if student is in parent's children array
        if (studentData.parentId !== parentId && !parentData.children?.includes(studentId)) {
          sendError(res, 'AUTH_UNAUTHORIZED', 'You can only generate reports for your own children', 403);
          return;
        }
      } else if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
        sendError(res, 'AUTH_UNAUTHORIZED', 'Only admins, teachers, and parents can generate reports', 403);
        return;
      }

      const report = await reportsService.generateStudentReport({
        studentId,
        term,
        reportType,
        createdBy: req.user.uid,
        createdByRole: req.user.role,
      });

      sendSuccess(res, { report }, 'Student report generated successfully', 201);
    } catch (error: any) {
      logger.error('Generate student report controller error:', error);
      next(error);
    }
  }

  async generateClass(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'AUTH_UNAUTHORIZED', 'User not authenticated', 401);
        return;
      }

      const { classId, term, reportType } = req.body;
      if (!classId) {
        sendError(res, 'VALIDATION_ERROR', 'classId is required', 400);
        return;
      }

      // Authorization: Admin can generate for any class, teachers only for their assigned class
      if (req.user.role === 'teacher') {
        const { db } = await import('../config/firebase');
        // Get teacher's assigned class
        const teacherDoc = await db.collection('teachers').where('userId', '==', req.user.uid).limit(1).get();
        if (teacherDoc.empty) {
          sendError(res, 'NOT_FOUND', 'Teacher profile not found', 404);
          return;
        }
        const teacherData = teacherDoc.docs[0].data();
        const assignedClassName = teacherData?.assignedClass;
        
        // Get class name from classId
        const classDoc = await db.collection('classes').doc(classId).get();
        if (!classDoc.exists) {
          sendError(res, 'NOT_FOUND', 'Class not found', 404);
          return;
        }
        const classData = classDoc.data();
        const className = classData?.name;
        
        // Verify teacher is assigned to this class
        if (assignedClassName !== className) {
          sendError(res, 'AUTH_UNAUTHORIZED', 'You can only generate reports for your assigned class', 403);
          return;
        }
      } else if (req.user.role !== 'admin') {
        sendError(res, 'AUTH_UNAUTHORIZED', 'Only admins and teachers can generate class reports', 403);
        return;
      }

      const report = await reportsService.generateClassReport({
        classId,
        term,
        reportType,
        createdBy: req.user.uid,
        createdByRole: req.user.role,
      });

      sendSuccess(res, { report }, 'Class report generated successfully', 201);
    } catch (error: any) {
      logger.error('Generate class report controller error:', error);
      next(error);
    }
  }

  async generateSchool(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'AUTH_UNAUTHORIZED', 'User not authenticated', 401);
        return;
      }

      if (req.user.role !== 'admin') {
        sendError(res, 'AUTH_UNAUTHORIZED', 'Only admins can generate reports here', 403);
        return;
      }

      const { term, reportType } = req.body;

      const report = await reportsService.generateSchoolReport({
        term,
        reportType,
        createdBy: req.user.uid,
        createdByRole: req.user.role,
      });

      sendSuccess(res, { report }, 'School report generated successfully', 201);
    } catch (error: any) {
      logger.error('Generate school report controller error:', error);
      next(error);
    }
  }
}

export default new ReportsController();

