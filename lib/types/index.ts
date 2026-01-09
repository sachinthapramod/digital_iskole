// ==========================================
// Digital Iskole - Type Definitions
// ==========================================

// User Roles
export type UserRole = "admin" | "teacher" | "parent"

// Base User Interface
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  phone?: string
  address?: string
  createdAt: Date
  updatedAt: Date
}

// Admin User
export interface AdminUser extends User {
  role: "admin"
}

// Teacher User
export interface TeacherUser extends User {
  role: "teacher"
  employeeId: string
  assignedClass?: string
  assignedClassId?: string
  subjects: string[]
  qualification?: string
  joinDate: Date
}

// Parent User
export interface ParentUser extends User {
  role: "parent"
  children: string[] // Array of student IDs
  occupation?: string
}

// Student
export interface Student {
  id: string
  admissionNumber: string
  name: string
  dateOfBirth: Date
  gender: "male" | "female"
  classId: string
  className: string
  parentId: string
  parentName: string
  address?: string
  enrollmentDate: Date
  status: "active" | "inactive" | "transferred"
  createdAt: Date
  updatedAt: Date
}

// Class
export interface Class {
  id: string
  name: string // e.g., "Grade 10-A"
  grade: number // 1-13
  section: string // A, B, C
  classTeacherId?: string
  classTeacherName?: string
  academicYearId: string
  studentCount: number
  capacity: number
  createdAt: Date
  updatedAt: Date
}

// Subject
export interface Subject {
  id: string
  name: string
  code: string
  description?: string
  grades: number[] // Which grades this subject applies to
  isCore: boolean
  createdAt: Date
  updatedAt: Date
}

// Academic Year
export interface AcademicYear {
  id: string
  name: string // e.g., "2024/2025"
  startDate: Date
  endDate: Date
  isCurrent: boolean
  status: "active" | "upcoming" | "completed"
  createdAt: Date
  updatedAt: Date
}

// Attendance
export interface Attendance {
  id: string
  studentId: string
  studentName: string
  classId: string
  date: Date
  status: "present" | "absent" | "late"
  markedBy: string // Teacher ID
  markedAt: Date
  notes?: string
}

// Exam
export interface Exam {
  id: string
  name: string
  type: "first-term" | "second-term" | "third-term" | "monthly-test" | "quiz" | "assignment"
  subjectId: string
  subjectName: string
  classId: string
  className: string
  date: Date
  maxMarks: number
  academicYearId: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

// Mark
export interface Mark {
  id: string
  studentId: string
  studentName: string
  examId: string
  examName: string
  subjectId: string
  subjectName: string
  classId: string
  marks: number
  maxMarks: number
  grade: string
  percentage: number
  examPaperUrl?: string // URL to uploaded exam paper
  enteredBy: string // Teacher ID
  enteredAt: Date
  updatedAt: Date
}

// Appointment
export interface Appointment {
  id: string
  parentId: string
  parentName: string
  teacherId: string
  teacherName: string
  studentId: string
  studentName: string
  classId: string
  className: string
  date: Date
  time: string
  reason: string
  status: "pending" | "approved" | "rejected" | "completed"
  rejectionReason?: string
  createdAt: Date
  updatedAt: Date
}

// Notice
export interface Notice {
  id: string
  title: string
  content: string
  priority: "high" | "medium" | "normal"
  targetAudience: ("all" | "teachers" | "parents" | "students")[]
  targetClassId?: string // For class-specific notices
  authorId: string
  authorName: string
  authorRole: UserRole
  publishedAt: Date
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

// Notification
export interface Notification {
  id: string
  userId: string
  type: "notice" | "appointment" | "marks" | "attendance" | "exam" | "system"
  title: string
  message: string
  isRead: boolean
  link?: string
  createdAt: Date
}

// Report
export interface Report {
  id: string
  userId: string // Who generated the report
  studentId?: string // For student reports
  classId?: string // For class reports
  type: "term" | "progress" | "attendance" | "academic"
  term?: string
  pdfUrl: string
  generatedAt: Date
  academicYearId: string
}

// Grading Scale
export interface GradingScale {
  id: string
  grade: string
  minMarks: number
  maxMarks: number
  description?: string
}

// Settings
export interface Settings {
  gradingScales: GradingScale[]
  currentAcademicYearId: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
