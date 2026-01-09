import { Timestamp } from 'firebase-admin/firestore';

export interface Appointment {
  id: string;
  parentId: string;
  parentName: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  date: Timestamp;
  time: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  rejectionReason?: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}


