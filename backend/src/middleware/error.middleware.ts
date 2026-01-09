import { Request, Response, NextFunction } from 'express';
import { ApiErrorResponse, sendError } from '../utils/response';
import logger from '../utils/logger';

export function errorHandler(
  err: Error | ApiErrorResponse,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error('Error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof ApiErrorResponse) {
    sendError(res, err.code, err.message, err.statusCode, err.details);
    return;
  }

  // Handle validation errors from express-validator
  if (err.name === 'ValidationError' || (err as any).errors) {
    const validationErrors = (err as any).errors || [];
    const details: Record<string, string[]> = {};
    
    validationErrors.forEach((error: any) => {
      const field = error.param || error.path || 'unknown';
      if (!details[field]) {
        details[field] = [];
      }
      details[field].push(error.msg || error.message);
    });

    sendError(res, 'VALIDATION_ERROR', 'Validation failed', 400, details);
    return;
  }

  // Default error
  sendError(res, 'INTERNAL_SERVER_ERROR', err.message || 'An unexpected error occurred', 500);
}

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, 'RESOURCE_NOT_FOUND', `Route ${req.method} ${req.path} not found`, 404);
}


