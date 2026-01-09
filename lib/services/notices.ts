// ==========================================
// Notices Service
// ==========================================

import { orderBy } from "firebase/firestore"
import { getDocuments, addDocument, updateDocument, deleteDocument } from "../firebase/db-service"
import type { Notice, UserRole } from "../types"

const COLLECTION = "notices"

// Get all notices
export async function getAllNotices(): Promise<Notice[]> {
  return getDocuments<Notice>(COLLECTION, [orderBy("publishedAt", "desc")])
}

// Get notices for user role
export async function getNoticesForRole(role: UserRole): Promise<Notice[]> {
  const allNotices = await getAllNotices()

  return allNotices.filter((notice) => {
    if (notice.targetAudience.includes("all")) return true
    if (role === "teacher" && notice.targetAudience.includes("teachers")) return true
    if (role === "parent" && notice.targetAudience.includes("parents")) return true
    return false
  })
}

// Create notice
export async function createNotice(
  data: Omit<Notice, "id" | "publishedAt" | "createdAt" | "updatedAt">,
): Promise<string> {
  return addDocument<Notice>(COLLECTION, {
    ...data,
    publishedAt: new Date(),
  } as Notice)
}

// Update notice
export async function updateNotice(id: string, data: Partial<Notice>): Promise<void> {
  return updateDocument(COLLECTION, id, data)
}

// Delete notice
export async function deleteNotice(id: string): Promise<void> {
  return deleteDocument(COLLECTION, id)
}
