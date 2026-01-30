import { auth, db } from '../config/firebase';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { User } from '../types';
import { ApiErrorResponse } from '../utils/response';
import logger from '../utils/logger';
import jwt, { SignOptions } from 'jsonwebtoken';

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
    address?: string;
    assignedClass?: string;
    children?: string[];
  };
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export class AuthService {
  private generateInitials(name: string): string {
    const parts = (name || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return (parts[0] || '').substring(0, 2).toUpperCase();
  }

  async login(email: string, password: string): Promise<LoginResult> {
    try {
      // Use Firebase Auth REST API to verify credentials
      const FIREBASE_WEB_API_KEY = process.env.FIREBASE_WEB_API_KEY?.trim();
      
      if (!FIREBASE_WEB_API_KEY || FIREBASE_WEB_API_KEY === '') {
        logger.error('FIREBASE_WEB_API_KEY is not configured', {
          exists: !!process.env.FIREBASE_WEB_API_KEY,
          value: process.env.FIREBASE_WEB_API_KEY ? '***' : undefined,
          envKeys: Object.keys(process.env).filter(k => k.includes('FIREBASE')).join(', '),
        });
        throw new ApiErrorResponse('SERVER_ERROR', 'Authentication service not configured. Please check FIREBASE_WEB_API_KEY in backend/.env', 500);
      }

      // Verify password using Firebase Auth REST API
      const authResponse = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_WEB_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
        }
      );

      const authData = await authResponse.json() as {
        localId?: string;
        email?: string;
        error?: {
          message?: string;
          code?: number;
        };
      };

      if (!authResponse.ok) {
        logger.error('Firebase Auth login failed:', authData);
        // Map Firebase Auth errors to our error format
        if (authData.error?.message?.includes('EMAIL_NOT_FOUND') || 
            authData.error?.message?.includes('INVALID_PASSWORD') ||
            authData.error?.message?.includes('INVALID_LOGIN_CREDENTIALS')) {
          throw new ApiErrorResponse('AUTH_INVALID_CREDENTIALS', 'Invalid email or password', 401);
        }
        if (authData.error?.message?.includes('USER_DISABLED')) {
          throw new ApiErrorResponse('AUTH_ACCOUNT_INACTIVE', 'Account is disabled', 403);
        }
        throw new ApiErrorResponse('AUTH_INVALID_CREDENTIALS', 'Invalid email or password', 401);
      }

      if (!authData.localId) {
        throw new ApiErrorResponse('AUTH_INVALID_CREDENTIALS', 'Invalid email or password', 401);
      }

      const uid = authData.localId;
      
      // Get user profile from Firestore
      const userDoc = await db.collection('users').doc(uid).get();
      
      if (!userDoc.exists) {
        throw new ApiErrorResponse('AUTH_USER_NOT_FOUND', 'User profile not found', 404);
      }

      const userData = userDoc.data() as User;

      if (!userData.isActive) {
        throw new ApiErrorResponse('AUTH_ACCOUNT_INACTIVE', 'Account is inactive', 403);
      }

      // Generate JWT tokens
      const signOptions: SignOptions = {
        expiresIn: JWT_EXPIRES_IN as any,
      };
      
      const token = jwt.sign(
        { uid, email: authData.email || userData.email, role: userData.role },
        JWT_SECRET,
        signOptions
      );

      const refreshSignOptions: SignOptions = {
        expiresIn: JWT_REFRESH_EXPIRES_IN as any,
      };

      const refreshToken = jwt.sign(
        { uid, type: 'refresh' },
        JWT_SECRET,
        refreshSignOptions
      );

      // Update last login
      await db.collection('users').doc(uid).update({
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
          profileData.address = teacherData?.address;
          // Prefer teacher profile phone if user doc doesn't have one
          profileData.phone = userData.phone || teacherData?.phone;
        }
      } else if (userData.role === 'parent' && userData.profileId) {
        const parentDoc = await db.collection('parents').doc(userData.profileId).get();
        if (parentDoc.exists) {
          const parentData = parentDoc.data();
          profileData.children = parentData?.children || [];
          profileData.address = parentData?.address;
          profileData.phone = userData.phone || parentData?.phone;
        }
      }

      // Convert Firestore Timestamp to ISO date string for dateOfBirth
      let dateOfBirth: string | undefined;
      if (userData.dateOfBirth) {
        const date = userData.dateOfBirth.toDate();
        // Format as YYYY-MM-DD for HTML date input
        dateOfBirth = date.toISOString().split('T')[0];
      }

      return {
        user: {
          id: uid,
          email: authData.email || userData.email,
          name: userData.displayName,
          role: userData.role,
          phone: profileData.phone || userData.phone,
          profilePicture: userData.photoURL,
          dateOfBirth,
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
      const signOptions: SignOptions = {
        expiresIn: JWT_EXPIRES_IN as any,
      };
      
      const token = jwt.sign(
        { uid: decoded.uid, email: userData.email, role: userData.role },
        JWT_SECRET,
        signOptions
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
        profileData.address = teacherData?.address;
        profileData.phone = userData.phone || teacherData?.phone;
      }
    } else if (userData.role === 'parent' && userData.profileId) {
      const parentDoc = await db.collection('parents').doc(userData.profileId).get();
      if (parentDoc.exists) {
        const parentData = parentDoc.data();
        profileData.children = parentData?.children || [];
        profileData.address = parentData?.address;
        profileData.phone = userData.phone || parentData?.phone;
      }
    }

    // Convert Firestore Timestamp to ISO date string for dateOfBirth
    let dateOfBirth: string | undefined;
    if (userData.dateOfBirth) {
      const date = userData.dateOfBirth.toDate();
      // Format as YYYY-MM-DD for HTML date input
      dateOfBirth = date.toISOString().split('T')[0];
    }

    return {
      id: uid,
      email: userData.email,
      name: userData.displayName,
      role: userData.role,
      phone: profileData.phone || userData.phone,
      profilePicture: userData.photoURL,
      dateOfBirth,
      ...profileData,
    };
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      const FIREBASE_WEB_API_KEY = process.env.FIREBASE_WEB_API_KEY?.trim();
      if (!FIREBASE_WEB_API_KEY || FIREBASE_WEB_API_KEY === '') {
        logger.error('FIREBASE_WEB_API_KEY is not configured for forgot password');
        throw new ApiErrorResponse('SERVER_ERROR', 'Password reset is not configured. Please try again later.', 500);
      }

      // Use Firebase REST API to send password reset email (Firebase sends the email)
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_WEB_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestType: 'PASSWORD_RESET',
            email: email.trim(),
          }),
        }
      );

      const data = await response.json() as { error?: { message?: string }; email?: string };

      if (!response.ok) {
        logger.warn('Forgot password request failed (may be unknown email):', data.error?.message);
        // Don't reveal if email exists or not for security - always return success
      } else {
        logger.info(`Password reset email sent to ${email}`);
      }
      // Always resolve; never reveal whether the email exists
    } catch (error: any) {
      if (error instanceof ApiErrorResponse) throw error;
      logger.error('Forgot password error:', error);
      // Don't reveal outcome; controller will send generic success message
    }
  }

  async resetPassword(_token: string, _newPassword: string): Promise<void> {
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

  async changePassword(uid: string, _currentPassword: string, newPassword: string): Promise<void> {
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

  async updateProfile(uid: string, data: {
    displayName?: string;
    phone?: string;
    photoURL?: string;
    dateOfBirth?: string;
    address?: string;
  }): Promise<any> {
    try {
      // Load user to determine role/profileId for syncing profile collection
      const userDoc = await db.collection('users').doc(uid).get();
      if (!userDoc.exists) {
        throw new ApiErrorResponse('AUTH_USER_NOT_FOUND', 'User not found', 404);
      }
      const userData = userDoc.data() as User;

      // Update user document in Firestore
      const updateData: any = {
        updatedAt: Timestamp.now(),
      };

      if (data.displayName !== undefined) {
        updateData.displayName = data.displayName;
        // Also update Firebase Auth display name
        await auth.updateUser(uid, { displayName: data.displayName });
      }

      if (data.phone !== undefined) {
        updateData.phone = data.phone;
      }

      if (data.photoURL !== undefined) {
        updateData.photoURL = data.photoURL;
        // Also update Firebase Auth photo URL
        await auth.updateUser(uid, { photoURL: data.photoURL });
      }

      if (data.dateOfBirth !== undefined) {
        // Convert ISO date string to Firestore Timestamp
        if (data.dateOfBirth && data.dateOfBirth.trim() !== '') {
          updateData.dateOfBirth = Timestamp.fromDate(new Date(data.dateOfBirth));
        } else {
          // If empty string, delete the field
          updateData.dateOfBirth = FieldValue.delete();
        }
      }

      await db.collection('users').doc(uid).update(updateData);

      // Sync into role profile docs (parents/teachers) for consistency
      try {
        if (userData.role === 'parent' && userData.profileId) {
          const parentUpdate: any = { updatedAt: Timestamp.now() };
          if (data.displayName !== undefined) parentUpdate.fullName = data.displayName;
          if (data.phone !== undefined) parentUpdate.phone = data.phone;
          if (data.address !== undefined) parentUpdate.address = data.address;
          await db.collection('parents').doc(userData.profileId).update(parentUpdate);
        }

        if (userData.role === 'teacher' && userData.profileId) {
          const teacherUpdate: any = { updatedAt: Timestamp.now() };
          if (data.displayName !== undefined) {
            teacherUpdate.fullName = data.displayName;
            teacherUpdate.nameWithInitials = this.generateInitials(data.displayName);
          }
          if (data.phone !== undefined) teacherUpdate.phone = data.phone;
          if (data.address !== undefined) teacherUpdate.address = data.address;
          await db.collection('teachers').doc(userData.profileId).update(teacherUpdate);
        }
      } catch (syncError: any) {
        // Don't fail the profile update if syncing role profile fails
        logger.warn('Failed to sync role profile during updateProfile:', syncError);
      }

      // Get updated user data
      return await this.getCurrentUser(uid);
    } catch (error: any) {
      logger.error('Update profile error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('PROFILE_UPDATE_FAILED', 'Failed to update profile', 400);
    }
  }
}

export default new AuthService();

