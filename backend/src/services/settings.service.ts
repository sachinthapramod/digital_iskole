import { db } from '../config/firebase';
import { Timestamp } from 'firebase-admin/firestore';
import { ApiErrorResponse } from '../utils/response';
import { GradeScale, AcademicYear, UserPreferences } from '../types/settings.types';
import logger from '../utils/logger';

export class SettingsService {
  // Grade Scale Operations
  async getGradingScale(): Promise<any[]> {
    try {
      const gradesSnapshot = await db.collection('gradeScale').orderBy('order', 'desc').get();
      
      const grades: any[] = [];
      for (const doc of gradesSnapshot.docs) {
        const gradeData = doc.data() as GradeScale;
        grades.push({
          id: doc.id,
          grade: gradeData.grade,
          minMarks: gradeData.minMarks,
          maxMarks: gradeData.maxMarks,
          description: gradeData.description,
        });
      }
      
      // If no grades exist, return default grades
      if (grades.length === 0) {
        return this.getDefaultGrades();
      }
      
      return grades;
    } catch (error: any) {
      logger.error('Get grading scale error:', error);
      // If orderBy fails, try without it
      try {
        const gradesSnapshot = await db.collection('gradeScale').get();
        const grades: any[] = [];
        for (const doc of gradesSnapshot.docs) {
          const gradeData = doc.data() as GradeScale;
          grades.push({
            id: doc.id,
            grade: gradeData.grade,
            minMarks: gradeData.minMarks,
            maxMarks: gradeData.maxMarks,
            description: gradeData.description,
          });
        }
        // Sort by minMarks descending
        grades.sort((a, b) => b.minMarks - a.minMarks);
        return grades.length > 0 ? grades : this.getDefaultGrades();
      } catch (retryError: any) {
        logger.error('Get grading scale retry error:', retryError);
        return this.getDefaultGrades();
      }
    }
  }

  async updateGradingScale(grades: Array<{
    id?: string;
    grade: string;
    minMarks: number;
    maxMarks: number;
    description: string;
  }>): Promise<any[]> {
    try {
      // Validate grades
      for (const grade of grades) {
        if (!grade.grade || grade.minMarks < 0 || grade.maxMarks > 100 || grade.minMarks > grade.maxMarks) {
          throw new ApiErrorResponse('VALIDATION_ERROR', 'Invalid grade data', 400);
        }
      }

      // Delete all existing grades
      const existingGradesSnapshot = await db.collection('gradeScale').get();
      const batch = db.batch();
      existingGradesSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Add new grades
      grades.forEach((grade, index) => {
        const gradeRef = db.collection('gradeScale').doc();
        batch.set(gradeRef, {
          grade: grade.grade,
          minMarks: grade.minMarks,
          maxMarks: grade.maxMarks,
          description: grade.description,
          order: grades.length - index, // Higher order = higher marks
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      });

      await batch.commit();

      return await this.getGradingScale();
    } catch (error: any) {
      logger.error('Update grading scale error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('UPDATE_FAILED', 'Failed to update grading scale', 500);
    }
  }

  // Academic Year Operations
  async getAcademicYears(): Promise<any[]> {
    try {
      const yearsSnapshot = await db.collection('academicYears').get();
      
      const years: any[] = [];
      for (const doc of yearsSnapshot.docs) {
        const yearData = doc.data() as AcademicYear;
        const startDate = yearData.startDate as Timestamp;
        const endDate = yearData.endDate as Timestamp;
        
        years.push({
          id: doc.id,
          year: yearData.year,
          startDate: startDate ? startDate.toDate().toISOString().split('T')[0] : '',
          endDate: endDate ? endDate.toDate().toISOString().split('T')[0] : '',
          isCurrent: yearData.isCurrent || false,
          status: yearData.status || 'upcoming',
        });
      }
      
      // Sort by year descending
      years.sort((a, b) => b.year.localeCompare(a.year));
      
      return years;
    } catch (error: any) {
      logger.error('Get academic years error:', error);
      throw new ApiErrorResponse('FETCH_FAILED', 'Failed to fetch academic years', 500);
    }
  }

  async getCurrentAcademicYear(): Promise<any | null> {
    try {
      const currentYearSnapshot = await db.collection('academicYears')
        .where('isCurrent', '==', true)
        .limit(1)
        .get();
      
      if (currentYearSnapshot.empty) {
        return null;
      }
      
      const doc = currentYearSnapshot.docs[0];
      const yearData = doc.data() as AcademicYear;
      const startDate = yearData.startDate as Timestamp;
      const endDate = yearData.endDate as Timestamp;
      
      return {
        id: doc.id,
        year: yearData.year,
        startDate: startDate ? startDate.toDate().toISOString().split('T')[0] : '',
        endDate: endDate ? endDate.toDate().toISOString().split('T')[0] : '',
        isCurrent: true,
        status: yearData.status || 'active',
      };
    } catch (error: any) {
      logger.error('Get current academic year error:', error);
      return null;
    }
  }

  async createAcademicYear(data: {
    year: string;
    startDate: string;
    endDate: string;
  }): Promise<any> {
    try {
      // Validate dates
      const startDateObj = new Date(data.startDate);
      const endDateObj = new Date(data.endDate);
      
      if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
        throw new ApiErrorResponse('VALIDATION_ERROR', 'Invalid date format', 400);
      }
      
      if (endDateObj < startDateObj) {
        throw new ApiErrorResponse('VALIDATION_ERROR', 'End date must be after start date', 400);
      }

      // Check if year already exists
      const existingYearsSnapshot = await db.collection('academicYears')
        .where('year', '==', data.year)
        .get();
      
      if (!existingYearsSnapshot.empty) {
        throw new ApiErrorResponse('VALIDATION_ERROR', 'Academic year already exists', 400);
      }

      const now = new Date();
      const status = endDateObj < now ? 'completed' : startDateObj > now ? 'upcoming' : 'active';

      const yearData: Omit<AcademicYear, 'id'> = {
        year: data.year,
        startDate: Timestamp.fromDate(startDateObj),
        endDate: Timestamp.fromDate(endDateObj),
        isCurrent: false,
        status,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const yearRef = await db.collection('academicYears').add(yearData);

      return {
        id: yearRef.id,
        year: yearData.year,
        startDate: data.startDate,
        endDate: data.endDate,
        isCurrent: false,
        status,
      };
    } catch (error: any) {
      logger.error('Create academic year error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('CREATE_FAILED', 'Failed to create academic year', 500);
    }
  }

  async updateAcademicYear(id: string, data: {
    year?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    try {
      const yearDoc = await db.collection('academicYears').doc(id).get();
      
      if (!yearDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Academic year not found', 404);
      }

      const updateData: any = {
        updatedAt: Timestamp.now(),
      };

      if (data.year) {
        updateData.year = data.year;
      }

      if (data.startDate) {
        const startDateObj = new Date(data.startDate);
        if (isNaN(startDateObj.getTime())) {
          throw new ApiErrorResponse('VALIDATION_ERROR', 'Invalid start date format', 400);
        }
        updateData.startDate = Timestamp.fromDate(startDateObj);
      }

      if (data.endDate) {
        const endDateObj = new Date(data.endDate);
        if (isNaN(endDateObj.getTime())) {
          throw new ApiErrorResponse('VALIDATION_ERROR', 'Invalid end date format', 400);
        }
        updateData.endDate = Timestamp.fromDate(endDateObj);
      }

      // Recalculate status if dates changed
      if (data.startDate || data.endDate) {
        const yearData = yearDoc.data() as AcademicYear;
        const startDate = (updateData.startDate || yearData.startDate) as Timestamp;
        const endDate = (updateData.endDate || yearData.endDate) as Timestamp;
        const now = new Date();
        
        updateData.status = endDate.toDate() < now ? 'completed' : startDate.toDate() > now ? 'upcoming' : 'active';
      }

      await db.collection('academicYears').doc(id).update(updateData);

      const updatedDoc = await db.collection('academicYears').doc(id).get();
      const updatedData = updatedDoc.data() as AcademicYear;
      const startDate = updatedData.startDate as Timestamp;
      const endDate = updatedData.endDate as Timestamp;

      return {
        id: updatedDoc.id,
        year: updatedData.year,
        startDate: startDate ? startDate.toDate().toISOString().split('T')[0] : '',
        endDate: endDate ? endDate.toDate().toISOString().split('T')[0] : '',
        isCurrent: updatedData.isCurrent,
        status: updatedData.status,
      };
    } catch (error: any) {
      logger.error('Update academic year error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('UPDATE_FAILED', 'Failed to update academic year', 500);
    }
  }

  async setCurrentAcademicYear(id: string): Promise<any> {
    try {
      const yearDoc = await db.collection('academicYears').doc(id).get();
      
      if (!yearDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Academic year not found', 404);
      }

      // Unset all other current years
      const currentYearsSnapshot = await db.collection('academicYears')
        .where('isCurrent', '==', true)
        .get();
      
      const batch = db.batch();
      currentYearsSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { isCurrent: false });
      });

      // Set this year as current
      batch.update(db.collection('academicYears').doc(id), {
        isCurrent: true,
        status: 'active',
        updatedAt: Timestamp.now(),
      });

      await batch.commit();

      const updatedDoc = await db.collection('academicYears').doc(id).get();
      const updatedData = updatedDoc.data() as AcademicYear;
      const startDate = updatedData.startDate as Timestamp;
      const endDate = updatedData.endDate as Timestamp;

      return {
        id: updatedDoc.id,
        year: updatedData.year,
        startDate: startDate ? startDate.toDate().toISOString().split('T')[0] : '',
        endDate: endDate ? endDate.toDate().toISOString().split('T')[0] : '',
        isCurrent: true,
        status: 'active',
      };
    } catch (error: any) {
      logger.error('Set current academic year error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('UPDATE_FAILED', 'Failed to set current academic year', 500);
    }
  }

  async deleteAcademicYear(id: string): Promise<void> {
    try {
      const yearDoc = await db.collection('academicYears').doc(id).get();
      
      if (!yearDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Academic year not found', 404);
      }

      const yearData = yearDoc.data() as AcademicYear;
      if (yearData.isCurrent) {
        throw new ApiErrorResponse('VALIDATION_ERROR', 'Cannot delete current academic year', 400);
      }

      await db.collection('academicYears').doc(id).delete();
    } catch (error: any) {
      logger.error('Delete academic year error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('DELETE_FAILED', 'Failed to delete academic year', 500);
    }
  }

  // User Preferences Operations
  async getUserPreferences(userId: string): Promise<any> {
    try {
      const prefsDoc = await db.collection('userPreferences').doc(userId).get();
      
      if (!prefsDoc.exists) {
        // Return default preferences
        return {
          pushNotifications: true,
          emailNotifications: true,
          smsNotifications: false,
          noticeNotifications: true,
          appointmentNotifications: true,
          marksNotifications: true,
          attendanceNotifications: true,
          examNotifications: true,
        };
      }

      const prefsData = prefsDoc.data() as UserPreferences;
      return {
        pushNotifications: prefsData.pushNotifications ?? true,
        emailNotifications: prefsData.emailNotifications ?? true,
        smsNotifications: prefsData.smsNotifications ?? false,
        noticeNotifications: prefsData.noticeNotifications ?? true,
        appointmentNotifications: prefsData.appointmentNotifications ?? true,
        marksNotifications: prefsData.marksNotifications ?? true,
        attendanceNotifications: prefsData.attendanceNotifications ?? true,
        examNotifications: prefsData.examNotifications ?? true,
      };
    } catch (error: any) {
      logger.error('Get user preferences error:', error);
      throw new ApiErrorResponse('FETCH_FAILED', 'Failed to fetch user preferences', 500);
    }
  }

  async updateUserPreferences(userId: string, data: Partial<UserPreferences>): Promise<any> {
    try {
      const prefsDoc = await db.collection('userPreferences').doc(userId).get();
      
      const updateData: any = {
        userId,
        ...data,
        updatedAt: Timestamp.now(),
      };

      if (prefsDoc.exists) {
        await db.collection('userPreferences').doc(userId).update(updateData);
      } else {
        await db.collection('userPreferences').doc(userId).set(updateData);
      }

      return await this.getUserPreferences(userId);
    } catch (error: any) {
      logger.error('Update user preferences error:', error);
      throw new ApiErrorResponse('UPDATE_FAILED', 'Failed to update user preferences', 500);
    }
  }

  // Helper method for default grades
  private getDefaultGrades(): any[] {
    return [
      { id: '1', grade: 'A+', minMarks: 90, maxMarks: 100, description: 'Excellent' },
      { id: '2', grade: 'A', minMarks: 80, maxMarks: 89, description: 'Very Good' },
      { id: '3', grade: 'B+', minMarks: 75, maxMarks: 79, description: 'Good' },
      { id: '4', grade: 'B', minMarks: 70, maxMarks: 74, description: 'Above Average' },
      { id: '5', grade: 'C+', minMarks: 65, maxMarks: 69, description: 'Average' },
      { id: '6', grade: 'C', minMarks: 60, maxMarks: 64, description: 'Satisfactory' },
      { id: '7', grade: 'D', minMarks: 50, maxMarks: 59, description: 'Pass' },
      { id: '8', grade: 'F', minMarks: 0, maxMarks: 49, description: 'Fail' },
    ];
  }
}
