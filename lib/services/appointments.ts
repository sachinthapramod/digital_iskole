// ==========================================
// Appointments Service
// ==========================================

import { where, orderBy } from "firebase/firestore"
import { getDocuments, addDocument, updateDocument } from "../firebase/db-service"
import type { Appointment } from "../types"

const COLLECTION = "appointments"

// Get all appointments (admin)
export async function getAllAppointments(): Promise<Appointment[]> {
  return getDocuments<Appointment>(COLLECTION, [orderBy("date", "desc")])
}

// Get appointments by teacher
export async function getAppointmentsByTeacher(teacherId: string): Promise<Appointment[]> {
  return getDocuments<Appointment>(COLLECTION, [where("teacherId", "==", teacherId), orderBy("date", "desc")])
}

// Get appointments by parent
export async function getAppointmentsByParent(parentId: string): Promise<Appointment[]> {
  return getDocuments<Appointment>(COLLECTION, [where("parentId", "==", parentId), orderBy("date", "desc")])
}

// Create appointment request
export async function createAppointment(
  data: Omit<Appointment, "id" | "status" | "createdAt" | "updatedAt">,
): Promise<string> {
  return addDocument<Appointment>(COLLECTION, {
    ...data,
    status: "pending",
  } as Appointment)
}

// Update appointment status
export async function updateAppointmentStatus(
  id: string,
  status: Appointment["status"],
  rejectionReason?: string,
): Promise<void> {
  return updateDocument(COLLECTION, id, { status, rejectionReason })
}
