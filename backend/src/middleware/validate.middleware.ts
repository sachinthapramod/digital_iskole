import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { sendError } from '../utils/response';

export function validate(validations: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const details: Record<string, string[]> = {};
      errors.array().forEach((error) => {
        const field = error.type === 'field' ? error.path : 'unknown';
        if (!details[field]) {
          details[field] = [];
        }
        details[field].push(error.msg);
      });

      sendError(res, 'VALIDATION_ERROR', 'Validation failed', 400, details);
      return;
    }

    next();
  };
}


