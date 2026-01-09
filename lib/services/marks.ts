// ==========================================
// Marks Service
// ==========================================

import { where, orderBy } from "firebase/firestore"
import { getDocuments, addDocument, updateDocument } from "../firebase/db-service"
import { uploadExamPaper } from "../firebase/storage-service"
import type { Mark, Exam } from "../types"

const MARKS_COLLECTION = "marks"
const EXAMS_COLLECTION = "exams"

// Get marks by student
export async function getMarksByStudent(studentId: string): Promise<Mark[]> {
  return getDocuments<Mark>(MARKS_COLLECTION, [where("studentId", "==", studentId), orderBy("enteredAt", "desc")])
}

// Get marks by exam
export async function getMarksByExam(examId: string): Promise<Mark[]> {
  return getDocuments<Mark>(MARKS_COLLECTION, [where("examId", "==", examId), orderBy("studentName")])
}

// Enter marks
export async function enterMarks(data: Omit<Mark, "id" | "enteredAt" | "updatedAt">): Promise<string> {
  return addDocument<Mark>(MARKS_COLLECTION, {
    ...data,
    enteredAt: new Date(),
  } as Mark)
}

// Update marks
export async function updateMarks(id: string, marks: number, grade: string, percentage: number): Promise<void> {
  return updateDocument(MARKS_COLLECTION, id, { marks, grade, percentage })
}

// Upload exam paper for a mark entry
export async function uploadExamPaperForMark(
  markId: string,
  studentId: string,
  examId: string,
  file: File,
): Promise<string> {
  const url = await uploadExamPaper(studentId, examId, file)
  await updateDocument(MARKS_COLLECTION, markId, { examPaperUrl: url })
  return url
}

// Get all exams
export async function getAllExams(): Promise<Exam[]> {
  return getDocuments<Exam>(EXAMS_COLLECTION, [orderBy("date", "desc")])
}

// Get exams by class
export async function getExamsByClass(classId: string): Promise<Exam[]> {
  return getDocuments<Exam>(EXAMS_COLLECTION, [where("classId", "==", classId), orderBy("date", "desc")])
}

// Create exam
export async function createExam(data: Omit<Exam, "id" | "createdAt" | "updatedAt">): Promise<string> {
  return addDocument<Exam>(EXAMS_COLLECTION, data as Exam)
}
