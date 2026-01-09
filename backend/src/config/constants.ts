export const COLLECTIONS = {
  USERS: 'users',
  TEACHERS: 'teachers',
  STUDENTS: 'students',
  PARENTS: 'parents',
  CLASSES: 'classes',
  SUBJECTS: 'subjects',
  ATTENDANCE: 'attendance',
  EXAMS: 'exams',
  MARKS: 'marks',
  APPOINTMENTS: 'appointments',
  NOTICES: 'notices',
  NOTIFICATIONS: 'notifications',
  REPORTS: 'reports',
  ACADEMIC_YEARS: 'academicYears',
  GRADING_SYSTEM: 'gradingSystem',
  SETTINGS: 'settings',
  FILES: 'files',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  PARENT: 'parent',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
} as const;

export const EXAM_TYPES = {
  FIRST_TERM: 'first_term',
  SECOND_TERM: 'second_term',
  THIRD_TERM: 'third_term',
  MONTHLY_TEST: 'monthly_test',
  QUIZ: 'quiz',
  ASSIGNMENT: 'assignment',
} as const;

export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const NOTICE_PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  NORMAL: 'normal',
} as const;

export const NOTIFICATION_TYPES = {
  NOTICE: 'notice',
  APPOINTMENT: 'appointment',
  MARKS: 'marks',
  ATTENDANCE: 'attendance',
  EXAM: 'exam',
  SYSTEM: 'system',
} as const;

export const REPORT_TYPES = {
  TERM_REPORT: 'term_report',
  PROGRESS_REPORT: 'progress_report',
  ATTENDANCE_REPORT: 'attendance_report',
  FULL_ACADEMIC: 'full_academic',
} as const;

export const FILE_TYPES = {
  PROFILE_PICTURE: 'profile_picture',
  EXAM_PAPER: 'exam_paper',
  NOTICE_ATTACHMENT: 'notice_attachment',
  REPORT: 'report',
} as const;

export const STORAGE_PATHS = {
  PROFILES: 'profiles',
  EXAM_PAPERS: 'exam_papers',
  NOTICES: 'notices',
  REPORTS: 'reports',
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const DEFAULT_GRADING_SCALE = [
  { grade: 'A', minMarks: 75, maxMarks: 100, description: 'Excellent' },
  { grade: 'B', minMarks: 65, maxMarks: 74, description: 'Very Good' },
  { grade: 'C', minMarks: 55, maxMarks: 64, description: 'Good' },
  { grade: 'D', minMarks: 40, maxMarks: 54, description: 'Satisfactory' },
  { grade: 'F', minMarks: 0, maxMarks: 39, description: 'Fail' },
] as const;


