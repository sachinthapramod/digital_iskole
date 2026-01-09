"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLanguage } from "@/lib/i18n/context"
import { useAuth } from "@/lib/auth/context"
import { useRouter } from "next/navigation"
import { Bell, Check, Calendar, FileText, ClipboardCheck, MessageSquare } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Notification {
  id: string
  type: "appointment" | "notice" | "marks" | "attendance" | "system"
  title: string
  message: string
  timestamp: Date
  read: boolean
}

// Mock notifications based on user role
const getNotificationsForRole = (role: string): Notification[] => {
  const baseNotifications: Notification[] = [
    {
      id: "1",
      type: "notice",
      title: "School Sports Day 2024",
      message: "Annual Sports Day will be held on December 20th",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
    },
  ]

  if (role === "admin") {
    return [
      ...baseNotifications,
      {
        id: "2",
        type: "appointment",
        title: "New Appointment Request",
        message: "Mrs. Silva requested a meeting with Mr. Fernando",
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        read: false,
      },
      {
        id: "3",
        type: "attendance",
        title: "Low Attendance Alert",
        message: "Grade 9-B has 15% absent students today",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        read: true,
      },
    ]
  }

  if (role === "teacher") {
    return [
      ...baseNotifications,
      {
        id: "2",
        type: "appointment",
        title: "Appointment Reminder",
        message: "Meeting with Mrs. Silva tomorrow at 2:00 PM",
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        read: false,
      },
      {
        id: "3",
        type: "marks",
        title: "Marks Entry Pending",
        message: "Mid-term marks for Grade 10-A need to be submitted",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
        read: false,
      },
    ]
  }

  return [
    ...baseNotifications,
    {
      id: "2",
      type: "marks",
      title: "New Marks Available",
      message: "Mid-term examination results have been published",
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      read: false,
    },
    {
      id: "3",
      type: "appointment",
      title: "Appointment Confirmed",
      message: "Your meeting with Mrs. Fernando is confirmed for Dec 15",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      read: true,
    },
  ]
}

export function NotificationsPopover() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>(getNotificationsForRole(user?.role || "parent"))
  const [open, setOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
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
          {notifications.length === 0 ? (
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
                  onClick={() => markAsRead(notification.id)}
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
