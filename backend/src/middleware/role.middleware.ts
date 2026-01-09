import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { USER_ROLES } from '../config/constants';
import { sendError } from '../utils/response';

type AllowedRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export function authorize(...allowedRoles: AllowedRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'AUTH_UNAUTHORIZED', 'Authentication required', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(res, 'AUTH_UNAUTHORIZED', 'Insufficient permissions', 403);
      return;
    }

    next();
  };
}

export const requireAdmin = authorize(USER_ROLES.ADMIN);
export const requireTeacher = authorize(USER_ROLES.TEACHER);
export const requireParent = authorize(USER_ROLES.PARENT);
export const requireAdminOrTeacher = authorize(USER_ROLES.ADMIN, USER_ROLES.TEACHER);
export const requireAny = authorize(USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.PARENT);


