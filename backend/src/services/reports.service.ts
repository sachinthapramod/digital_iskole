import { db } from '../config/firebase';
import { Timestamp } from 'firebase-admin/firestore';
import { ApiErrorResponse } from '../utils/response';
import logger from '../utils/logger';

type ReportStatus = 'completed' | 'failed';
type ReportType = 'student' | 'class' | 'school';

export interface ReportRecord {
  id: string;
  type: ReportType;
  status: ReportStatus;
  title: string;
  createdBy: string;
  createdByRole: 'admin' | 'teacher' | 'parent';
  createdAt: string;
  studentId?: string;
  studentName?: string;
  classId?: string;
  className?: string;
  term?: string;
  data?: Record<string, any>;
}

function calculateGradeFromPercent(percent: number): string {
  if (percent >= 90) return 'A+';
  if (percent >= 80) return 'A';
  if (percent >= 75) return 'B+';
  if (percent >= 70) return 'B';
  if (percent >= 65) return 'C+';
  if (percent >= 60) return 'C';
  if (percent >= 50) return 'D';
  return 'F';
}

/** Map examId -> 'first-term' | 'second-term' | 'third-term' for annual report aggregation */
async function getExamIdToTermMap(): Promise<Map<string, 'first-term' | 'second-term' | 'third-term'>> {
  const snapshot = await db.collection('exams').get();
  const map = new Map<string, 'first-term' | 'second-term' | 'third-term'>();
  for (const doc of snapshot.docs) {
    const data = doc.data() as any;
    const type = data?.type;
    if (type === 'first-term' || type === 'second-term' || type === 'third-term') {
      map.set(doc.id, type);
    }
  }
  return map;
}

/** Compute average percent from mark docs for one student (term or Annual). */
function computeAveragePercentFromMarks(
  marks: any[],
  isAnnual: boolean,
  examIdToTerm: Map<string, 'first-term' | 'second-term' | 'third-term'> | null
): number {
  if (marks.length === 0) return 0;
  if (isAnnual && examIdToTerm) {
    const bySubjectTerm = new Map<string, { 'first-term'?: any; 'second-term'?: any; 'third-term'?: any }>();
    const bySubjectAll = new Map<string, any[]>();
    for (const m of marks) {
      const key = m.subjectName || 'Unknown Subject';
      const arr = bySubjectAll.get(key) || [];
      arr.push(m);
      bySubjectAll.set(key, arr);
      const termType = examIdToTerm.get(m.examId);
      if (!termType) continue;
      let entry = bySubjectTerm.get(key);
      if (!entry) {
        entry = {};
        bySubjectTerm.set(key, entry);
      }
      const existing = entry[termType];
      const mTime = (m.updatedAt || m.createdAt)?.toMillis?.() || 0;
      const eTime = existing ? (existing.updatedAt || existing.createdAt)?.toMillis?.() || 0 : 0;
      if (!existing || mTime > eTime) entry[termType] = m;
    }
    const percents: number[] = [];
    const subjectKeys = new Set([...bySubjectTerm.keys(), ...bySubjectAll.keys()]);
    for (const subjectName of subjectKeys) {
      const entry = bySubjectTerm.get(subjectName);
      const t1 = entry?.['first-term'];
      const t2 = entry?.['second-term'];
      const t3 = entry?.['third-term'];
      const p1 = t1?.totalMarks ? Math.round((t1.marks / t1.totalMarks) * 100) : null;
      const p2 = t2?.totalMarks ? Math.round((t2.marks / t2.totalMarks) * 100) : null;
      const p3 = t3?.totalMarks ? Math.round((t3.marks / t3.totalMarks) * 100) : null;
      const termPercents = [p1, p2, p3].filter((p): p is number => typeof p === 'number');
      if (termPercents.length > 0) {
        percents.push(Math.round(termPercents.reduce((s, p) => s + p, 0) / termPercents.length));
      } else {
        const allMarks = bySubjectAll.get(subjectName) || [];
        const sorted = allMarks.slice().sort((a, b) => {
          const aT = (a.updatedAt || a.createdAt)?.toMillis?.() || 0;
          const bT = (b.updatedAt || b.createdAt)?.toMillis?.() || 0;
          return bT - aT;
        });
        const latest = sorted[0];
        const p = latest?.totalMarks
          ? Math.round((latest.marks / latest.totalMarks) * 100)
          : typeof latest?.percentage === 'number'
            ? Math.round(latest.percentage)
            : 0;
        percents.push(p);
      }
    }
    return percents.length > 0 ? Math.round(percents.reduce((sum, p) => sum + p, 0) / percents.length) : 0;
  }
  const bySubject = new Map<string, any[]>();
  for (const m of marks) {
    const key = m.subjectName || 'Unknown Subject';
    const arr = bySubject.get(key) || [];
    arr.push(m);
    bySubject.set(key, arr);
  }
  const latestPerSubject = Array.from(bySubject.values()).map((list) => {
    const sorted = list.slice().sort((a, b) => {
      const aT = (a.updatedAt || a.createdAt)?.toMillis?.() || 0;
      const bT = (b.updatedAt || b.createdAt)?.toMillis?.() || 0;
      return bT - aT;
    });
    return sorted[0];
  });
  const percentages = latestPerSubject
    .map((m) => (typeof m?.percentage === 'number' ? m.percentage : m?.totalMarks ? Math.round((m.marks / m.totalMarks) * 100) : 0))
    .filter((p) => typeof p === 'number');
  return percentages.length > 0 ? Math.round(percentages.reduce((sum, p) => sum + p, 0) / percentages.length) : 0;
}

export class ReportsService {
  async listReportsForAdmin(limit: number = 50): Promise<ReportRecord[]> {
    try {
      // OPTIMIZED: Use Firestore ordering and limit if index exists, otherwise fallback
      let snapshot;
      let usedFallback = false;
      try {
        snapshot = await db.collection('reports')
          .orderBy('createdAt', 'desc')
          .limit(limit)
          .get();
      } catch (indexError: any) {
        // If index doesn't exist, fallback to query without orderBy
        if (indexError.code === 9 || indexError.message?.includes('index')) {
          logger.warn('Firestore index not found for reports. Using fallback query. Please create index: reports(createdAt DESC)');
          snapshot = await db.collection('reports')
            .limit(limit)
            .get();
          usedFallback = true;
        } else {
          throw indexError;
        }
      }
      
      const reports: ReportRecord[] = snapshot.docs.map((doc) => {
        const d = doc.data() as any;
        const createdAt = d.createdAt as Timestamp;
        return {
          id: doc.id,
          type: d.type,
          status: d.status,
          title: d.title,
          createdBy: d.createdBy,
          createdByRole: d.createdByRole,
          createdAt: createdAt ? createdAt.toDate().toISOString() : '',
          studentId: d.studentId,
          studentName: d.studentName,
          classId: d.classId,
          className: d.className,
          term: d.term,
        };
      });

      // Sort in memory if we used fallback query (no orderBy)
      if (usedFallback) {
        reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      return reports;
    } catch (error: any) {
      logger.error('List reports (admin) error:', error);
      throw new ApiErrorResponse('FETCH_FAILED', 'Failed to fetch reports', 500);
    }
  }

  async listReportsForUser(userId: string, limit: number = 50): Promise<ReportRecord[]> {
    try {
      // OPTIMIZED: Use Firestore ordering and limit if index exists, otherwise fallback
      let snapshot;
      let usedFallback = false;
      try {
        snapshot = await db.collection('reports')
          .where('createdBy', '==', userId)
          .orderBy('createdAt', 'desc')
          .limit(limit)
          .get();
      } catch (indexError: any) {
        // If index doesn't exist, fallback to query without orderBy
        if (indexError.code === 9 || indexError.message?.includes('index')) {
          logger.warn('Firestore index not found for reports. Using fallback query. Please create index: reports(createdBy, createdAt DESC)');
          snapshot = await db.collection('reports')
            .where('createdBy', '==', userId)
            .limit(limit)
            .get();
          usedFallback = true;
        } else {
          throw indexError;
        }
      }
      
      const reports: ReportRecord[] = snapshot.docs.map((doc) => {
        const d = doc.data() as any;
        const createdAt = d.createdAt as Timestamp;
        return {
          id: doc.id,
          type: d.type,
          status: d.status,
          title: d.title,
          createdBy: d.createdBy,
          createdByRole: d.createdByRole,
          createdAt: createdAt ? createdAt.toDate().toISOString() : '',
          studentId: d.studentId,
          studentName: d.studentName,
          classId: d.classId,
          className: d.className,
          term: d.term,
        };
      });

      // Sort in memory if we used fallback query (no orderBy)
      if (usedFallback) {
        reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      return reports;
    } catch (error: any) {
      logger.error('List reports (user) error:', error);
      throw new ApiErrorResponse('FETCH_FAILED', 'Failed to fetch reports', 500);
    }
  }

  async getReport(id: string, userId: string, role: string): Promise<ReportRecord> {
    const doc = await db.collection('reports').doc(id).get();
    if (!doc.exists) {
      throw new ApiErrorResponse('NOT_FOUND', 'Report not found', 404);
    }

    const d = doc.data() as any;
    if (role !== 'admin' && d.createdBy !== userId) {
      throw new ApiErrorResponse('AUTH_UNAUTHORIZED', 'Not authorized to view this report', 403);
    }

    const createdAt = d.createdAt as Timestamp;
    return {
      id: doc.id,
      type: d.type,
      status: d.status,
      title: d.title,
      createdBy: d.createdBy,
      createdByRole: d.createdByRole,
      createdAt: createdAt ? createdAt.toDate().toISOString() : '',
      studentId: d.studentId,
      studentName: d.studentName,
      classId: d.classId,
      className: d.className,
      term: d.term,
      data: d.data,
    };
  }

  async deleteReport(id: string, userId: string, role: string): Promise<void> {
    const doc = await db.collection('reports').doc(id).get();
    if (!doc.exists) {
      throw new ApiErrorResponse('NOT_FOUND', 'Report not found', 404);
    }
    const d = doc.data() as any;
    if (role !== 'admin' && d.createdBy !== userId) {
      throw new ApiErrorResponse('AUTH_UNAUTHORIZED', 'Not authorized to delete this report', 403);
    }
    await db.collection('reports').doc(id).delete();
  }

  /** Update report document with cached PDF filename so download can use signed URL without Puppeteer. */
  async updateReportPdfPath(reportId: string, pdfFilename: string): Promise<void> {
    const doc = await db.collection('reports').doc(reportId).get();
    if (!doc.exists) return;
    const d = doc.data() as any;
    const data = d.data || {};
    data.pdfFilename = pdfFilename;
    await db.collection('reports').doc(reportId).update({ data });
  }

  async generateStudentReport(params: {
    studentId: string;
    term?: string;
    reportType?: string;
    createdBy: string;
    createdByRole: 'admin' | 'teacher' | 'parent';
  }): Promise<ReportRecord> {
    try {
      const studentDoc = await db.collection('students').doc(params.studentId).get();
      if (!studentDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Student not found', 404);
      }
      const student = studentDoc.data() as any;

      // Attendance summary (full year for annual, same for single term)
      const attendanceSnap = await db.collection('attendance').where('studentId', '==', params.studentId).get();
      const totalDays = attendanceSnap.size;
      const presentDays = attendanceSnap.docs.filter((d) => d.data().status === 'present').length;
      const absentDays = attendanceSnap.docs.filter((d) => d.data().status === 'absent').length;
      const lateDays = attendanceSnap.docs.filter((d) => d.data().status === 'late').length;
      const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

      const marksSnap = await db.collection('marks').where('studentId', '==', params.studentId).get();
      const marks = marksSnap.docs.map((doc) => doc.data() as any);

      let subjects: any[];
      let averagePercent: number;
      let overallGrade: string;

      if (params.term === 'Annual') {
        // Annual report: show all 3 term columns; use term exam marks where available, else include any available marks
        const examIdToTerm = await getExamIdToTermMap();
        const bySubjectTerm = new Map<string, { 'first-term'?: any; 'second-term'?: any; 'third-term'?: any }>();
        const bySubjectAll = new Map<string, any[]>();
        for (const m of marks) {
          const key = m.subjectName || 'Unknown Subject';
          const arr = bySubjectAll.get(key) || [];
          arr.push(m);
          bySubjectAll.set(key, arr);
          const termType = examIdToTerm.get(m.examId);
          if (!termType) continue;
          let entry = bySubjectTerm.get(key);
          if (!entry) {
            entry = {};
            bySubjectTerm.set(key, entry);
          }
          const existing = entry[termType];
          const mTime = (m.updatedAt || m.createdAt)?.toMillis?.() || 0;
          const eTime = existing ? (existing.updatedAt || existing.createdAt)?.toMillis?.() || 0 : 0;
          if (!existing || mTime > eTime) entry[termType] = m;
        }
        const subjectKeys = new Set([...bySubjectTerm.keys(), ...bySubjectAll.keys()]);
        subjects = Array.from(subjectKeys).map((subjectName) => {
          const entry = bySubjectTerm.get(subjectName);
          const t1 = entry?.['first-term'];
          const t2 = entry?.['second-term'];
          const t3 = entry?.['third-term'];
          const p1 = t1?.totalMarks ? Math.round((t1.marks / t1.totalMarks) * 100) : null;
          const p2 = t2?.totalMarks ? Math.round((t2.marks / t2.totalMarks) * 100) : null;
          const p3 = t3?.totalMarks ? Math.round((t3.marks / t3.totalMarks) * 100) : null;
          const termPercents = [p1, p2, p3].filter((p): p is number => typeof p === 'number');
          let annualPercent: number;
          if (termPercents.length > 0) {
            annualPercent = Math.round(termPercents.reduce((s, p) => s + p, 0) / termPercents.length);
          } else {
            // No term-test marks: use available marks (latest per subject from any exam)
            const allMarks = bySubjectAll.get(subjectName) || [];
            const sorted = allMarks.slice().sort((a, b) => {
              const aT = (a.updatedAt || a.createdAt)?.toMillis?.() || 0;
              const bT = (b.updatedAt || b.createdAt)?.toMillis?.() || 0;
              return bT - aT;
            });
            const latest = sorted[0];
            annualPercent = latest?.totalMarks
              ? Math.round((latest.marks / latest.totalMarks) * 100)
              : typeof latest?.percentage === 'number'
                ? Math.round(latest.percentage)
                : 0;
          }
          return {
            subjectName,
            examName: 'Annual',
            marks: annualPercent,
            totalMarks: 100,
            percentage: annualPercent,
            grade: calculateGradeFromPercent(annualPercent),
            isAnnual: true,
            term1Marks: t1?.marks ?? null,
            term1Total: t1?.totalMarks ?? null,
            term1Percent: p1 ?? null,
            term2Marks: t2?.marks ?? null,
            term2Total: t2?.totalMarks ?? null,
            term2Percent: p2 ?? null,
            term3Marks: t3?.marks ?? null,
            term3Total: t3?.totalMarks ?? null,
            term3Percent: p3 ?? null,
          };
        });
        averagePercent = subjects.length > 0 ? Math.round(subjects.reduce((sum, s) => sum + (s.percentage || 0), 0) / subjects.length) : 0;
        overallGrade = calculateGradeFromPercent(averagePercent);
      } else {
        // Single-term report (existing logic)
        const bySubject = new Map<string, any[]>();
        for (const m of marks) {
          const key = m.subjectName || 'Unknown Subject';
          const arr = bySubject.get(key) || [];
          arr.push(m);
          bySubject.set(key, arr);
        }
        subjects = Array.from(bySubject.entries()).map(([subjectName, list]) => {
          const sorted = list.slice().sort((a, b) => {
            const aT = (a.updatedAt || a.createdAt)?.toMillis?.() || 0;
            const bT = (b.updatedAt || b.createdAt)?.toMillis?.() || 0;
            return bT - aT;
          });
          const latest = sorted[0];
          const percent =
            typeof latest?.percentage === 'number'
              ? latest.percentage
              : latest?.totalMarks
                ? Math.round((latest.marks / latest.totalMarks) * 100)
                : 0;
          return {
            subjectName,
            examName: latest?.examName || '',
            marks: latest?.marks ?? 0,
            totalMarks: latest?.totalMarks ?? 0,
            percentage: percent,
            grade: latest?.grade || calculateGradeFromPercent(percent),
          };
        });
        averagePercent = subjects.length > 0 ? Math.round(subjects.reduce((sum, s) => sum + (s.percentage || 0), 0) / subjects.length) : 0;
        overallGrade = calculateGradeFromPercent(averagePercent);
      }

      let className = student.className || '';
      if (!className && student.classId) {
        const classDoc = await db.collection('classes').doc(student.classId as string).get();
        if (classDoc.exists) className = (classDoc.data() as any)?.name || '';
      }
      const isAnnual = params.term === 'Annual';
      const examIdToTermForRank = isAnnual ? await getExamIdToTermMap() : null;

      // Class rank: compare this student's average to all classmates
      let classRank: number | null = null;
      let classSize = 0;
      if (className) {
        const classMarksSnap = await db.collection('marks').where('className', '==', className).get();
        const classMarksByStudent = new Map<string, any[]>();
        for (const doc of classMarksSnap.docs) {
          const m = doc.data() as any;
          const sid = m.studentId as string;
          if (!sid) continue;
          const arr = classMarksByStudent.get(sid) || [];
          arr.push(m);
          classMarksByStudent.set(sid, arr);
        }
        const classStudentsSnap = await db
          .collection('students')
          .where('className', '==', className)
          .where('status', '==', 'active')
          .get();
        const studentIds = classStudentsSnap.docs.map((d) => d.id);
        classSize = studentIds.length;
        const averages: { studentId: string; averagePercent: number }[] = studentIds.map((sid) => ({
          studentId: sid,
          averagePercent: computeAveragePercentFromMarks(
            classMarksByStudent.get(sid) || [],
            isAnnual,
            examIdToTermForRank
          ),
        }));
        averages.sort((a, b) => b.averagePercent - a.averagePercent);
        const rankIdx = averages.findIndex((a) => a.studentId === studentDoc.id);
        if (rankIdx >= 0) classRank = rankIdx + 1;
      }

      const hideMarksTable =
        params.reportType === 'Progress Report' || params.reportType === 'Attendance Report';
      const reportData = {
        student: {
          id: studentDoc.id,
          name: student.fullName || student.name || '',
          admissionNumber: student.admissionNumber || student.admissionNo || '',
          className,
        },
        term: params.term || '',
        reportType: params.reportType || 'Student Report',
        isAnnual,
        attendance: {
          totalDays,
          presentDays,
          absentDays,
          lateDays,
          attendanceRate,
        },
        marks: {
          subjects: hideMarksTable ? [] : subjects,
          averagePercent,
          overallGrade,
          classRank: classRank ?? undefined,
          classSize: classSize || undefined,
        },
        generatedAt: new Date().toISOString(),
      };

      const title = `${reportData.student.name} - ${reportData.reportType}${reportData.term ? ` (${reportData.term})` : ''}`;

      const ref = await db.collection('reports').add({
        type: 'student',
        status: 'completed',
        title,
        createdBy: params.createdBy,
        createdByRole: params.createdByRole,
        studentId: studentDoc.id,
        studentName: reportData.student.name,
        className: reportData.student.className,
        term: params.term || '',
        data: reportData,
        createdAt: Timestamp.now(),
      });

      return {
        id: ref.id,
        type: 'student',
        status: 'completed',
        title,
        createdBy: params.createdBy,
        createdByRole: params.createdByRole,
        createdAt: reportData.generatedAt,
        studentId: studentDoc.id,
        studentName: reportData.student.name,
        className: reportData.student.className,
        term: params.term || '',
        data: reportData,
      };
    } catch (error: any) {
      logger.error('Generate student report error:', error);
      if (error instanceof ApiErrorResponse) throw error;
      throw new ApiErrorResponse('CREATE_FAILED', error.message || 'Failed to generate student report', 500);
    }
  }

  async generateClassReport(params: {
    classId: string;
    term?: string;
    reportType?: string;
    createdBy: string;
    createdByRole: 'admin' | 'teacher' | 'parent';
  }): Promise<ReportRecord> {
    try {
      const classDoc = await db.collection('classes').doc(params.classId).get();
      if (!classDoc.exists) {
        throw new ApiErrorResponse('NOT_FOUND', 'Class not found', 404);
      }
      const classData = classDoc.data() as any;
      const className = classData?.name || '';
      const classTeacher = classData?.classTeacherName || classData?.classTeacher || 'Not assigned';

      const studentsSnap = await db
        .collection('students')
        .where('className', '==', className)
        .where('status', '==', 'active')
        .get();
      const students = studentsSnap.docs.map((d) => {
        const s = d.data() as any;
        return {
          id: d.id,
          name: s.fullName || s.name || '',
          rollNo: s.admissionNumber || s.admissionNo || '',
        };
      });
      students.sort((a, b) => String(a.rollNo).localeCompare(String(b.rollNo)));

      // Attendance for entire class (group by studentId)
      const attendanceSnap = await db.collection('attendance').where('className', '==', className).get();
      const attendanceByStudent = new Map<
        string,
        { total: number; present: number; absent: number; late: number }
      >();
      for (const doc of attendanceSnap.docs) {
        const a = doc.data() as any;
        const sid = a.studentId as string;
        if (!sid) continue;
        const cur = attendanceByStudent.get(sid) || { total: 0, present: 0, absent: 0, late: 0 };
        cur.total += 1;
        if (a.status === 'present') cur.present += 1;
        else if (a.status === 'absent') cur.absent += 1;
        else if (a.status === 'late') cur.late += 1;
        attendanceByStudent.set(sid, cur);
      }

      // Marks for entire class (group by studentId, then latest per subject or annual aggregation)
      const marksSnap = await db.collection('marks').where('className', '==', className).get();
      const marksByStudent = new Map<string, any[]>();
      for (const doc of marksSnap.docs) {
        const m = doc.data() as any;
        const sid = m.studentId as string;
        if (!sid) continue;
        const arr = marksByStudent.get(sid) || [];
        arr.push(m);
        marksByStudent.set(sid, arr);
      }

      const isAnnual = params.term === 'Annual';
      const examIdToTerm = isAnnual ? await getExamIdToTermMap() : null;

      const studentSummaries = students.map((s) => {
        const att = attendanceByStudent.get(s.id) || { total: 0, present: 0, absent: 0, late: 0 };
        const attendanceRate = att.total > 0 ? Math.round((att.present / att.total) * 100) : 0;

        const marks = marksByStudent.get(s.id) || [];
        let averagePercent: number;
        let overallGrade: string;
        let subjectsCount: number;

        if (isAnnual && examIdToTerm) {
          const bySubjectTerm = new Map<string, { 'first-term'?: any; 'second-term'?: any; 'third-term'?: any }>();
          for (const m of marks) {
            const termType = examIdToTerm.get(m.examId);
            if (!termType) continue;
            const key = m.subjectName || 'Unknown Subject';
            let entry = bySubjectTerm.get(key);
            if (!entry) {
              entry = {};
              bySubjectTerm.set(key, entry);
            }
            const existing = entry[termType];
            const mTime = (m.updatedAt || m.createdAt)?.toMillis?.() || 0;
            const eTime = existing ? (existing.updatedAt || existing.createdAt)?.toMillis?.() || 0 : 0;
            if (!existing || mTime > eTime) entry[termType] = m;
          }
          const percents: number[] = [];
          for (const [, entry] of bySubjectTerm) {
            const p1 = entry['first-term']?.totalMarks ? Math.round((entry['first-term'].marks / entry['first-term'].totalMarks) * 100) : null;
            const p2 = entry['second-term']?.totalMarks ? Math.round((entry['second-term'].marks / entry['second-term'].totalMarks) * 100) : null;
            const p3 = entry['third-term']?.totalMarks ? Math.round((entry['third-term'].marks / entry['third-term'].totalMarks) * 100) : null;
            const termPercents = [p1, p2, p3].filter((p): p is number => typeof p === 'number');
            if (termPercents.length > 0) percents.push(Math.round(termPercents.reduce((a, b) => a + b, 0) / termPercents.length));
          }
          if (percents.length === 0) {
            // No term-test marks: use available marks (latest per subject from any exam)
            const bySubjectAll = new Map<string, any[]>();
            for (const m of marks) {
              const key = m.subjectName || m.subjectId || 'Unknown Subject';
              const arr = bySubjectAll.get(key) || [];
              arr.push(m);
              bySubjectAll.set(key, arr);
            }
            for (const list of bySubjectAll.values()) {
              const sorted = list.slice().sort((a, b) => {
                const aT = (a.updatedAt || a.createdAt)?.toMillis?.() || 0;
                const bT = (b.updatedAt || b.createdAt)?.toMillis?.() || 0;
                return bT - aT;
              });
              const latest = sorted[0];
              const p = latest?.totalMarks
                ? Math.round((latest.marks / latest.totalMarks) * 100)
                : typeof latest?.percentage === 'number'
                  ? Math.round(latest.percentage)
                  : 0;
              percents.push(p);
            }
          }
          subjectsCount = percents.length;
          averagePercent = percents.length > 0 ? Math.round(percents.reduce((sum, p) => sum + p, 0) / percents.length) : 0;
          overallGrade = calculateGradeFromPercent(averagePercent);
        } else {
          const bySubject = new Map<string, any[]>();
          for (const m of marks) {
            const key = m.subjectId || m.subjectName || 'Unknown Subject';
            const arr = bySubject.get(key) || [];
            arr.push(m);
            bySubject.set(key, arr);
          }
          const latestPerSubject = Array.from(bySubject.values()).map((list) => {
            const sorted = list.slice().sort((a, b) => {
              const aT = (a.updatedAt || a.createdAt)?.toMillis?.() || 0;
              const bT = (b.updatedAt || b.createdAt)?.toMillis?.() || 0;
              return bT - aT;
            });
            return sorted[0];
          });
          const percentages = latestPerSubject
            .map((m) => (typeof m?.percentage === 'number' ? m.percentage : 0))
            .filter((p) => typeof p === 'number');
          subjectsCount = latestPerSubject.length;
          averagePercent = percentages.length > 0 ? Math.round(percentages.reduce((sum, p) => sum + p, 0) / percentages.length) : 0;
          overallGrade = calculateGradeFromPercent(averagePercent);
        }

        return {
          studentId: s.id,
          studentName: s.name,
          rollNo: s.rollNo,
          attendance: { ...att, attendanceRate },
          marks: { averagePercent, overallGrade, subjectsCount },
        };
      });

      const classAttendanceRate =
        studentSummaries.length > 0
          ? Math.round(studentSummaries.reduce((sum, s) => sum + (s.attendance.attendanceRate || 0), 0) / studentSummaries.length)
          : 0;
      const classAverageMarks =
        studentSummaries.length > 0
          ? Math.round(studentSummaries.reduce((sum, s) => sum + (s.marks.averagePercent || 0), 0) / studentSummaries.length)
          : 0;

      // Assign class rank to every student (by average % desc)
      const sortedByAvg = studentSummaries
        .slice()
        .sort((a, b) => (b.marks.averagePercent || 0) - (a.marks.averagePercent || 0));
      const studentsWithRank = sortedByAvg.map((s, idx) => ({ ...s, classRank: idx + 1 }));

      const showAllWithRankOnly =
        params.reportType === 'Term Report' || params.reportType === 'Full Academic Report';
      const topStudents = showAllWithRankOnly
        ? []
        : studentsWithRank
            .slice(0, 10)
            .map((s) => ({ rank: s.classRank, ...s }));

      const reportData = {
        class: {
          id: classDoc.id,
          name: className,
          teacher: classTeacher,
          studentCount: students.length,
        },
        term: params.term || '',
        reportType: params.reportType || 'Term Report',
        isAnnual: isAnnual,
        summary: {
          classAttendanceRate,
          classAverageMarks,
        },
        students: studentsWithRank,
        topStudents,
        generatedAt: new Date().toISOString(),
      };

      const title = `${className} - ${reportData.reportType}${reportData.term ? ` (${reportData.term})` : ''}`;

      const ref = await db.collection('reports').add({
        type: 'class',
        status: 'completed',
        title,
        createdBy: params.createdBy,
        createdByRole: params.createdByRole,
        classId: classDoc.id,
        className: className,
        term: params.term || '',
        data: reportData,
        createdAt: Timestamp.now(),
      });

      return {
        id: ref.id,
        type: 'class',
        status: 'completed',
        title,
        createdBy: params.createdBy,
        createdByRole: params.createdByRole,
        createdAt: reportData.generatedAt,
        classId: classDoc.id,
        className: className,
        term: params.term || '',
        data: reportData,
      };
    } catch (error: any) {
      logger.error('Generate class report error:', error);
      if (error instanceof ApiErrorResponse) throw error;
      throw new ApiErrorResponse('CREATE_FAILED', error.message || 'Failed to generate class report', 500);
    }
  }

  async generateSchoolReport(params: {
    term?: string;
    reportType?: string;
    createdBy: string;
    createdByRole: 'admin' | 'teacher' | 'parent';
  }): Promise<ReportRecord> {
    try {
      if (params.reportType === 'Term Report') {
        throw new ApiErrorResponse('VALIDATION_ERROR', 'Term Report is not available for school scope', 400);
      }
      const [classesSnap, studentsSnap, teachersSnap, marksSnap, attendanceSnap] = await Promise.all([
        db.collection('classes').get(),
        db.collection('students').get(),
        db.collection('teachers').get(),
        db.collection('marks').get(),
        db.collection('attendance').get(),
      ]);

      const classes = classesSnap.docs.map((d) => {
        const c = d.data() as any;
        return {
          id: d.id,
          name: c?.name || '',
          teacher: c?.classTeacherName || c?.classTeacher || 'Not assigned',
        };
      });

      const studentsAll = studentsSnap.docs.map((d) => {
        const s = d.data() as any;
        return {
          id: d.id,
          name: s?.fullName || s?.name || '',
          className: s?.className || '',
          status: s?.status,
        };
      });
      const activeStudents = studentsAll.filter((s) => s.status === 'active' || s.status === undefined);

      const studentsByClass = new Map<string, number>();
      const studentMeta = new Map<string, { name: string; className: string }>();
      for (const s of activeStudents) {
        studentsByClass.set(s.className, (studentsByClass.get(s.className) || 0) + 1);
        studentMeta.set(s.id, { name: s.name, className: s.className });
      }

      // Attendance by class
      const attendanceByClass = new Map<string, { total: number; present: number }>();
      for (const doc of attendanceSnap.docs) {
        const a = doc.data() as any;
        const cn = a.className as string;
        if (!cn) continue;
        const cur = attendanceByClass.get(cn) || { total: 0, present: 0 };
        cur.total += 1;
        if (a.status === 'present') cur.present += 1;
        attendanceByClass.set(cn, cur);
      }

      // Marks: build per-student average (latest per subject or annual aggregation)
      const marksByStudent = new Map<string, any[]>();
      for (const doc of marksSnap.docs) {
        const m = doc.data() as any;
        const sid = m.studentId as string;
        if (!sid) continue;
        const arr = marksByStudent.get(sid) || [];
        arr.push(m);
        marksByStudent.set(sid, arr);
      }

      const isAnnual = params.term === 'Annual';
      const examIdToTerm = isAnnual ? await getExamIdToTermMap() : null;

      const studentAverages: Array<{ studentId: string; name: string; className: string; averagePercent: number }> = [];
      for (const [studentId, list] of marksByStudent.entries()) {
        const meta = studentMeta.get(studentId);
        if (!meta) continue; // ignore marks for non-active/unknown students
        let avg: number;
        if (isAnnual && examIdToTerm) {
          const bySubjectTerm = new Map<string, { 'first-term'?: any; 'second-term'?: any; 'third-term'?: any }>();
          for (const m of list) {
            const termType = examIdToTerm.get(m.examId);
            if (!termType) continue;
            const key = m.subjectName || 'Unknown Subject';
            let entry = bySubjectTerm.get(key);
            if (!entry) {
              entry = {};
              bySubjectTerm.set(key, entry);
            }
            const existing = entry[termType];
            const mTime = (m.updatedAt || m.createdAt)?.toMillis?.() || 0;
            const eTime = existing ? (existing.updatedAt || existing.createdAt)?.toMillis?.() || 0 : 0;
            if (!existing || mTime > eTime) entry[termType] = m;
          }
          const percents: number[] = [];
          for (const [, entry] of bySubjectTerm) {
            const p1 = entry['first-term']?.totalMarks ? Math.round((entry['first-term'].marks / entry['first-term'].totalMarks) * 100) : null;
            const p2 = entry['second-term']?.totalMarks ? Math.round((entry['second-term'].marks / entry['second-term'].totalMarks) * 100) : null;
            const p3 = entry['third-term']?.totalMarks ? Math.round((entry['third-term'].marks / entry['third-term'].totalMarks) * 100) : null;
            const termPercents = [p1, p2, p3].filter((p): p is number => typeof p === 'number');
            if (termPercents.length > 0) percents.push(Math.round(termPercents.reduce((a, b) => a + b, 0) / termPercents.length));
          }
          if (percents.length === 0) {
            // No term-test marks: use available marks (latest per subject from any exam)
            const bySubjectAll = new Map<string, any[]>();
            for (const m of list) {
              const key = m.subjectName || m.subjectId || 'Unknown Subject';
              const arr = bySubjectAll.get(key) || [];
              arr.push(m);
              bySubjectAll.set(key, arr);
            }
            for (const arr of bySubjectAll.values()) {
              const sorted = arr.slice().sort((a, b) => {
                const aT = (a.updatedAt || a.createdAt)?.toMillis?.() || 0;
                const bT = (b.updatedAt || b.createdAt)?.toMillis?.() || 0;
                return bT - aT;
              });
              const latest = sorted[0];
              const p = latest?.totalMarks
                ? Math.round((latest.marks / latest.totalMarks) * 100)
                : typeof latest?.percentage === 'number'
                  ? Math.round(latest.percentage)
                  : 0;
              percents.push(p);
            }
          }
          avg = percents.length > 0 ? Math.round(percents.reduce((sum, p) => sum + p, 0) / percents.length) : 0;
        } else {
          const bySubject = new Map<string, any[]>();
          for (const m of list) {
            const key = m.subjectId || m.subjectName || 'Unknown Subject';
            const arr = bySubject.get(key) || [];
            arr.push(m);
            bySubject.set(key, arr);
          }
          const latest = Array.from(bySubject.values()).map((arr) => {
            const sorted = arr.slice().sort((a, b) => {
              const aT = (a.updatedAt || a.createdAt)?.toMillis?.() || 0;
              const bT = (b.updatedAt || b.createdAt)?.toMillis?.() || 0;
              return bT - aT;
            });
            return sorted[0];
          });
          const percents = latest.map((m) => (typeof m?.percentage === 'number' ? m.percentage : 0)).filter((p) => typeof p === 'number');
          avg = percents.length > 0 ? Math.round(percents.reduce((sum, p) => sum + p, 0) / percents.length) : 0;
        }
        studentAverages.push({ studentId, name: meta.name, className: meta.className, averagePercent: avg });
      }

      const topStudents = studentAverages
        .slice()
        .sort((a, b) => b.averagePercent - a.averagePercent)
        .slice(0, 10)
        .map((s, idx) => ({ rank: idx + 1, ...s, grade: calculateGradeFromPercent(s.averagePercent) }));

      // Class-wise summary
      const classSummaries = classes.map((c) => {
        const count = studentsByClass.get(c.name) || 0;
        const att = attendanceByClass.get(c.name) || { total: 0, present: 0 };
        const attendanceRate = att.total > 0 ? Math.round((att.present / att.total) * 100) : 0;

        const classStudents = studentAverages.filter((s) => s.className === c.name);
        const avgMarks = classStudents.length > 0 ? Math.round(classStudents.reduce((sum, s) => sum + s.averagePercent, 0) / classStudents.length) : 0;

        return {
          classId: c.id,
          className: c.name,
          teacher: c.teacher,
          students: count,
          averageMarks: avgMarks,
          attendanceRate,
        };
      });

      const reportData = {
        term: params.term || '',
        reportType: params.reportType || 'School Report',
        isAnnual: isAnnual,
        summary: {
          totalStudents: activeStudents.length,
          totalClasses: classes.length,
          totalTeachers: teachersSnap.size,
        },
        classes: classSummaries,
        topStudents,
        generatedAt: new Date().toISOString(),
      };

      const title = `School - ${reportData.reportType}${reportData.term ? ` (${reportData.term})` : ''}`;

      const ref = await db.collection('reports').add({
        type: 'school',
        status: 'completed',
        title,
        createdBy: params.createdBy,
        createdByRole: params.createdByRole,
        term: params.term || '',
        data: reportData,
        createdAt: Timestamp.now(),
      });

      return {
        id: ref.id,
        type: 'school',
        status: 'completed',
        title,
        createdBy: params.createdBy,
        createdByRole: params.createdByRole,
        createdAt: reportData.generatedAt,
        term: params.term || '',
        data: reportData,
      };
    } catch (error: any) {
      logger.error('Generate school report error:', error);
      if (error instanceof ApiErrorResponse) throw error;
      throw new ApiErrorResponse('CREATE_FAILED', error.message || 'Failed to generate school report', 500);
    }
  }
}

export default new ReportsService();

