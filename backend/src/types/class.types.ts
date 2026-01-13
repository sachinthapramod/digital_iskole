import { Timestamp } from 'firebase-admin/firestore';

export interface Class {
  id: string;
  name: string; // e.g., "Grade 10-A"
  grade: string; // e.g., "10"
  section: string; // e.g., "A"
  classTeacherId?: string; // Reference to teachers collection
  classTeacherName?: string; // Denormalized for quick access
  room?: string;
  studentCount: number; // Denormalized count
  status: 'active' | 'inactive';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
