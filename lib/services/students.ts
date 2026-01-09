// ==========================================
// Student Service
// ==========================================

import { where, orderBy } from "firebase/firestore"
import { getDocument, getDocuments, addDocument, updateDocument, deleteDocument } from "../firebase/db-service"
import type { Student } from "../types"

const COLLECTION = "students"

// Get all students
export async function getAllStudents(): Promise<Student[]> {
  return getDocuments<Student>(COLLECTION, [orderBy("name")])
}

// Get student by ID
export async function getStudentById(id: string): Promise<Student | null> {
  return getDocument<Student>(COLLECTION, id)
}

// Get students by class
export async function getStudentsByClass(classId: string): Promise<Student[]> {
  return getDocuments<Student>(COLLECTION, [where("classId", "==", classId), orderBy("name")])
}

// Get students by parent
export async function getStudentsByParent(parentId: string): Promise<Student[]> {
  return getDocuments<Student>(COLLECTION, [where("parentId", "==", parentId), orderBy("name")])
}

// Create student
export async function createStudent(data: Omit<Student, "id" | "createdAt" | "updatedAt">): Promise<string> {
  return addDocument<Student>(COLLECTION, data as Student)
}

// Update student
export async function updateStudent(id: string, data: Partial<Student>): Promise<void> {
  return updateDocument(COLLECTION, id, data)
}

// Delete student
export async function deleteStudent(id: string): Promise<void> {
  return deleteDocument(COLLECTION, id)
}
