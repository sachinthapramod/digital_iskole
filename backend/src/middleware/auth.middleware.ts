import { Response, NextFunction } from 'express';
import { db } from '../config/firebase';
import { sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import logger from '../utils/logger';
import jwt from 'jsonwebtoken';

// JWT_SECRET is loaded from .env in app.ts via dotenv.config()
// Using same default as auth.service.ts for consistency
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'AUTH_TOKEN_INVALID', 'Authorization token required', 401);
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      // Verify JWT token (not Firebase ID token)
      // Note: If JWT_SECRET is 'your-secret-key', this is a security issue in production
      if (JWT_SECRET === 'your-secret-key') {
        logger.warn('WARNING: Using default JWT_SECRET. Set a secure secret in .env for production!');
      }
      
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      if (!decoded.uid) {
        sendError(res, 'AUTH_TOKEN_INVALID', 'Invalid token payload', 401);
        return;
      }
      
      // Get user document from Firestore to get role and profileId
      const userDoc = await db.collection('users').doc(decoded.uid).get();
      
      if (!userDoc.exists) {
        sendError(res, 'AUTH_USER_NOT_FOUND', 'User profile not found', 401);
        return;
      }

      const userData = userDoc.data();
      
      if (!userData?.isActive) {
        sendError(res, 'AUTH_ACCOUNT_INACTIVE', 'Account is inactive', 403);
        return;
      }

      req.user = {
        uid: decoded.uid,
        email: decoded.email || userData.email,
        role: userData.role,
        profileId: userData.profileId,
      };

      next();
    } catch (error: any) {
      logger.error('Token verification failed:', error);
      
      if (error.name === 'TokenExpiredError') {
        sendError(res, 'AUTH_TOKEN_EXPIRED', 'Token has expired', 401);
      } else if (error.name === 'JsonWebTokenError') {
        sendError(res, 'AUTH_TOKEN_INVALID', 'Invalid token', 401);
      } else {
        sendError(res, 'AUTH_TOKEN_INVALID', 'Token verification failed', 401);
      }
    }
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    sendError(res, 'INTERNAL_SERVER_ERROR', 'Authentication failed', 500);
  }
}


