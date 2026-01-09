// ==========================================
// Students Hook (SWR)
// ==========================================

import useSWR from "swr"
import { getAllStudents, getStudentById, getStudentsByClass, getStudentsByParent } from "../services/students"
import type { Student } from "../types"

// Fetch all students
export function useStudents() {
  const { data, error, isLoading, mutate } = useSWR<Student[]>("students", getAllStudents)

  return {
    students: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

// Fetch student by ID
export function useStudent(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Student | null>(id ? `student-${id}` : null, () =>
    id ? getStudentById(id) : null,
  )

  return {
    student: data,
    isLoading,
    isError: error,
    mutate,
  }
}

// Fetch students by class
export function useStudentsByClass(classId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Student[]>(classId ? `students-class-${classId}` : null, () =>
    classId ? getStudentsByClass(classId) : [],
  )

  return {
    students: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

// Fetch students by parent (for parent dashboard)
export function useStudentsByParent(parentId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Student[]>(parentId ? `students-parent-${parentId}` : null, () =>
    parentId ? getStudentsByParent(parentId) : [],
  )

  return {
    children: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}
