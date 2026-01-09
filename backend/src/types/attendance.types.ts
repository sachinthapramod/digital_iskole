import { Timestamp } from 'firebase-admin/firestore';

export interface Attendance {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  date: Timestamp;
  status: 'present' | 'absent' | 'late';
  markedBy: string; // User ID
  markedByName: string;
  remarks?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendanceRate: number;
}


