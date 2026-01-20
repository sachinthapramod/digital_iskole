import { Timestamp } from 'firebase-admin/firestore';

export interface GradeScale {
  id: string;
  grade: string;
  minMarks: number;
  maxMarks: number;
  description: string;
  order: number; // For sorting
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AcademicYear {
  id: string;
  year: string;
  startDate: Timestamp;
  endDate: Timestamp;
  isCurrent: boolean;
  status: 'active' | 'completed' | 'upcoming';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserPreferences {
  userId: string;
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  noticeNotifications: boolean;
  appointmentNotifications: boolean;
  marksNotifications: boolean;
  attendanceNotifications: boolean;
  examNotifications: boolean;
  updatedAt: Timestamp;
}
