import { Timestamp } from 'firebase-admin/firestore';
import { UserRole } from '../config/constants';

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  profileId: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  dateOfBirth?: Timestamp;
  language: 'en' | 'si' | 'ta';
  theme: 'light' | 'dark';
  fcmTokens: string[];
  isActive: boolean;
  lastLogin?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Teacher {
  id: string;
  userId: string;
  employeeId: string;
  fullName: string;
  nameWithInitials: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: Timestamp;
  gender: 'male' | 'female';
  nic?: string;
  qualifications: string[];
  subjects: string[];
  assignedClass?: string;
  isClassTeacher: boolean;
  status: 'active' | 'inactive' | 'on_leave';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Student {
  id: string;
  admissionNumber: string;
  fullName: string;
  nameWithInitials: string;
  dateOfBirth: Timestamp;
  gender: 'male' | 'female';
  classId: string;
  className: string;
  parentId: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  address?: string;
  enrollmentDate: Timestamp;
  status: 'active' | 'inactive' | 'transferred';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Parent {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  children: string[]; // Student IDs
  occupation?: string;
  status: 'active' | 'inactive';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}


