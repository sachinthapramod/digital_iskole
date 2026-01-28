import { db } from '../config/firebase';
import { Timestamp } from 'firebase-admin/firestore';
import { ApiErrorResponse } from '../utils/response';
import { Class } from '../types/class.types';
import logger from '../utils/logger';

export class ClassesService {
  async getClasses(): Promise<any[]> {
    try {
      // OPTIMIZED: Fetch classes and students in parallel, then count in memory
      const [classesSnapshot, allStudentsSnapshot] = await Promise.all([
        db.collection('classes').get(),
        db.collection('students')
          .where('status', '==', 'active')
          .get(),
      ]);
      
      // Count students per class in memory
      const studentCountByClass = new Map<string, number>();
      allStudentsSnapshot.docs.forEach(doc => {
        const className = doc.data().className;
        if (className) {
          studentCountByClass.set(className, (studentCountByClass.get(className) || 0) + 1);
        }
      });
      
      const classes: any[] = [];
      for (const doc of classesSnapshot.docs) {
        const classData = doc.data() as Class;
        
        classes.push({
          id: doc.id,
          name: classData.name,
          grade: classData.grade,
          section: classData.section,
          classTeacher: classData.classTeacherName || 'Not assigned',
          students: studentCountByClass.get(classData.name) || 0,
          room: classData.room || 'Not assigned',
          status: classData.status,
        });
      }
      
      return classes;
    } catch (error: any) {
      logger.error('Get classes error:', error);
      throw new ApiErrorResponse('FETCH_FAILED', 'Failed to fetch classes', 500);
    }
  }

  async getClass(id: string): Promise<any> {
    try {
      const classDoc = await db.collection('classes').doc(id).get();
      
      if (!classDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Class not found', 404);
      }
      
      const classData = classDoc.data() as Class;
      
      // Get student count
      const studentsSnapshot = await db.collection('students')
        .where('className', '==', classData.name)
        .where('status', '==', 'active')
        .get();
      
      return {
        id: classDoc.id,
        name: classData.name,
        grade: classData.grade,
        section: classData.section,
        classTeacher: classData.classTeacherName || 'Not assigned',
        students: studentsSnapshot.size,
        room: classData.room || 'Not assigned',
        status: classData.status,
      };
    } catch (error: any) {
      logger.error('Get class error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('FETCH_FAILED', 'Failed to fetch class', 500);
    }
  }

  async createClass(data: {
    grade: string;
    section: string;
    classTeacher: string;
    room?: string;
  }): Promise<any> {
    try {
      const className = `Grade ${data.grade}-${data.section}`;
      
      // Check if class already exists
      const existingClass = await db.collection('classes')
        .where('grade', '==', data.grade)
        .where('section', '==', data.section)
        .limit(1)
        .get();
      
      if (!existingClass.empty) {
        throw new ApiErrorResponse('RESOURCE_ALREADY_EXISTS', 'Class already exists', 409);
      }
      
      // Find teacher by name
      let classTeacherId = '';
      let classTeacherName = data.classTeacher;
      
      if (data.classTeacher && data.classTeacher !== 'Not assigned') {
        const teachersSnapshot = await db.collection('teachers')
          .where('fullName', '==', data.classTeacher)
          .limit(1)
          .get();
        
        if (!teachersSnapshot.empty) {
          const teacherDoc = teachersSnapshot.docs[0];
          const teacherData = teacherDoc.data();
          classTeacherId = teacherDoc.id;
          classTeacherName = teacherData.fullName;
          
          // Update teacher's assignedClass
          await db.collection('teachers').doc(teacherDoc.id).update({
            assignedClass: className,
            isClassTeacher: true,
            updatedAt: Timestamp.now(),
          });
        }
      }
      
      // Create class document
      const classData: Omit<Class, 'id'> = {
        name: className,
        grade: data.grade,
        section: data.section,
        classTeacherId: classTeacherId || undefined,
        classTeacherName: classTeacherName || undefined,
        room: data.room || undefined,
        studentCount: 0,
        status: 'active',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      const classRef = await db.collection('classes').add(classData);
      
      return {
        id: classRef.id,
        name: classData.name,
        grade: classData.grade,
        section: classData.section,
        classTeacher: classData.classTeacherName || 'Not assigned',
        students: 0,
        room: classData.room || 'Not assigned',
        status: classData.status,
      };
    } catch (error: any) {
      logger.error('Create class error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('CREATE_FAILED', 'Failed to create class', 500);
    }
  }

  async updateClass(id: string, data: {
    grade?: string;
    section?: string;
    classTeacher?: string;
    room?: string;
    status?: string;
  }): Promise<any> {
    try {
      const classDoc = await db.collection('classes').doc(id).get();
      
      if (!classDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Class not found', 404);
      }
      
      const classData = classDoc.data() as Class;
      const updateData: any = {
        updatedAt: Timestamp.now(),
      };
      
      // Update grade and/or section
      if (data.grade !== undefined || data.section !== undefined) {
        const newGrade = data.grade !== undefined ? data.grade : classData.grade;
        const newSection = data.section !== undefined ? data.section : classData.section;
        const newClassName = `Grade ${newGrade}-${newSection}`;
        
        // Check if new class name already exists (excluding current class)
        const existingClass = await db.collection('classes')
          .where('grade', '==', newGrade)
          .where('section', '==', newSection)
          .limit(1)
          .get();
        
        if (!existingClass.empty && existingClass.docs[0].id !== id) {
          throw new ApiErrorResponse('RESOURCE_ALREADY_EXISTS', 'Class with this grade and section already exists', 409);
        }
        
        updateData.grade = newGrade;
        updateData.section = newSection;
        updateData.name = newClassName;
        
        // Update all students' className
        const studentsSnapshot = await db.collection('students')
          .where('className', '==', classData.name)
          .get();
        
        const batch = db.batch();
        studentsSnapshot.docs.forEach((studentDoc) => {
          batch.update(studentDoc.ref, {
            className: newClassName,
            classId: newClassName,
            updatedAt: Timestamp.now(),
          });
        });
        await batch.commit();
      }
      
      // Update class teacher
      if (data.classTeacher !== undefined) {
        // Remove old teacher assignment
        if (classData.classTeacherId) {
          const oldTeacherDoc = await db.collection('teachers').doc(classData.classTeacherId).get();
          if (oldTeacherDoc.exists) {
            await db.collection('teachers').doc(classData.classTeacherId).update({
              assignedClass: null,
              isClassTeacher: false,
              updatedAt: Timestamp.now(),
            });
          }
        }
        
        // Assign new teacher
        let classTeacherId = '';
        let classTeacherName = data.classTeacher;
        
        if (data.classTeacher && data.classTeacher !== 'Not assigned') {
          const teachersSnapshot = await db.collection('teachers')
            .where('fullName', '==', data.classTeacher)
            .limit(1)
            .get();
          
          if (!teachersSnapshot.empty) {
            const teacherDoc = teachersSnapshot.docs[0];
            const teacherData = teacherDoc.data();
            classTeacherId = teacherDoc.id;
            classTeacherName = teacherData.fullName;
            
            // Update teacher's assignedClass
            await db.collection('teachers').doc(teacherDoc.id).update({
              assignedClass: updateData.name || classData.name,
              isClassTeacher: true,
              updatedAt: Timestamp.now(),
            });
          }
        }
        
        updateData.classTeacherId = classTeacherId || undefined;
        updateData.classTeacherName = classTeacherName || undefined;
      }
      
      if (data.room !== undefined) {
        updateData.room = data.room || undefined;
      }
      
      if (data.status !== undefined) {
        updateData.status = data.status;
      }
      
      await db.collection('classes').doc(id).update(updateData);
      
      return await this.getClass(id);
    } catch (error: any) {
      logger.error('Update class error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('UPDATE_FAILED', 'Failed to update class', 500);
    }
  }

  async deleteClass(id: string): Promise<void> {
    try {
      const classDoc = await db.collection('classes').doc(id).get();
      
      if (!classDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Class not found', 404);
      }
      
      const classData = classDoc.data() as Class;
      
      // Check if class has students
      const studentsSnapshot = await db.collection('students')
        .where('className', '==', classData.name)
        .where('status', '==', 'active')
        .get();
      
      if (!studentsSnapshot.empty) {
        throw new ApiErrorResponse('CANNOT_DELETE', 'Cannot delete class with active students', 400);
      }
      
      // Remove teacher assignment
      if (classData.classTeacherId) {
        await db.collection('teachers').doc(classData.classTeacherId).update({
          assignedClass: null,
          isClassTeacher: false,
          updatedAt: Timestamp.now(),
        });
      }
      
      // Delete class
      await db.collection('classes').doc(id).delete();
      
      logger.info(`Class ${id} deleted successfully`);
    } catch (error: any) {
      logger.error('Delete class error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('DELETE_FAILED', 'Failed to delete class', 500);
    }
  }
}
