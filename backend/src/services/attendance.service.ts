import { db } from '../config/firebase';
import { Timestamp } from 'firebase-admin/firestore';
import { ApiErrorResponse } from '../utils/response';
import { Attendance } from '../types/attendance.types';
import logger from '../utils/logger';

export class AttendanceService {
  async getStudentsByClass(className: string): Promise<any[]> {
    try {
      const studentsSnapshot = await db.collection('students')
        .where('className', '==', className)
        .where('status', '==', 'active')
        .get();
      
      const students: any[] = [];
      
      for (const doc of studentsSnapshot.docs) {
        const studentData = doc.data();
        students.push({
          id: doc.id,
          name: studentData.fullName,
          rollNo: studentData.admissionNumber,
          admissionNumber: studentData.admissionNumber,
        });
      }
      
      // Sort by admission number
      students.sort((a, b) => a.rollNo.localeCompare(b.rollNo));
      
      return students;
    } catch (error: any) {
      logger.error('Get students by class error:', error);
      throw new ApiErrorResponse('FETCH_FAILED', 'Failed to fetch students', 500);
    }
  }

  async getAttendanceByClassAndDate(className: string, date: string): Promise<any[]> {
    try {
      // Convert date string to Timestamp range
      const dateObj = new Date(date);
      dateObj.setHours(0, 0, 0, 0);
      const startOfDay = Timestamp.fromDate(dateObj);
      dateObj.setHours(23, 59, 59, 999);
      const endOfDay = Timestamp.fromDate(dateObj);
      
      const attendanceSnapshot = await db.collection('attendance')
        .where('className', '==', className)
        .where('date', '>=', startOfDay)
        .where('date', '<=', endOfDay)
        .get();
      
      const attendance: any[] = [];
      
      for (const doc of attendanceSnapshot.docs) {
        const attendanceData = doc.data() as Attendance;
        attendance.push({
          id: doc.id,
          studentId: attendanceData.studentId,
          status: attendanceData.status,
        });
      }
      
      return attendance;
    } catch (error: any) {
      logger.error('Get attendance by class and date error:', error);
      throw new ApiErrorResponse('FETCH_FAILED', 'Failed to fetch attendance', 500);
    }
  }

  async markAttendance(data: {
    studentId: string;
    className: string;
    date: string;
    status: 'present' | 'absent' | 'late';
    markedBy: string;
    markedByName: string;
    remarks?: string;
  }): Promise<any> {
    try {
      // Convert date string to Timestamp
      const dateObj = new Date(data.date);
      dateObj.setHours(0, 0, 0, 0);
      const attendanceDate = Timestamp.fromDate(dateObj);
      const startOfDay = attendanceDate;
      dateObj.setHours(23, 59, 59, 999);
      const endOfDay = Timestamp.fromDate(dateObj);
      
      const existingAttendance = await db.collection('attendance')
        .where('studentId', '==', data.studentId)
        .where('date', '>=', startOfDay)
        .where('date', '<=', endOfDay)
        .limit(1)
        .get();
      
      // Get student data
      const studentDoc = await db.collection('students').doc(data.studentId).get();
      if (!studentDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Student not found', 404);
      }
      const studentData = studentDoc.data();
      
      const attendanceData: Omit<Attendance, 'id'> = {
        studentId: data.studentId,
        studentName: studentData?.fullName || '',
        classId: studentData?.classId || data.className,
        className: data.className,
        date: attendanceDate,
        status: data.status,
        markedBy: data.markedBy,
        markedByName: data.markedByName,
        remarks: data.remarks || undefined,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      if (!existingAttendance.empty) {
        // Update existing attendance
        const existingDoc = existingAttendance.docs[0];
        await db.collection('attendance').doc(existingDoc.id).update({
          status: data.status,
          markedBy: data.markedBy,
          markedByName: data.markedByName,
          remarks: data.remarks || undefined,
          updatedAt: Timestamp.now(),
        });
        
        return {
          id: existingDoc.id,
          ...attendanceData,
        };
      } else {
        // Create new attendance record
        const attendanceRef = await db.collection('attendance').add(attendanceData);
        
        return {
          id: attendanceRef.id,
          ...attendanceData,
        };
      }
    } catch (error: any) {
      logger.error('Mark attendance error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('CREATE_FAILED', 'Failed to mark attendance', 500);
    }
  }

  async markBulkAttendance(data: {
    className: string;
    date: string;
    attendance: Array<{
      studentId: string;
      status: 'present' | 'absent' | 'late';
    }>;
    markedBy: string;
    markedByName: string;
  }): Promise<any> {
    try {
      if (!data.attendance || data.attendance.length === 0) {
        throw new ApiErrorResponse('VALIDATION_ERROR', 'No attendance data provided', 400);
      }

      // Validate status values
      const validStatuses = ['present', 'absent', 'late'];
      for (const item of data.attendance) {
        if (!validStatuses.includes(item.status)) {
          throw new ApiErrorResponse('VALIDATION_ERROR', `Invalid status: ${item.status}. Must be one of: ${validStatuses.join(', ')}`, 400);
        }
        if (!item.studentId) {
          throw new ApiErrorResponse('VALIDATION_ERROR', 'Student ID is required for each attendance record', 400);
        }
      }

      const batch = db.batch();
      const results: any[] = [];
      
      // Convert date string to Timestamp
      const dateObj = new Date(data.date);
      if (isNaN(dateObj.getTime())) {
        throw new ApiErrorResponse('VALIDATION_ERROR', 'Invalid date format', 400);
      }
      dateObj.setHours(0, 0, 0, 0);
      const attendanceDate = Timestamp.fromDate(dateObj);
      dateObj.setHours(23, 59, 59, 999);
      const endOfDay = Timestamp.fromDate(dateObj);
      
      // Get unique student IDs
      const studentIds = Array.from(new Set(data.attendance.map(item => item.studentId)));
      
      // Fetch all students first to validate they exist
      const studentDocs = await Promise.all(
        studentIds.map(id => db.collection('students').doc(id).get())
      );
      
      const studentMap = new Map();
      studentDocs.forEach((doc, index) => {
        if (doc.exists) {
          studentMap.set(studentIds[index], doc.data());
        }
      });

      // Fetch all existing attendance records for these students on this date
      // Query by studentId only (avoids composite index requirement) and filter by date in memory
      const existingAttendanceQueries = await Promise.all(
        studentIds.map(studentId => 
          db.collection('attendance')
            .where('studentId', '==', studentId)
            .get()
        )
      );
      
      // Create a map of existing attendance by studentId
      const existingAttendanceMap = new Map<string, { id: string; date: Timestamp }>();
      existingAttendanceQueries.forEach((querySnapshot) => {
        querySnapshot.docs.forEach((doc) => {
          const attendanceData = doc.data();
          const docDate = attendanceData.date as Timestamp;
          // Check if the date is within our target date range
          if (docDate && docDate >= attendanceDate && docDate <= endOfDay) {
            existingAttendanceMap.set(attendanceData.studentId, {
              id: doc.id,
              date: docDate,
            });
          }
        });
      });

      for (const item of data.attendance) {
        const studentData = studentMap.get(item.studentId);
        if (!studentData) {
          logger.warn(`Student ${item.studentId} not found, skipping`);
          continue; // Skip if student not found
        }
        
        const attendanceData: Omit<Attendance, 'id'> = {
          studentId: item.studentId,
          studentName: studentData.fullName || '',
          classId: studentData.classId || data.className,
          className: data.className,
          date: attendanceDate,
          status: item.status,
          markedBy: data.markedBy,
          markedByName: data.markedByName,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };
        
        const existing = existingAttendanceMap.get(item.studentId);
        if (existing) {
          // Update existing
          batch.update(db.collection('attendance').doc(existing.id), {
            status: item.status,
            markedBy: data.markedBy,
            markedByName: data.markedByName,
            updatedAt: Timestamp.now(),
          });
          results.push({ id: existing.id, studentId: item.studentId, status: item.status });
        } else {
          // Create new
          const attendanceRef = db.collection('attendance').doc();
          batch.set(attendanceRef, attendanceData);
          results.push({ id: attendanceRef.id, studentId: item.studentId, status: item.status });
        }
      }
      
      if (results.length === 0) {
        throw new ApiErrorResponse('VALIDATION_ERROR', 'No valid students found to mark attendance', 400);
      }
      
      await batch.commit();
      
      return { marked: results.length, attendance: results };
    } catch (error: any) {
      logger.error('Mark bulk attendance error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('CREATE_FAILED', error.message || 'Failed to mark attendance', 500);
    }
  }

  async getAttendanceStats(studentId: string): Promise<any> {
    try {
      const studentDoc = await db.collection('students').doc(studentId).get();
      
      if (!studentDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Student not found', 404);
      }
      
      // Get all attendance records for this student
      const attendanceSnapshot = await db.collection('attendance')
        .where('studentId', '==', studentId)
        .get();
      
      const totalDays = attendanceSnapshot.size;
      const presentDays = attendanceSnapshot.docs.filter(doc => doc.data().status === 'present').length;
      const absentDays = attendanceSnapshot.docs.filter(doc => doc.data().status === 'absent').length;
      const lateDays = attendanceSnapshot.docs.filter(doc => doc.data().status === 'late').length;
      
      const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
      
      return {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        attendanceRate,
      };
    } catch (error: any) {
      logger.error('Get attendance stats error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('FETCH_FAILED', 'Failed to fetch attendance stats', 500);
    }
  }

  async getAttendanceHistory(className: string, startDate: string, endDate: string): Promise<any[]> {
    try {
      const startDateObj = new Date(startDate);
      startDateObj.setHours(0, 0, 0, 0);
      const startTimestamp = Timestamp.fromDate(startDateObj);
      
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999);
      const endTimestamp = Timestamp.fromDate(endDateObj);
      
      // Query by className only (to avoid composite index requirement), then filter by date in memory
      const attendanceSnapshot = await db.collection('attendance')
        .where('className', '==', className)
        .get();
      
      // Group by date and filter by date range
      const attendanceByDate = new Map<string, any[]>();
      
      for (const doc of attendanceSnapshot.docs) {
        const attendanceData = doc.data() as Attendance;
        const docDate = attendanceData.date as Timestamp;
        
        // Filter by date range in memory
        if (docDate && docDate >= startTimestamp && docDate <= endTimestamp) {
          const date = docDate.toDate().toISOString().split('T')[0];
          
          if (!attendanceByDate.has(date)) {
            attendanceByDate.set(date, []);
          }
          
          attendanceByDate.get(date)!.push({
            id: doc.id,
            studentId: attendanceData.studentId,
            studentName: attendanceData.studentName,
            status: attendanceData.status,
            markedBy: attendanceData.markedByName,
            markedAt: attendanceData.updatedAt.toDate().toISOString(),
          });
        }
      }
      
      // Convert to array format
      const result: any[] = [];
      attendanceByDate.forEach((records, date) => {
        result.push({
          date,
          records,
          present: records.filter(r => r.status === 'present').length,
          absent: records.filter(r => r.status === 'absent').length,
          late: records.filter(r => r.status === 'late').length,
          total: records.length,
        });
      });
      
      // Sort by date descending
      result.sort((a, b) => b.date.localeCompare(a.date));
      
      return result;
    } catch (error: any) {
      logger.error('Get attendance history error:', error);
      throw new ApiErrorResponse('FETCH_FAILED', 'Failed to fetch attendance history', 500);
    }
  }
}
