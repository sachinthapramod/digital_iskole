import { Timestamp } from 'firebase-admin/firestore';

export interface Subject {
  id: string;
  name: string;
  code: string; // Subject code (e.g., "MATH", "SCI")
  description?: string;
  status: 'active' | 'inactive';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
