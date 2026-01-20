import { auth, db } from '../config/firebase';
import { Timestamp } from 'firebase-admin/firestore';
import { Teacher, Parent, Student, User } from '../types';
import { ApiErrorResponse } from '../utils/response';
import logger from '../utils/logger';

export class UsersService {
  // ========== TEACHERS ==========
  
  async getTeachers(): Promise<any[]> {
    try {
      const teachersSnapshot = await db.collection('teachers').get();
      const teachers: any[] = [];
      
      for (const doc of teachersSnapshot.docs) {
        const teacherData = doc.data() as Teacher;
        const userDoc = await db.collection('users').doc(teacherData.userId).get();
        const userData = userDoc.data() as User;
        
        if (userData) {
          teachers.push({
            id: doc.id,
            name: teacherData.fullName,
            email: teacherData.email,
            phone: teacherData.phone,
            subject: teacherData.subjects?.[0] || '',
            assignedClass: teacherData.assignedClass || '',
            status: teacherData.status,
            userId: teacherData.userId,
          });
        }
      }
      
      return teachers;
    } catch (error: any) {
      logger.error('Get teachers error:', error);
      throw new ApiErrorResponse('FETCH_FAILED', 'Failed to fetch teachers', 500);
    }
  }

  async getTeacher(id: string): Promise<any> {
    try {
      const teacherDoc = await db.collection('teachers').doc(id).get();
      
      if (!teacherDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Teacher not found', 404);
      }
      
      const teacherData = teacherDoc.data() as Teacher;
      
      return {
        id: teacherDoc.id,
        name: teacherData.fullName,
        email: teacherData.email,
        phone: teacherData.phone,
        subject: teacherData.subjects?.[0] || '',
        assignedClass: teacherData.assignedClass || '',
        status: teacherData.status,
        userId: teacherData.userId,
      };
    } catch (error: any) {
      logger.error('Get teacher error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('FETCH_FAILED', 'Failed to fetch teacher', 500);
    }
  }

  async createTeacher(data: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    assignedClass?: string;
    password: string;
  }): Promise<any> {
    try {
      // Check if email already exists
      let existingUser;
      try {
        existingUser = await auth.getUserByEmail(data.email);
      } catch (error: any) {
        // User doesn't exist, which is good
      }
      
      if (existingUser) {
        throw new ApiErrorResponse('EMAIL_EXISTS', 'Email already registered', 400);
      }

      // Create Firebase Auth user
      const firebaseUser = await auth.createUser({
        email: data.email,
        password: data.password,
        displayName: data.name,
        emailVerified: false,
      });

      // Generate employee ID
      const employeeId = `EMP${Date.now().toString().slice(-6)}`;

      // Create teacher profile in Firestore
      const teacherData: Omit<Teacher, 'id'> = {
        userId: firebaseUser.uid,
        employeeId,
        fullName: data.name,
        nameWithInitials: this.generateInitials(data.name),
        email: data.email,
        phone: data.phone,
        address: '',
        dateOfBirth: Timestamp.fromDate(new Date('1990-01-01')), // Default, can be updated later
        gender: 'male', // Default, can be updated later
        qualifications: [],
        subjects: [data.subject],
        assignedClass: data.assignedClass || undefined,
        isClassTeacher: !!data.assignedClass,
        status: 'active',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const teacherRef = await db.collection('teachers').add(teacherData);

      // Create user document in Firestore
      const userData: Omit<User, 'uid'> = {
        email: data.email,
        role: 'teacher',
        profileId: teacherRef.id,
        displayName: data.name,
        phone: data.phone,
        language: 'en',
        theme: 'light',
        fcmTokens: [],
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await db.collection('users').doc(firebaseUser.uid).set(userData);

      return {
        id: teacherRef.id,
        name: teacherData.fullName,
        email: teacherData.email,
        phone: teacherData.phone,
        subject: teacherData.subjects[0],
        assignedClass: teacherData.assignedClass || '',
        status: teacherData.status,
        userId: firebaseUser.uid,
      };
    } catch (error: any) {
      logger.error('Create teacher error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      if (error.code === 'auth/email-already-exists') {
        throw new ApiErrorResponse('EMAIL_EXISTS', 'Email already registered', 400);
      }
      if (error.code === 'auth/invalid-password' || error.message?.includes('password')) {
        throw new ApiErrorResponse('INVALID_PASSWORD', 'Password must be at least 6 characters long', 400);
      }
      if (error.code === 'auth/invalid-email') {
        throw new ApiErrorResponse('INVALID_EMAIL', 'Invalid email address', 400);
      }
      // Log the full error for debugging
      logger.error('Unexpected error creating teacher:', error);
      throw new ApiErrorResponse('CREATE_FAILED', error.message || 'Failed to create teacher', 500);
    }
  }

  async updateTeacher(id: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    subject?: string;
    assignedClass?: string;
    status?: string;
  }): Promise<any> {
    try {
      const teacherDoc = await db.collection('teachers').doc(id).get();
      
      if (!teacherDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Teacher not found', 404);
      }

      const teacherData = teacherDoc.data() as Teacher;
      const updateData: any = {
        updatedAt: Timestamp.now(),
      };

      // Update teacher profile
      if (data.name !== undefined) {
        updateData.fullName = data.name;
        updateData.nameWithInitials = this.generateInitials(data.name);
        // Update user document
        await db.collection('users').doc(teacherData.userId).update({
          displayName: data.name,
          updatedAt: Timestamp.now(),
        });
        // Update Firebase Auth
        await auth.updateUser(teacherData.userId, { displayName: data.name });
      }

      if (data.phone !== undefined) {
        updateData.phone = data.phone;
        await db.collection('users').doc(teacherData.userId).update({
          phone: data.phone,
          updatedAt: Timestamp.now(),
        });
      }

      if (data.subject !== undefined) {
        updateData.subjects = [data.subject];
      }

      if (data.assignedClass !== undefined) {
        updateData.assignedClass = data.assignedClass || null;
        updateData.isClassTeacher = !!data.assignedClass;
      }

      if (data.status !== undefined) {
        updateData.status = data.status;
        await db.collection('users').doc(teacherData.userId).update({
          isActive: data.status === 'active',
          updatedAt: Timestamp.now(),
        });
      }

      if (data.email !== undefined && data.email !== teacherData.email) {
        // Check if new email exists
        try {
          await auth.getUserByEmail(data.email);
          throw new ApiErrorResponse('EMAIL_EXISTS', 'Email already registered', 400);
        } catch (error: any) {
          if (error instanceof ApiErrorResponse) {
            throw error;
          }
          // Email doesn't exist, update it
          updateData.email = data.email;
          await auth.updateUser(teacherData.userId, { email: data.email });
          await db.collection('users').doc(teacherData.userId).update({
            email: data.email,
            updatedAt: Timestamp.now(),
          });
        }
      }

      await db.collection('teachers').doc(id).update(updateData);

      return await this.getTeacher(id);
    } catch (error: any) {
      logger.error('Update teacher error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('UPDATE_FAILED', 'Failed to update teacher', 500);
    }
  }

  async deleteTeacher(id: string): Promise<void> {
    try {
      const teacherDoc = await db.collection('teachers').doc(id).get();
      
      if (!teacherDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Teacher not found', 404);
      }

      const teacherData = teacherDoc.data() as Teacher;

      // Delete Firebase Auth user
      await auth.deleteUser(teacherData.userId);

      // Delete user document
      await db.collection('users').doc(teacherData.userId).delete();

      // Delete teacher profile
      await db.collection('teachers').doc(id).delete();

      logger.info(`Teacher ${id} deleted successfully`);
    } catch (error: any) {
      logger.error('Delete teacher error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('DELETE_FAILED', 'Failed to delete teacher', 500);
    }
  }

  // ========== PARENTS ==========

  async getParents(): Promise<any[]> {
    try {
      const parentsSnapshot = await db.collection('parents').get();
      const parents: any[] = [];
      
      for (const doc of parentsSnapshot.docs) {
        const parentData = doc.data() as Parent;
        const userDoc = await db.collection('users').doc(parentData.userId).get();
        const userData = userDoc.data() as User;
        
        if (userData) {
          // Get children names
          const childrenNames: string[] = [];
          for (const childId of parentData.children || []) {
            const childDoc = await db.collection('students').doc(childId).get();
            if (childDoc.exists) {
              const childData = childDoc.data() as Student;
              childrenNames.push(`${childData.fullName} (${childData.className})`);
            }
          }

          parents.push({
            id: doc.id,
            name: parentData.fullName,
            email: parentData.email,
            phone: parentData.phone,
            children: childrenNames,
            status: parentData.status,
            userId: parentData.userId,
          });
        }
      }
      
      return parents;
    } catch (error: any) {
      logger.error('Get parents error:', error);
      throw new ApiErrorResponse('FETCH_FAILED', 'Failed to fetch parents', 500);
    }
  }

  async getParent(id: string): Promise<any> {
    try {
      const parentDoc = await db.collection('parents').doc(id).get();
      
      if (!parentDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Parent not found', 404);
      }
      
      const parentData = parentDoc.data() as Parent;
      
      // Get children names
      const childrenNames: string[] = [];
      for (const childId of parentData.children || []) {
        const childDoc = await db.collection('students').doc(childId).get();
        if (childDoc.exists) {
          const childData = childDoc.data() as Student;
          childrenNames.push(`${childData.fullName} (${childData.className})`);
        }
      }

      return {
        id: parentDoc.id,
        name: parentData.fullName,
        email: parentData.email,
        phone: parentData.phone,
        children: childrenNames,
        status: parentData.status,
        userId: parentData.userId,
      };
    } catch (error: any) {
      logger.error('Get parent error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('FETCH_FAILED', 'Failed to fetch parent', 500);
    }
  }

  async createParent(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<any> {
    try {
      // Check if email already exists
      let existingUser;
      try {
        existingUser = await auth.getUserByEmail(data.email);
      } catch (error: any) {
        // User doesn't exist, which is good
      }
      
      if (existingUser) {
        throw new ApiErrorResponse('EMAIL_EXISTS', 'Email already registered', 400);
      }

      // Create Firebase Auth user
      const firebaseUser = await auth.createUser({
        email: data.email,
        password: data.password,
        displayName: data.name,
        emailVerified: false,
      });

      // Create parent profile in Firestore
      const parentData: Omit<Parent, 'id'> = {
        userId: firebaseUser.uid,
        fullName: data.name,
        email: data.email,
        phone: data.phone,
        children: [],
        status: 'active',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const parentRef = await db.collection('parents').add(parentData);

      // Create user document in Firestore
      const userData: Omit<User, 'uid'> = {
        email: data.email,
        role: 'parent',
        profileId: parentRef.id,
        displayName: data.name,
        phone: data.phone,
        language: 'en',
        theme: 'light',
        fcmTokens: [],
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await db.collection('users').doc(firebaseUser.uid).set(userData);

      return {
        id: parentRef.id,
        name: parentData.fullName,
        email: parentData.email,
        phone: parentData.phone,
        children: [],
        status: parentData.status,
        userId: firebaseUser.uid,
      };
    } catch (error: any) {
      logger.error('Create parent error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      if (error.code === 'auth/email-already-exists') {
        throw new ApiErrorResponse('EMAIL_EXISTS', 'Email already registered', 400);
      }
      throw new ApiErrorResponse('CREATE_FAILED', 'Failed to create parent', 500);
    }
  }

  async updateParent(id: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    status?: string;
  }): Promise<any> {
    try {
      const parentDoc = await db.collection('parents').doc(id).get();
      
      if (!parentDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Parent not found', 404);
      }

      const parentData = parentDoc.data() as Parent;
      const updateData: any = {
        updatedAt: Timestamp.now(),
      };

      if (data.name !== undefined) {
        updateData.fullName = data.name;
        await db.collection('users').doc(parentData.userId).update({
          displayName: data.name,
          updatedAt: Timestamp.now(),
        });
        await auth.updateUser(parentData.userId, { displayName: data.name });
      }

      if (data.phone !== undefined) {
        updateData.phone = data.phone;
        await db.collection('users').doc(parentData.userId).update({
          phone: data.phone,
          updatedAt: Timestamp.now(),
        });
      }

      if (data.status !== undefined) {
        updateData.status = data.status;
        await db.collection('users').doc(parentData.userId).update({
          isActive: data.status === 'active',
          updatedAt: Timestamp.now(),
        });
      }

      if (data.email !== undefined && data.email !== parentData.email) {
        try {
          await auth.getUserByEmail(data.email);
          throw new ApiErrorResponse('EMAIL_EXISTS', 'Email already registered', 400);
        } catch (error: any) {
          if (error instanceof ApiErrorResponse) {
            throw error;
          }
          updateData.email = data.email;
          await auth.updateUser(parentData.userId, { email: data.email });
          await db.collection('users').doc(parentData.userId).update({
            email: data.email,
            updatedAt: Timestamp.now(),
          });
        }
      }

      await db.collection('parents').doc(id).update(updateData);

      return await this.getParent(id);
    } catch (error: any) {
      logger.error('Update parent error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('UPDATE_FAILED', 'Failed to update parent', 500);
    }
  }

  async deleteParent(id: string): Promise<void> {
    try {
      const parentDoc = await db.collection('parents').doc(id).get();
      
      if (!parentDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Parent not found', 404);
      }

      const parentData = parentDoc.data() as Parent;

      // Delete Firebase Auth user
      await auth.deleteUser(parentData.userId);

      // Delete user document
      await db.collection('users').doc(parentData.userId).delete();

      // Delete parent profile
      await db.collection('parents').doc(id).delete();

      logger.info(`Parent ${id} deleted successfully`);
    } catch (error: any) {
      logger.error('Delete parent error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('DELETE_FAILED', 'Failed to delete parent', 500);
    }
  }

  // ========== STUDENTS ==========

  async getStudents(): Promise<any[]> {
    try {
      const studentsSnapshot = await db.collection('students').get();
      const students: any[] = [];
      
      for (const doc of studentsSnapshot.docs) {
        const studentData = doc.data() as Student;
        
        students.push({
          id: doc.id,
          name: studentData.fullName,
          rollNo: studentData.admissionNumber,
          class: studentData.className,
          parent: studentData.parentName,
          status: studentData.status,
        });
      }
      
      return students;
    } catch (error: any) {
      logger.error('Get students error:', error);
      throw new ApiErrorResponse('FETCH_FAILED', 'Failed to fetch students', 500);
    }
  }

  async getStudent(id: string): Promise<any> {
    try {
      const studentDoc = await db.collection('students').doc(id).get();
      
      if (!studentDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Student not found', 404);
      }
      
      const studentData = studentDoc.data() as Student;
      
      return {
        id: studentDoc.id,
        name: studentData.fullName,
        rollNo: studentData.admissionNumber,
        class: studentData.className,
        parent: studentData.parentName,
        parentPhone: studentData.parentPhone,
        parentEmail: studentData.parentEmail,
        status: studentData.status,
      };
    } catch (error: any) {
      logger.error('Get student error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('FETCH_FAILED', 'Failed to fetch student', 500);
    }
  }

  async createStudent(data: {
    name: string;
    class: string;
    parent: string;
  }): Promise<any> {
    try {
      // Find parent by name (in a real app, you'd use parent ID)
      const parentsSnapshot = await db.collection('parents').where('fullName', '==', data.parent).limit(1).get();
      
      let parentId = '';
      let parentName = data.parent;
      let parentEmail = '';
      let parentPhone = '';

      if (!parentsSnapshot.empty) {
        const parentDoc = parentsSnapshot.docs[0];
        const parentData = parentDoc.data() as Parent;
        parentId = parentDoc.id;
        parentName = parentData.fullName;
        parentEmail = parentData.email;
        parentPhone = parentData.phone;
      }

      // Generate admission number
      const classPrefix = data.class.replace('Grade ', '').replace('-', '');
      const studentsCount = (await db.collection('students').where('className', '==', data.class).get()).size;
      const admissionNumber = `${classPrefix}${String(studentsCount + 1).padStart(3, '0')}`;

      // Get class ID (you might need to fetch from classes collection)
      // For now, using className as classId
      const classId = data.class;

      // Create student profile in Firestore
      const studentData: Omit<Student, 'id'> = {
        admissionNumber,
        fullName: data.name,
        nameWithInitials: this.generateInitials(data.name),
        dateOfBirth: Timestamp.fromDate(new Date('2010-01-01')), // Default, can be updated later
        gender: 'male', // Default, can be updated later
        classId,
        className: data.class,
        parentId: parentId || '',
        parentName,
        parentEmail,
        parentPhone,
        status: 'active',
        enrollmentDate: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const studentRef = await db.collection('students').add(studentData);

      // If parent exists, add student to parent's children array
      if (parentId) {
        const parentDoc = await db.collection('parents').doc(parentId).get();
        const parentData = parentDoc.data() as Parent;
        await db.collection('parents').doc(parentId).update({
          children: [...(parentData.children || []), studentRef.id],
          updatedAt: Timestamp.now(),
        });
      }

      return {
        id: studentRef.id,
        name: studentData.fullName,
        rollNo: studentData.admissionNumber,
        class: studentData.className,
        parent: studentData.parentName,
        status: studentData.status,
      };
    } catch (error: any) {
      logger.error('Create student error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('CREATE_FAILED', 'Failed to create student', 500);
    }
  }

  async updateStudent(id: string, data: {
    name?: string;
    class?: string;
    parent?: string;
    status?: string;
  }): Promise<any> {
    try {
      const studentDoc = await db.collection('students').doc(id).get();
      
      if (!studentDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Student not found', 404);
      }

      const studentData = studentDoc.data() as Student;
      const updateData: any = {
        updatedAt: Timestamp.now(),
      };

      if (data.name !== undefined) {
        updateData.fullName = data.name;
        updateData.nameWithInitials = this.generateInitials(data.name);
      }

      if (data.class !== undefined) {
        updateData.className = data.class;
        updateData.classId = data.class;
      }

      if (data.status !== undefined) {
        updateData.status = data.status;
      }

      if (data.parent !== undefined && data.parent !== studentData.parentName) {
        // Remove from old parent
        if (studentData.parentId) {
          const oldParentDoc = await db.collection('parents').doc(studentData.parentId).get();
          if (oldParentDoc.exists) {
            const oldParentData = oldParentDoc.data() as Parent;
            await db.collection('parents').doc(studentData.parentId).update({
              children: (oldParentData.children || []).filter((childId: string) => childId !== id),
              updatedAt: Timestamp.now(),
            });
          }
        }

        // Find new parent
        const parentsSnapshot = await db.collection('parents').where('fullName', '==', data.parent).limit(1).get();
        
        if (!parentsSnapshot.empty) {
          const parentDoc = parentsSnapshot.docs[0];
          const parentData = parentDoc.data() as Parent;
          updateData.parentId = parentDoc.id;
          updateData.parentName = parentData.fullName;
          updateData.parentEmail = parentData.email;
          updateData.parentPhone = parentData.phone;

          // Add to new parent
          await db.collection('parents').doc(parentDoc.id).update({
            children: [...(parentData.children || []), id],
            updatedAt: Timestamp.now(),
          });
        } else {
          updateData.parentName = data.parent;
          updateData.parentId = '';
          updateData.parentEmail = '';
          updateData.parentPhone = '';
        }
      }

      await db.collection('students').doc(id).update(updateData);

      return await this.getStudent(id);
    } catch (error: any) {
      logger.error('Update student error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('UPDATE_FAILED', 'Failed to update student', 500);
    }
  }

  async deleteStudent(id: string): Promise<void> {
    try {
      const studentDoc = await db.collection('students').doc(id).get();
      
      if (!studentDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Student not found', 404);
      }

      const studentData = studentDoc.data() as Student;

      // Remove from parent's children array
      if (studentData.parentId) {
        const parentDoc = await db.collection('parents').doc(studentData.parentId).get();
        if (parentDoc.exists) {
          const parentData = parentDoc.data() as Parent;
          await db.collection('parents').doc(studentData.parentId).update({
            children: (parentData.children || []).filter((childId: string) => childId !== id),
            updatedAt: Timestamp.now(),
          });
        }
      }

      // Delete student profile
      await db.collection('students').doc(id).delete();

      logger.info(`Student ${id} deleted successfully`);
    } catch (error: any) {
      logger.error('Delete student error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('DELETE_FAILED', 'Failed to delete student', 500);
    }
  }

  async getParentChildrenByUserId(userId: string): Promise<any[]> {
    try {
      // Get parent by userId
      const parentDoc = await db.collection('parents')
        .where('userId', '==', userId)
        .limit(1)
        .get();

      if (parentDoc.empty) {
        return [];
      }

      const parentId = parentDoc.docs[0].id;
      return await this.getParentChildren(parentId);
    } catch (error: any) {
      logger.error('Get parent children by userId error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('FETCH_FAILED', 'Failed to fetch parent children', 500);
    }
  }

  async getParentChildren(parentId: string): Promise<any[]> {
    try {
      const parentDoc = await db.collection('parents').doc(parentId).get();
      
      if (!parentDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Parent not found', 404);
      }

      const parentData = parentDoc.data() as Parent;
      const childrenIds = parentData.children || [];

      if (childrenIds.length === 0) {
        return [];
      }

      // Fetch all children
      const childrenPromises = childrenIds.map(async (childId) => {
        const childDoc = await db.collection('students').doc(childId).get();
        if (!childDoc.exists) {
          return null;
        }

        const childData = childDoc.data() as Student;
        const classId = childData.classId;

        // Get class teacher info
        let classTeacher = { id: '', name: '' };
        if (classId) {
          const classDoc = await db.collection('classes').doc(classId).get();
          if (classDoc.exists) {
            const classData = classDoc.data();
            const teacherId = classData?.classTeacherId;
            if (teacherId) {
              const teacherDoc = await db.collection('teachers').doc(teacherId).get();
              if (teacherDoc.exists) {
                const teacherData = teacherDoc.data();
                classTeacher = {
                  id: teacherId,
                  name: teacherData?.fullName || teacherData?.nameWithInitials || '',
                };
              }
            }
          }
        }

        return {
          id: childDoc.id,
          name: childData.fullName || '',
          className: childData.className || '',
          classTeacher,
        };
      });

      const children = await Promise.all(childrenPromises);
      return children.filter((child) => child !== null);
    } catch (error: any) {
      logger.error('Get parent children error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('FETCH_FAILED', 'Failed to fetch parent children', 500);
    }
  }

  // Helper method
  private generateInitials(name: string): string {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}

export default new UsersService();
