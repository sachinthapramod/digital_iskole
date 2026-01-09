import { auth, db } from '../config/firebase';
import { Timestamp } from 'firebase-admin/firestore';
import { User } from '../types';
import { ApiErrorResponse } from '../utils/response';
import logger from '../utils/logger';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface LoginResult {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'teacher' | 'parent';
    phone?: string;
    profilePicture?: string;
    assignedClass?: string;
    children?: string[];
  };
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export class AuthService {
  async login(email: string, password: string): Promise<LoginResult> {
    try {
      // IMPORTANT: Firebase Admin SDK cannot verify passwords directly.
      // This endpoint expects the frontend to:
      // 1. Use Firebase Auth SDK to sign in with email/password
      // 2. Get the ID token from Firebase Auth
      // 3. Send the ID token to this endpoint for verification
      // 
      // Alternative: Use Firebase Auth REST API to verify credentials
      // For now, we'll get the user and create tokens assuming password is verified by frontend
      
      // Get user by email from Firebase Auth
      const userRecord = await auth.getUserByEmail(email);
      
      // Get user profile from Firestore
      const userDoc = await db.collection('users').doc(userRecord.uid).get();
      
      if (!userDoc.exists) {
        throw new ApiErrorResponse('AUTH_USER_NOT_FOUND', 'User profile not found', 404);
      }

      const userData = userDoc.data() as User;

      if (!userData.isActive) {
        throw new ApiErrorResponse('AUTH_ACCOUNT_INACTIVE', 'Account is inactive', 403);
      }

      // Generate JWT tokens
      const token = jwt.sign(
        { uid: userRecord.uid, email: userRecord.email, role: userData.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      const refreshToken = jwt.sign(
        { uid: userRecord.uid, type: 'refresh' },
        JWT_SECRET,
        { expiresIn: JWT_REFRESH_EXPIRES_IN }
      );

      // Update last login
      await db.collection('users').doc(userRecord.uid).update({
        lastLogin: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Get role-specific profile data
      let profileData: any = {};
      if (userData.role === 'teacher' && userData.profileId) {
        const teacherDoc = await db.collection('teachers').doc(userData.profileId).get();
        if (teacherDoc.exists) {
          const teacherData = teacherDoc.data();
          profileData.assignedClass = teacherData?.assignedClass;
        }
      } else if (userData.role === 'parent' && userData.profileId) {
        const parentDoc = await db.collection('parents').doc(userData.profileId).get();
        if (parentDoc.exists) {
          const parentData = parentDoc.data();
          profileData.children = parentData?.children || [];
        }
      }

      return {
        user: {
          id: userRecord.uid,
          email: userRecord.email || userData.email,
          name: userData.displayName,
          role: userData.role,
          phone: userData.phone,
          profilePicture: userData.photoURL,
          ...profileData,
        },
        token,
        refreshToken,
        expiresIn: 86400, // 24 hours in seconds
      };
    } catch (error: any) {
      logger.error('Login error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('AUTH_INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }
  }

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as any;
      
      if (decoded.type !== 'refresh') {
        throw new ApiErrorResponse('AUTH_TOKEN_INVALID', 'Invalid refresh token', 401);
      }

      // Get user data
      const userDoc = await db.collection('users').doc(decoded.uid).get();
      if (!userDoc.exists) {
        throw new ApiErrorResponse('AUTH_USER_NOT_FOUND', 'User not found', 404);
      }

      const userData = userDoc.data() as User;

      // Generate new access token
      const token = jwt.sign(
        { uid: decoded.uid, email: userData.email, role: userData.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return { token };
    } catch (error: any) {
      logger.error('Refresh token error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('AUTH_TOKEN_INVALID', 'Invalid refresh token', 401);
    }
  }

  async getCurrentUser(uid: string): Promise<any> {
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      throw new ApiErrorResponse('AUTH_USER_NOT_FOUND', 'User not found', 404);
    }

    const userData = userDoc.data() as User;

    // Get role-specific profile data
    let profileData: any = {};
    if (userData.role === 'teacher' && userData.profileId) {
      const teacherDoc = await db.collection('teachers').doc(userData.profileId).get();
      if (teacherDoc.exists) {
        const teacherData = teacherDoc.data();
        profileData.assignedClass = teacherData?.assignedClass;
      }
    } else if (userData.role === 'parent' && userData.profileId) {
      const parentDoc = await db.collection('parents').doc(userData.profileId).get();
      if (parentDoc.exists) {
        const parentData = parentDoc.data();
        profileData.children = parentData?.children || [];
      }
    }

    return {
      id: uid,
      email: userData.email,
      name: userData.displayName,
      role: userData.role,
      phone: userData.phone,
      profilePicture: userData.photoURL,
      ...profileData,
    };
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await auth.generatePasswordResetLink(email);
      // In production, send email with reset link
      logger.info(`Password reset link generated for ${email}`);
    } catch (error: any) {
      logger.error('Forgot password error:', error);
      // Don't reveal if email exists or not for security
      throw new ApiErrorResponse('AUTH_EMAIL_SENT', 'If the email exists, a password reset link has been sent', 200);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Verify token and reset password
      // This would typically involve verifying a reset token from email
      // For now, we'll use Firebase Auth's password reset
      logger.info('Password reset requested');
      // Implementation depends on your password reset flow
    } catch (error: any) {
      logger.error('Reset password error:', error);
      throw new ApiErrorResponse('AUTH_RESET_FAILED', 'Password reset failed', 400);
    }
  }

  async changePassword(uid: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Update password in Firebase Auth
      await auth.updateUser(uid, { password: newPassword });
      logger.info(`Password changed for user ${uid}`);
    } catch (error: any) {
      logger.error('Change password error:', error);
      throw new ApiErrorResponse('AUTH_PASSWORD_CHANGE_FAILED', 'Failed to change password', 400);
    }
  }

  async logout(uid: string): Promise<void> {
    // Revoke refresh tokens if stored
    // Firebase doesn't have built-in token revocation, so we might store tokens in Firestore
    logger.info(`User ${uid} logged out`);
  }
}

export default new AuthService();

