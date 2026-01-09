// ==========================================
// Attendance Service
// ==========================================

import { where, orderBy } from "firebase/firestore"
import { getDocuments, addDocument, updateDocument } from "../firebase/db-service"
import type { Attendance } from "../types"

const COLLECTION = "attendance"

// Get attendance by class and date
export async function getAttendanceByClassAndDate(classId: string, date: Date): Promise<Attendance[]> {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  return getDocuments<Attendance>(COLLECTION, [
    where("classId", "==", classId),
    where("date", ">=", startOfDay),
    where("date", "<=", endOfDay),
  ])
}

// Get attendance by student
export async function getAttendanceByStudent(
  studentId: string,
  startDate?: Date,
  endDate?: Date,
): Promise<Attendance[]> {
  const constraints = [where("studentId", "==", studentId), orderBy("date", "desc")]

  if (startDate) {
    constraints.push(where("date", ">=", startDate))
  }
  if (endDate) {
    constraints.push(where("date", "<=", endDate))
  }

  return getDocuments<Attendance>(COLLECTION, constraints)
}

// Mark attendance
export async function markAttendance(data: Omit<Attendance, "id" | "markedAt">): Promise<string> {
  return addDocument<Attendance>(COLLECTION, {
    ...data,
    markedAt: new Date(),
  } as Attendance)
}

// Update attendance
export async function updateAttendance(id: string, status: Attendance["status"], notes?: string): Promise<void> {
  return updateDocument(COLLECTION, id, { status, notes })
}

// Get attendance statistics for a student
export async function getAttendanceStats(
  studentId: string,
  academicYearId: string,
): Promise<{ present: number; absent: number; late: number; total: number }> {
  const records = await getDocuments<Attendance>(COLLECTION, [where("studentId", "==", studentId)])

  return {
    present: records.filter((r) => r.status === "present").length,
    absent: records.filter((r) => r.status === "absent").length,
    late: records.filter((r) => r.status === "late").length,
    total: records.length,
  }
}
