import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { MarksService } from '../services/marks.service';
import { sendSuccess, sendError } from '../utils/response';
import logger from '../utils/logger';

const marksService = new MarksService();

export class MarksController {
  async getMarksByExam(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { examId } = req.params;
      const { className, subjectId } = req.query;
      
      const marks = await marksService.getMarksByExam(
        examId,
        className as string | undefined,
        subjectId as string | undefined
      );
      
      sendSuccess(res, { marks }, 'Marks fetched successfully');
    } catch (error: any) {
      logger.error('Get marks by exam controller error:', error);
      next(error);
    }
  }

  async getStudentsForMarksEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { className } = req.query;
      
      if (!className) {
        sendError(res, 'VALIDATION_ERROR', 'className query parameter is required', 400);
        return;
      }
      
      const students = await marksService.getStudentsForMarksEntry(className as string);
      sendSuccess(res, { students }, 'Students fetched successfully');
    } catch (error: any) {
      logger.error('Get students for marks entry controller error:', error);
      next(error);
    }
  }

  async enterMarks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { examId, examName, className, subjectId, subjectName, totalMarks, marks } = req.body;
      
      if (!examId || !className || !subjectId || !subjectName || !totalMarks || !marks || !Array.isArray(marks)) {
        sendError(res, 'VALIDATION_ERROR', 'Missing required fields: examId, className, subjectId, subjectName, totalMarks, marks', 400);
        return;
      }

      if (!req.user) {
        sendError(res, 'AUTH_UNAUTHORIZED', 'User not authenticated', 401);
        return;
      }

      const result = await marksService.enterMarks({
        examId,
        examName: examName || 'Unknown Exam',
        className,
        subjectId,
        subjectName,
        totalMarks,
        marks,
        enteredBy: req.user.uid,
        enteredByName: req.user.email || 'Unknown',
      });
      
      sendSuccess(res, result, 'Marks entered successfully', 201);
    } catch (error: any) {
      logger.error('Enter marks controller error:', error);
      next(error);
    }
  }

  async updateMark(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { marks, remarks, totalMarks } = req.body;
      
      const updatedMark = await marksService.updateMark(id, {
        marks,
        remarks,
        totalMarks,
      });
      
      sendSuccess(res, { mark: updatedMark }, 'Mark updated successfully');
    } catch (error: any) {
      logger.error('Update mark controller error:', error);
      next(error);
    }
  }

  async getStudentMarks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { examId, subjectId } = req.query;
      
      const marks = await marksService.getStudentMarks(
        id,
        examId as string | undefined,
        subjectId as string | undefined
      );
      
      sendSuccess(res, { marks }, 'Student marks fetched successfully');
    } catch (error: any) {
      logger.error('Get student marks controller error:', error);
      next(error);
    }
  }
}

export default new MarksController();
