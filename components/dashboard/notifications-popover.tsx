"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLanguage } from "@/lib/i18n/context"
import { useAuth } from "@/lib/auth/context"
import { useRouter } from "next/navigation"
import { apiRequest } from "@/lib/api/client"
import { Bell, Check, Calendar, FileText, ClipboardCheck, MessageSquare, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Notification {
  id: string
  type: "appointment" | "notice" | "marks" | "attendance" | "system" | "exams"
  title: string
  message: string
  timestamp: Date
  read: boolean
  link?: string
}

export function NotificationsPopover() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const fetchNotifications = async () => {
    if (!user) return
    try {
      setIsLoading(true)
      const response = await apiRequest('/notifications')
      const data = await response.json()

      if (response.ok && data.data?.notifications) {
        const notificationsList = (data.data.notifications || []).map((notif: any) => ({
          id: notif.id,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          timestamp: new Date(notif.timestamp || notif.createdAt),
          read: notif.read || notif.isRead || false,
          link: notif.link,
        }))
        setNotifications(notificationsList)
      }
    } catch (err: any) {
      console.error('Fetch notifications error:', err)
      // Don't show error in popover, just log it
    } finally {
      setIsLoading(false)
    }
  }

  const [lastFetchTime, setLastFetchTime] = useState(0)

  useEffect(() => {
    if (user) {
      fetchNotifications()
      setLastFetchTime(Date.now())
      // Refresh notifications every 30 seconds
      const interval = setInterval(() => {
        fetchNotifications()
        setLastFetchTime(Date.now())
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  // OPTIMIZED: Only fetch when popover opens if data is stale (> 5 seconds old)
  useEffect(() => {
    if (open && user) {
      const timeSinceLastFetch = Date.now() - lastFetchTime
      if (timeSinceLastFetch > 5000) {
        fetchNotifications()
        setLastFetchTime(Date.now())
      }
    }
  }, [open, user, lastFetchTime])

  const markAsRead = async (id: string) => {
    try {
      const response = await apiRequest(`/notifications/${id}/read`, {
        method: 'PATCH',
      })
      if (response.ok) {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
      }
    } catch (err: any) {
      console.error('Mark as read error:', err)
      // Still update UI optimistically
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await apiRequest('/notifications/read-all', {
        method: 'PATCH',
      })
      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      }
    } catch (err: any) {
      console.error('Mark all as read error:', err)
      // Still update UI optimistically
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    }
  }

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "appointment":
        return <Calendar className="h-4 w-4" />
      case "notice":
        return <Bell className="h-4 w-4" />
      case "marks":
        return <FileText className="h-4 w-4" />
      case "attendance":
        return <ClipboardCheck className="h-4 w-4" />
      case "exams":
        return <FileText className="h-4 w-4" />
      case "system":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "appointment":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400"
      case "notice":
        return "bg-primary/10 text-primary"
      case "marks":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400"
      case "attendance":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      case "exams":
        return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
      case "system":
        return "bg-orange-500/10 text-orange-600 dark:text-orange-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const handleViewAll = () => {
    setOpen(false)
    router.push("/dashboard/notifications")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">{t("notifications")}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h4 className="font-semibold text-foreground">{t("notifications")}</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={markAllAsRead}
            >
              <Check className="h-3 w-3 mr-1" />
              {t("markAllRead")}
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="py-8 text-center">
              <Loader2 className="h-6 w-6 text-muted-foreground/50 mx-auto mb-2 animate-spin" />
              <p className="text-sm text-muted-foreground">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{t("noNotifications")}</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.slice(0, 5).map((notification) => (
                <button
                  key={notification.id}
                  className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors ${
                    !notification.read ? "bg-primary/5" : ""
                  }`}
                  onClick={() => {
                    markAsRead(notification.id)
                    if (notification.link) {
                      setOpen(false)
                      router.push(notification.link)
                    }
                  }}
                >
                  <div className="flex gap-3">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(
                        notification.type,
                      )}`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm font-medium truncate ${
                            !notification.read ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="px-4 py-3 border-t border-border">
          <Button variant="ghost" className="w-full text-sm" size="sm" onClick={handleViewAll}>
            {t("viewAllNotifications")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
