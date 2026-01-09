// ==========================================
// Notifications Hook (SWR)
// ==========================================

import useSWR from "swr"
import {
  getNotificationsByUser,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../services/notifications"
import type { Notification } from "../types"

export function useNotifications(userId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Notification[]>(userId ? `notifications-${userId}` : null, () =>
    userId ? getNotificationsByUser(userId) : [],
  )

  const { data: unreadCount, mutate: mutateCount } = useSWR<number>(
    userId ? `notifications-unread-${userId}` : null,
    () => (userId ? getUnreadCount(userId) : 0),
  )

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id)
    mutate()
    mutateCount()
  }

  const handleMarkAllAsRead = async () => {
    if (!userId) return
    await markAllAsRead(userId)
    mutate()
    mutateCount()
  }

  const handleDelete = async (id: string) => {
    await deleteNotification(id)
    mutate()
    mutateCount()
  }

  return {
    notifications: data || [],
    unreadCount: unreadCount || 0,
    isLoading,
    isError: error,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDelete,
    mutate,
  }
}
