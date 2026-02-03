import { db } from '../config/firebase';
import { Timestamp } from 'firebase-admin/firestore';
import { ApiErrorResponse } from '../utils/response';
import { Mark } from '../types/marks.types';
import { NotificationsService } from './notifications.service';
import logger from '../utils/logger';

const notificationsService = new NotificationsService();

function calculateGrade(marks: number, totalMarks: number): string {
  const percentage = (marks / totalMarks) * 100;
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 75) return 'B+';
  if (percentage >= 70) return 'B';
  if (percentage >= 65) return 'C+';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
}

export class MarksService {
  async getMarksByExam(examId: string, className?: string, subjectId?: string, limit?: number): Promise<any[]> {
    try {
      let query = db.collection('marks').where('examId', '==', examId);
      
      if (className) {
        query = query.where('className', '==', className) as any;
      }
      
      if (subjectId) {
        query = query.where('subjectId', '==', subjectId) as any;
      }
      
      // OPTIMIZED: Add limit to prevent fetching unlimited marks (default 500)
      const queryLimit = limit || 500;
      query = query.limit(queryLimit) as any;
      
      const marksSnapshot = await query.get();
      const marks: any[] = [];
      
      for (const doc of marksSnapshot.docs) {
        const markData = doc.data() as Mark;
        const createdAt = markData.createdAt as Timestamp;
        const updatedAt = markData.updatedAt as Timestamp;
        
        marks.push({
          id: doc.id,
          studentId: markData.studentId,
          studentName: markData.studentName,
          examId: markData.examId,
          examName: markData.examName,
          subjectId: markData.subjectId,
          subjectName: markData.subjectName,
          classId: markData.classId,
          className: markData.className,
          marks: markData.marks,
          totalMarks: markData.totalMarks,
          grade: markData.grade,
          percentage: markData.percentage,
          rank: markData.rank,
          remarks: markData.remarks,
          examPaperUrl: markData.examPaperUrl,
          enteredBy: markData.enteredBy,
          enteredByName: markData.enteredByName,
          createdAt: createdAt ? createdAt.toDate().toISOString() : '',
          updatedAt: updatedAt ? updatedAt.toDate().toISOString() : '',
        });
      }
      
      return marks;
    } catch (error: any) {
      logger.error('Get marks by exam error:', error);
      throw new ApiErrorResponse('FETCH_FAILED', 'Failed to fetch marks', 500);
    }
  }

  async getStudentsForMarksEntry(className: string): Promise<any[]> {
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
      logger.error('Get students for marks entry error:', error);
      throw new ApiErrorResponse('FETCH_FAILED', 'Failed to fetch students', 500);
    }
  }

  async enterMarks(data: {
    examId: string;
    examName: string;
    className: string;
    subjectId: string;
    subjectName: string;
    totalMarks: number;
    marks: Array<{
      studentId: string;
      studentName: string;
      admissionNumber: string;
      marks: number;
      remarks?: string;
      examPaperUrl?: string;
    }>;
    enteredBy: string;
    enteredByName: string;
  }): Promise<any> {
    try {
      if (!data.examId || !data.className || !data.subjectId || !data.marks || !Array.isArray(data.marks)) {
        throw new ApiErrorResponse('VALIDATION_ERROR', 'Missing required fields', 400);
      }

      if (data.marks.length === 0) {
        throw new ApiErrorResponse('VALIDATION_ERROR', 'No marks provided', 400);
      }

      // Get class ID from class name
      const classesSnapshot = await db.collection('classes')
        .where('name', '==', data.className)
        .limit(1)
        .get();
      
      let classId = '';
      if (!classesSnapshot.empty) {
        classId = classesSnapshot.docs[0].id;
      }

      const results: any[] = [];
      const batch = db.batch();

      for (const markEntry of data.marks) {
        if (markEntry.marks < 0 || markEntry.marks > data.totalMarks) {
          throw new ApiErrorResponse('VALIDATION_ERROR', `Invalid marks for student ${markEntry.studentName}. Must be between 0 and ${data.totalMarks}`, 400);
        }

        const percentage = (markEntry.marks / data.totalMarks) * 100;
        const grade = calculateGrade(markEntry.marks, data.totalMarks);

        // Check if mark already exists (with fallback for missing index)
        let existingMarksSnapshot;
        try {
          existingMarksSnapshot = await db.collection('marks')
            .where('examId', '==', data.examId)
            .where('studentId', '==', markEntry.studentId)
            .where('subjectId', '==', data.subjectId)
            .limit(1)
            .get();
        } catch (indexError: any) {
          // If index doesn't exist, fallback to query by examId and studentId, filter by subjectId in memory
          if (indexError.code === 9 || indexError.message?.includes('index')) {
            const partialSnapshot = await db.collection('marks')
              .where('examId', '==', data.examId)
              .where('studentId', '==', markEntry.studentId)
              .limit(50) // Reasonable limit
              .get();
            
            // Filter by subjectId in memory
            const filteredDocs = partialSnapshot.docs.filter(doc => {
              const markData = doc.data() as Mark;
              return markData.subjectId === data.subjectId;
            });
            
            existingMarksSnapshot = {
              docs: filteredDocs.slice(0, 1), // Take first match
              empty: filteredDocs.length === 0,
              size: filteredDocs.length > 0 ? 1 : 0,
            } as any;
          } else {
            throw indexError;
          }
        }

        const markData: Omit<Mark, 'id'> = {
          studentId: markEntry.studentId,
          studentName: markEntry.studentName,
          examId: data.examId,
          examName: data.examName,
          subjectId: data.subjectId,
          subjectName: data.subjectName,
          classId: classId,
          className: data.className,
          marks: markEntry.marks,
          totalMarks: data.totalMarks,
          grade,
          percentage: Math.round(percentage * 100) / 100,
          remarks: markEntry.remarks,
          examPaperUrl: markEntry.examPaperUrl,
          enteredBy: data.enteredBy,
          enteredByName: data.enteredByName,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        if (!existingMarksSnapshot.empty) {
          // Update existing mark
          const existingDoc = existingMarksSnapshot.docs[0];
          batch.update(existingDoc.ref, {
            ...markData,
            updatedAt: Timestamp.now(),
          });
          results.push({ id: existingDoc.id, ...markData });
        } else {
          // Create new mark
          const markRef = db.collection('marks').doc();
          batch.set(markRef, markData);
          results.push({ id: markRef.id, ...markData });
        }
      }

      await batch.commit();

      // Create notifications for parents of students whose marks were entered
      try {
        const studentIds = Array.from(new Set(data.marks.map(m => m.studentId)));
        const parentUserIds: string[] = [];
        
        // Get parent IDs for students (fetch documents directly by ID)
        for (const studentId of studentIds) {
          const studentDoc = await db.collection('students').doc(studentId).get();
          if (studentDoc.exists) {
            const studentData = studentDoc.data();
            if (studentData?.parentId) {
              const parentDoc = await db.collection('parents').doc(studentData.parentId).get();
              if (parentDoc.exists) {
                const parentData = parentDoc.data();
                if (parentData?.userId) {
                  parentUserIds.push(parentData.userId);
                }
              }
            }
          }
        }
        
        // Remove duplicates
        const uniqueParentIds = Array.from(new Set(parentUserIds));
        
        if (uniqueParentIds.length > 0) {
          await notificationsService.createBulkNotifications(uniqueParentIds, {
            type: 'marks',
            title: `New Marks Published: ${data.examName}`,
            message: `Marks for ${data.subjectName} have been published. Check your child's performance.`,
            link: '/dashboard/marks',
            data: { examId: data.examId, subjectId: data.subjectId },
            priority: 'normal',
          });
        }
      } catch (notifError: any) {
        // Log error but don't fail marks entry
        logger.error('Failed to create notifications for marks:', notifError);
      }

      return {
        marked: results.length,
        marks: results,
      };
    } catch (error: any) {
      logger.error('Enter marks error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('CREATE_FAILED', 'Failed to enter marks', 500);
    }
  }

  async updateMark(id: string, data: {
    marks?: number;
    remarks?: string;
    totalMarks?: number;
    examPaperUrl?: string | null;
  }): Promise<any> {
    try {
      const markDoc = await db.collection('marks').doc(id).get();
      
      if (!markDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Mark not found', 404);
      }

      const markData = markDoc.data() as Mark;
      const totalMarks = data.totalMarks || markData.totalMarks;
      const marks = data.marks !== undefined ? data.marks : markData.marks;

      if (marks < 0 || marks > totalMarks) {
        throw new ApiErrorResponse('VALIDATION_ERROR', `Invalid marks. Must be between 0 and ${totalMarks}`, 400);
      }

      const percentage = (marks / totalMarks) * 100;
      const grade = calculateGrade(marks, totalMarks);

      const updateData: any = {
        updatedAt: Timestamp.now(),
      };

      if (data.marks !== undefined) {
        updateData.marks = marks;
        updateData.percentage = Math.round(percentage * 100) / 100;
        updateData.grade = grade;
      }
      if (data.remarks !== undefined) {
        updateData.remarks = data.remarks;
      }
      if (data.totalMarks !== undefined) {
        updateData.totalMarks = data.totalMarks;
      }
      if (data.examPaperUrl !== undefined) {
        updateData.examPaperUrl = data.examPaperUrl || null;
      }

      await db.collection('marks').doc(id).update(updateData);

      const updatedDoc = await db.collection('marks').doc(id).get();
      const updatedData = updatedDoc.data() as Mark;
      const createdAt = updatedData.createdAt as Timestamp;
      const updatedAt = updatedData.updatedAt as Timestamp;

      return {
        ...updatedData,
        id: updatedDoc.id,
        createdAt: createdAt ? createdAt.toDate().toISOString() : '',
        updatedAt: updatedAt ? updatedAt.toDate().toISOString() : '',
      };
    } catch (error: any) {
      logger.error('Update mark error:', error);
      if (error instanceof ApiErrorResponse) {
        throw error;
      }
      throw new ApiErrorResponse('UPDATE_FAILED', 'Failed to update mark', 500);
    }
  }

  async getStudentMarks(studentId: string, examId?: string, subjectId?: string, limit?: number): Promise<{ marks: any[]; classRank?: number; classSize?: number }> {
    try {
      // OPTIMIZED: Use Firestore ordering if index exists, otherwise fallback to in-memory sort
      let marksSnapshot;
      let usedFallback = false;
      const queryLimit = limit || 500;
      
      try {
        // Try with orderBy first (requires index)
        let query = db.collection('marks').where('studentId', '==', studentId);
        
        if (examId) {
          query = query.where('examId', '==', examId) as any;
        }
        
        if (subjectId) {
          query = query.where('subjectId', '==', subjectId) as any;
        }
        
        query = query.orderBy('updatedAt', 'desc').limit(queryLimit) as any;
        marksSnapshot = await query.get();
      } catch (indexError: any) {
        // If index doesn't exist, fallback to query without orderBy
        if (indexError.code === 9 || indexError.message?.includes('index')) {
          logger.warn('Firestore index not found for marks. Using fallback query. Please create index: marks(studentId, updatedAt DESC)');
          let query = db.collection('marks').where('studentId', '==', studentId);
          
          if (examId) {
            query = query.where('examId', '==', examId) as any;
          }
          
          if (subjectId) {
            query = query.where('subjectId', '==', subjectId) as any;
          }
          
          query = query.limit(queryLimit) as any;
          marksSnapshot = await query.get();
          usedFallback = true;
        } else {
          throw indexError;
        }
      }
      
      const marks: any[] = [];
      
      for (const doc of marksSnapshot.docs) {
        const markData = doc.data() as Mark;
        const createdAt = markData.createdAt as Timestamp;
        const updatedAt = markData.updatedAt as Timestamp;
        
        marks.push({
          id: doc.id,
          studentId: markData.studentId,
          studentName: markData.studentName,
          examId: markData.examId,
          examName: markData.examName,
          subjectId: markData.subjectId,
          subjectName: markData.subjectName,
          classId: markData.classId,
          className: markData.className,
          marks: markData.marks,
          totalMarks: markData.totalMarks,
          grade: markData.grade,
          percentage: markData.percentage,
          rank: markData.rank,
          remarks: markData.remarks,
          examPaperUrl: markData.examPaperUrl,
          enteredBy: markData.enteredBy,
          enteredByName: markData.enteredByName,
          createdAt: createdAt ? createdAt.toDate().toISOString() : '',
          updatedAt: updatedAt ? updatedAt.toDate().toISOString() : '',
        });
      }
      
      // Sort in memory if we used fallback query (no orderBy)
      if (usedFallback) {
        marks.sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt).getTime();
          const dateB = new Date(b.updatedAt || b.createdAt).getTime();
          return dateB - dateA; // Descending order (most recent first)
        });
      }

      // Compute class rank for parent view (same class, same exam-subject scope)
      let classRank: number | undefined;
      let classSize: number | undefined;
      if (marks.length > 0) {
        const first = marks[0];
        const className = first.className;
        if (className) {
          try {
            const rankResult = await this.computeClassRank(studentId, className, marks);
            classRank = rankResult.classRank;
            classSize = rankResult.classSize;
          } catch (_) {
            // keep undefined on error
          }
        }
      }

      return { marks, classRank, classSize };
    } catch (error: any) {
      logger.error('Get student marks error:', error);
      throw new ApiErrorResponse('FETCH_FAILED', 'Failed to fetch student marks', 500);
    }
  }

  /** Compute class rank: rank by total percentage over the same (examId, subjectId) entries the student has. */
  private async computeClassRank(
    studentId: string,
    className: string,
    studentMarks: any[]
  ): Promise<{ classRank: number; classSize: number }> {
    try {
      const keySet = new Set<string>();
      const totalPossibleByKey: Record<string, number> = {};
      for (const m of studentMarks) {
        const key = `${m.examId}|${m.subjectId}`;
        keySet.add(key);
        if (totalPossibleByKey[key] == null) totalPossibleByKey[key] = m.totalMarks || 0;
      }
      if (keySet.size === 0) return { classRank: 0, classSize: 0 };

      const classMarksSnap = await db.collection('marks')
        .where('className', '==', className)
        .limit(2000)
        .get();

      const studentTotals: Record<string, { obtained: number; possible: number }> = {};
      for (const doc of classMarksSnap.docs) {
        const d = doc.data() as any;
        const key = `${d.examId}|${d.subjectId}`;
        if (!keySet.has(key)) continue;
        const sid = d.studentId;
        if (!sid) continue;
        if (!studentTotals[sid]) studentTotals[sid] = { obtained: 0, possible: 0 };
        const possible = d.totalMarks || 0;
        studentTotals[sid].obtained += d.marks ?? 0;
        studentTotals[sid].possible += possible;
      }

      const ranked = Object.entries(studentTotals)
        .filter(([, t]) => t.possible > 0)
        .map(([sid, t]) => ({ studentId: sid, pct: t.obtained / t.possible }))
        .sort((a, b) => b.pct - a.pct);

      const classSize = ranked.length;
      const idx = ranked.findIndex((r) => r.studentId === studentId);
      const classRank = idx >= 0 ? idx + 1 : 0;
      return { classRank, classSize };
    } catch (err: any) {
      logger.warn('Class rank computation failed:', err?.message);
      return { classRank: 0, classSize: 0 };
    }
  }

  /** Class progress stats for teacher dashboard: class average, pass rate, subject performance, top performers */
  async getClassProgressStats(className: string): Promise<{
    classAverage: number;
    passRate: number;
    subjectPerformance: Array<{ subject: string; average: number }>;
    topPerformers: Array<{ name: string; marks: number }>;
  }> {
    try {
      const marksSnapshot = await db.collection('marks')
        .where('className', '==', className)
        .limit(2000)
        .get();

      const marks: any[] = marksSnapshot.docs.map((doc) => {
        const d = doc.data() as any;
        return {
          studentId: d.studentId,
          studentName: d.studentName,
          subjectName: d.subjectName || 'Unknown',
          percentage: typeof d.percentage === 'number' ? d.percentage : (d.totalMarks ? Math.round((d.marks / d.totalMarks) * 100) : 0),
        };
      });

      if (marks.length === 0) {
        return {
          classAverage: 0,
          passRate: 0,
          subjectPerformance: [],
          topPerformers: [],
        };
      }

      const byStudent = new Map<string, number[]>();
      const bySubject = new Map<string, number[]>();
      for (const m of marks) {
        const arrS = byStudent.get(m.studentId) || [];
        arrS.push(m.percentage);
        byStudent.set(m.studentId, arrS);
        const arrSub = bySubject.get(m.subjectName) || [];
        arrSub.push(m.percentage);
        bySubject.set(m.subjectName, arrSub);
      }

      const studentAverages: Array<{ studentId: string; studentName: string; avg: number }> = [];
      for (const [studentId, percents] of byStudent) {
        const studentName = marks.find((m) => m.studentId === studentId)?.studentName || 'Student';
        const avg = percents.length > 0 ? Math.round(percents.reduce((a, b) => a + b, 0) / percents.length) : 0;
        studentAverages.push({ studentId, studentName, avg });
      }

      const classAverage = studentAverages.length > 0
        ? Math.round(studentAverages.reduce((s, x) => s + x.avg, 0) / studentAverages.length * 10) / 10
        : 0;
      const passed = studentAverages.filter((s) => s.avg >= 50).length;
      const passRate = studentAverages.length > 0 ? Math.round((passed / studentAverages.length) * 100) : 0;

      const subjectPerformance = Array.from(bySubject.entries()).map(([subject, percents]) => ({
        subject,
        average: percents.length > 0 ? Math.round(percents.reduce((a, b) => a + b, 0) / percents.length) : 0,
      })).sort((a, b) => b.average - a.average);

      const topPerformers = studentAverages
        .slice()
        .sort((a, b) => b.avg - a.avg)
        .slice(0, 5)
        .map((s) => ({ name: s.studentName, marks: s.avg }));

      return {
        classAverage,
        passRate,
        subjectPerformance,
        topPerformers,
      };
    } catch (error: any) {
      logger.error('Get class progress stats error:', error);
      throw new ApiErrorResponse('FETCH_FAILED', 'Failed to fetch class progress stats', 500);
    }
  }
}
