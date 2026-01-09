// ==========================================
// Notifications Service
// ==========================================

import { where, orderBy } from "firebase/firestore"
import { getDocuments, addDocument, updateDocument, deleteDocument } from "../firebase/db-service"
import type { Notification } from "../types"

const COLLECTION = "notifications"

// Get notifications for user
export async function getNotificationsByUser(userId: string): Promise<Notification[]> {
  return getDocuments<Notification>(COLLECTION, [where("userId", "==", userId), orderBy("createdAt", "desc")])
}

// Get unread count
export async function getUnreadCount(userId: string): Promise<number> {
  const notifications = await getDocuments<Notification>(COLLECTION, [
    where("userId", "==", userId),
    where("isRead", "==", false),
  ])
  return notifications.length
}

// Create notification
export async function createNotification(data: Omit<Notification, "id" | "isRead" | "createdAt">): Promise<string> {
  return addDocument<Notification>(COLLECTION, {
    ...data,
    isRead: false,
  } as Notification)
}

// Mark notification as read
export async function markAsRead(id: string): Promise<void> {
  return updateDocument(COLLECTION, id, { isRead: true })
}

// Mark all as read
export async function markAllAsRead(userId: string): Promise<void> {
  const notifications = await getDocuments<Notification>(COLLECTION, [
    where("userId", "==", userId),
    where("isRead", "==", false),
  ])

  await Promise.all(notifications.map((n) => updateDocument(COLLECTION, n.id, { isRead: true })))
}

// Delete notification
export async function deleteNotification(id: string): Promise<void> {
  return deleteDocument(COLLECTION, id)
}
