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
      const data = report.data;

      let html: string | null = null;
      let filename: string | null = null;

      if (report.type === 'student') {
        const built = buildStudentReportHtml(data);
        html = built.html;
        filename = built.filename;
      } else if (report.type === 'class') {
        const built = buildClassReportHtml(data);
        html = built.html;
        filename = built.filename;
      } else if (report.type === 'school') {
        const built = buildSchoolReportHtml(data);
        html = built.html;
        filename = built.filename;
      }

      if (!html) {
        sendError(res, 'VALIDATION_ERROR', 'PDF download is not available for this report type', 400);
        return;
      }

      const pdfBuffer = await renderHtmlToPdfBuffer(html);

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

      // For now, only admin can generate via this endpoint (admin reports screen)
      if (req.user.role !== 'admin') {
        sendError(res, 'AUTH_UNAUTHORIZED', 'Only admins can generate reports here', 403);
        return;
      }

      const { studentId, term, reportType } = req.body;
      if (!studentId) {
        sendError(res, 'VALIDATION_ERROR', 'studentId is required', 400);
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

      if (req.user.role !== 'admin') {
        sendError(res, 'AUTH_UNAUTHORIZED', 'Only admins can generate reports here', 403);
        return;
      }

      const { classId, term, reportType } = req.body;
      if (!classId) {
        sendError(res, 'VALIDATION_ERROR', 'classId is required', 400);
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

