import { Timestamp } from 'firebase-admin/firestore';

export interface Notice {
  id: string;
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'normal';
  targetAudience: ('all' | 'teachers' | 'parents' | 'students')[];
  targetClasses?: string[];
  authorId: string;
  authorName: string;
  authorRole: 'admin' | 'teacher';
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  publishedAt: Timestamp;
  expiresAt?: Timestamp;
  status: 'draft' | 'published' | 'archived';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}


