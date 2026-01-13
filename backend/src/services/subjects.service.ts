import { db } from '../config/firebase';
import { Timestamp } from 'firebase-admin/firestore';
import { ApiErrorResponse } from '../utils/response';
import { Subject } from '../types/subject.types';
import logger from '../utils/logger';

export class SubjectsService {
  async getSubjects(): Promise<any[]> {
    try {
      const subjectsSnapshot = await db.collection('subjects').get();
      const subjects: any[] = [];
      
      for (const doc of subjectsSnapshot.docs) {
        const subjectData = doc.data() as Subject;
        
        // Count teachers teaching this subject
        const teachersSnapshot = await db.collection('teachers')
          .where('subjects', 'array-contains', subjectData.name)
          .where('status', '==', 'active')
          .get();
        
        // Count classes that have this subject (this would require a subjects-classes mapping)
        // For now, we'll use a simple count or leave it as 0
        const classesCount = 0; // Can be enhanced later with proper mapping
        
        subjects.push({
          id: doc.id,
          name: subjectData.name,
          code: subjectData.code,
          teachers: teachersSnapshot.size,
          classes: classesCount,
          status: subjectData.status,
        });
      }
      
      return subjects;
    } catch (error: any) {
      logger.error('Get subjects error:', error);
      throw new ApiErrorResponse('FETCH_FAILED', 'Failed to fetch subjects', 500);
    }
  }

  async getSubject(id: string): Promise<any> {
    try {
      const subjectDoc = await db.collection('subjects').doc(id).get();
      
      if (!subjectDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Subject not found', 404);
      }
      
      const subjectData = subjectDoc.data() as Subject;
      
      // Count teachers teaching this subject
      const teachersSnapshot = await db.collection('teachers')
        .where('subjects', 'array-contains', subjectData.name)
        .where('status', '==', 'active')
        .get();
      
      return {
        id: subjectDoc.id,
        name: subjectData.name,
        code: subjectData.code,
        teachers: teachersSnapshot.size,
        classes: 0,
        status: subjectData.status,
      };
    } catch (error: any) {
      logger.error('Get subject error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('FETCH_FAILED', 'Failed to fetch subject', 500);
    }
  }

  async createSubject(data: {
    name: string;
    code: string;
    description?: string;
  }): Promise<any> {
    try {
      // Check if subject code already exists
      const existingSubject = await db.collection('subjects')
        .where('code', '==', data.code.toUpperCase())
        .limit(1)
        .get();
      
      if (!existingSubject.empty) {
        throw new ApiErrorResponse('RESOURCE_ALREADY_EXISTS', 'Subject with this code already exists', 409);
      }
      
      // Check if subject name already exists
      const existingName = await db.collection('subjects')
        .where('name', '==', data.name)
        .limit(1)
        .get();
      
      if (!existingName.empty) {
        throw new ApiErrorResponse('RESOURCE_ALREADY_EXISTS', 'Subject with this name already exists', 409);
      }
      
      // Create subject document
      const subjectData: Omit<Subject, 'id'> = {
        name: data.name,
        code: data.code.toUpperCase(),
        description: data.description || undefined,
        status: 'active',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      const subjectRef = await db.collection('subjects').add(subjectData);
      
      return {
        id: subjectRef.id,
        name: subjectData.name,
        code: subjectData.code,
        teachers: 0,
        classes: 0,
        status: subjectData.status,
      };
    } catch (error: any) {
      logger.error('Create subject error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('CREATE_FAILED', 'Failed to create subject', 500);
    }
  }

  async updateSubject(id: string, data: {
    name?: string;
    code?: string;
    description?: string;
    status?: string;
  }): Promise<any> {
    try {
      const subjectDoc = await db.collection('subjects').doc(id).get();
      
      if (!subjectDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Subject not found', 404);
      }
      
      const updateData: any = {
        updatedAt: Timestamp.now(),
      };
      
      if (data.name !== undefined) {
        // Check if new name already exists (excluding current subject)
        const existingName = await db.collection('subjects')
          .where('name', '==', data.name)
          .limit(1)
          .get();
        
        if (!existingName.empty && existingName.docs[0].id !== id) {
          throw new ApiErrorResponse('RESOURCE_ALREADY_EXISTS', 'Subject with this name already exists', 409);
        }
        
        updateData.name = data.name;
      }
      
      if (data.code !== undefined) {
        // Check if new code already exists (excluding current subject)
        const existingCode = await db.collection('subjects')
          .where('code', '==', data.code.toUpperCase())
          .limit(1)
          .get();
        
        if (!existingCode.empty && existingCode.docs[0].id !== id) {
          throw new ApiErrorResponse('RESOURCE_ALREADY_EXISTS', 'Subject with this code already exists', 409);
        }
        
        updateData.code = data.code.toUpperCase();
      }
      
      if (data.description !== undefined) {
        updateData.description = data.description || undefined;
      }
      
      if (data.status !== undefined) {
        updateData.status = data.status;
      }
      
      await db.collection('subjects').doc(id).update(updateData);
      
      return await this.getSubject(id);
    } catch (error: any) {
      logger.error('Update subject error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('UPDATE_FAILED', 'Failed to update subject', 500);
    }
  }

  async deleteSubject(id: string): Promise<void> {
    try {
      const subjectDoc = await db.collection('subjects').doc(id).get();
      
      if (!subjectDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Subject not found', 404);
      }
      
      const subjectData = subjectDoc.data() as Subject;
      
      // Check if any teachers are assigned to this subject
      const teachersSnapshot = await db.collection('teachers')
        .where('subjects', 'array-contains', subjectData.name)
        .where('status', '==', 'active')
        .get();
      
      if (!teachersSnapshot.empty) {
        throw new ApiErrorResponse('CANNOT_DELETE', 'Cannot delete subject that is assigned to active teachers', 400);
      }
      
      // Delete subject
      await db.collection('subjects').doc(id).delete();
      
      logger.info(`Subject ${id} deleted successfully`);
    } catch (error: any) {
      logger.error('Delete subject error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('DELETE_FAILED', 'Failed to delete subject', 500);
    }
  }
}
