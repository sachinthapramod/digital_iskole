import { Timestamp } from 'firebase-admin/firestore';

export interface Report {
  id: string;
  type: 'term_report' | 'progress_report' | 'attendance_report' | 'full_academic';
  name: string;
  studentId?: string;
  studentName?: string;
  classId?: string;
  className?: string;
  term?: string;
  academicYear: string;
  generatedBy: string;
  generatedByName: string;
  pdfUrl?: string;
  status: 'generating' | 'completed' | 'failed';
  createdAt: Timestamp;
}


