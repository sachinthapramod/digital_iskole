import { Request, Response, NextFunction } from 'express';
import { auth, db } from '../config/firebase';
import { sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import logger from '../utils/logger';

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
      const decodedToken = await auth.verifyIdToken(token);
      
      // Get user document from Firestore to get role and profileId
      const userDoc = await db.collection('users').doc(decodedToken.uid).get();
      
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
        uid: decodedToken.uid,
        email: decodedToken.email || userData.email,
        role: userData.role,
        profileId: userData.profileId,
      };

      next();
    } catch (error: any) {
      logger.error('Token verification failed:', error);
      
      if (error.code === 'auth/id-token-expired') {
        sendError(res, 'AUTH_TOKEN_EXPIRED', 'Token has expired', 401);
      } else {
        sendError(res, 'AUTH_TOKEN_INVALID', 'Invalid token', 401);
      }
    }
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    sendError(res, 'INTERNAL_SERVER_ERROR', 'Authentication failed', 500);
  }
}


