import { Timestamp } from 'firebase-admin/firestore';

export interface Exam {
  id: string;
  name: string;
  type: 'first_term' | 'second_term' | 'third_term' | 'monthly_test' | 'quiz' | 'assignment';
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  date: Timestamp;
  startTime: string;
  endTime: string;
  totalMarks: number;
  passingMarks: number;
  academicYear: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Mark {
  id: string;
  studentId: string;
  studentName: string;
  examId: string;
  examName: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  marks: number;
  totalMarks: number;
  grade: string;
  percentage: number;
  rank?: number;
  remarks?: string;
  examPaperUrl?: string;
  enteredBy: string;
  enteredByName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}


