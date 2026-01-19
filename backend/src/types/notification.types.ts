import { Timestamp } from 'firebase-admin/firestore';

export interface Notification {
  id: string;
  userId: string;
  type: 'appointment' | 'notice' | 'marks' | 'attendance' | 'system' | 'exams';
  title: string;
  message: string;
  link?: string;
  data?: Record<string, any>;
  isRead: boolean;
  priority: 'high' | 'normal' | 'low';
  createdAt: Timestamp;
  readAt?: Timestamp;
}
