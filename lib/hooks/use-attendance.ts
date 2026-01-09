// ==========================================
// Attendance Hook (SWR)
// ==========================================

import useSWR from "swr"
import { getAttendanceByClassAndDate, getAttendanceByStudent, getAttendanceStats } from "../services/attendance"
import type { Attendance } from "../types"

// Fetch attendance by class and date
export function useClassAttendance(classId: string | null, date: Date | null) {
  const dateKey = date?.toISOString().split("T")[0]

  const { data, error, isLoading, mutate } = useSWR<Attendance[]>(
    classId && date ? `attendance-${classId}-${dateKey}` : null,
    () => (classId && date ? getAttendanceByClassAndDate(classId, date) : []),
  )

  return {
    attendance: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

// Fetch attendance by student
export function useStudentAttendance(studentId: string | null, startDate?: Date, endDate?: Date) {
  const { data, error, isLoading, mutate } = useSWR<Attendance[]>(
    studentId ? `attendance-student-${studentId}` : null,
    () => (studentId ? getAttendanceByStudent(studentId, startDate, endDate) : []),
  )

  return {
    attendance: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

// Fetch attendance statistics
export function useAttendanceStats(studentId: string | null, academicYearId: string) {
  const { data, error, isLoading } = useSWR(studentId ? `attendance-stats-${studentId}` : null, () =>
    studentId ? getAttendanceStats(studentId, academicYearId) : null,
  )

  return {
    stats: data || { present: 0, absent: 0, late: 0, total: 0 },
    isLoading,
    isError: error,
  }
}
