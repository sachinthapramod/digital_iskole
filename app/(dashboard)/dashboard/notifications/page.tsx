"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useLanguage } from "@/lib/i18n/context"
import { useAuth } from "@/lib/auth/context"
import { apiRequest } from "@/lib/api/client"
import {
  Bell,
  Calendar,
  FileText,
  ClipboardCheck,
  MessageSquare,
  Check,
  CheckCheck,
  Trash2,
  Search,
  Filter,
  GraduationCap,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

interface Notification {
  id: string
  type: "appointment" | "notice" | "marks" | "attendance" | "system" | "exams"
  title: string
  message: string
  timestamp: Date
  read: boolean
  link?: string
}

// Extended mock notifications based on user role
const getNotificationsForRole = (role: string): Notification[] => {
  const baseNotifications: Notification[] = [
    {
      id: "1",
      type: "notice",
      title: "School Sports Day 2024",
      message:
        "Annual Sports Day will be held on December 20th. All students are expected to participate in at least one event. Registration forms are available at the office.",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
      link: "/dashboard/notices",
    },
    {
      id: "10",
      type: "system",
      title: "System Maintenance Notice",
      message:
        "The portal will undergo scheduled maintenance on December 15th from 2:00 AM to 4:00 AM. Please save your work before this time.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      read: true,
    },
  ]

  if (role === "admin") {
    return [
      ...baseNotifications,
      {
        id: "2",
        type: "appointment",
        title: "New Appointment Request",
        message:
          "Mrs. Silva has requested a meeting with Mr. Fernando regarding her son's academic performance. Please review and approve.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        read: false,
        link: "/dashboard/appointments",
      },
      {
        id: "3",
        type: "attendance",
        title: "Low Attendance Alert",
        message: "Grade 9-B has 15% absent students today. This is above the normal threshold. Please investigate.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        read: true,
        link: "/dashboard/attendance",
      },
      {
        id: "11",
        type: "exams",
        title: "First Term Exam Schedule Published",
        message:
          "The First Term examination schedule has been published. All teachers should prepare their question papers by December 10th.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
        read: false,
        link: "/dashboard/marks",
      },
      {
        id: "4",
        type: "system",
        title: "New Teacher Registration",
        message: "A new teacher account has been created for Mrs. Perera (Mathematics). Please verify credentials.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
        read: false,
        link: "/dashboard/users/teachers",
      },
      {
        id: "5",
        type: "marks",
        title: "Marks Entry Deadline",
        message: "Reminder: All mid-term marks must be entered by December 18th. 3 classes still pending.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
        read: true,
        link: "/dashboard/marks",
      },
      {
        id: "6",
        type: "notice",
        title: "Parent Meeting Scheduled",
        message: "Annual parent-teacher meeting scheduled for December 22nd. Please prepare progress reports.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        read: true,
        link: "/dashboard/notices",
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
        message:
          "You have a scheduled meeting with Mrs. Silva tomorrow at 2:00 PM regarding Kasun's academic progress.",
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        read: false,
        link: "/dashboard/appointments",
      },
      {
        id: "11",
        type: "exams",
        title: "Submit Question Papers",
        message:
          "Please submit your question papers for the First Term examination by December 10th. Use the standard format.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        read: false,
        link: "/dashboard/marks",
      },
      {
        id: "3",
        type: "marks",
        title: "Marks Entry Pending",
        message: "Mid-term marks for Grade 10-A Mathematics need to be submitted before December 18th deadline.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
        read: false,
        link: "/dashboard/marks",
      },
      {
        id: "4",
        type: "attendance",
        title: "Attendance Submitted",
        message: "Today's attendance for Grade 10-A has been successfully recorded. 2 students marked absent.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
        read: true,
        link: "/dashboard/attendance",
      },
      {
        id: "5",
        type: "notice",
        title: "Staff Meeting Tomorrow",
        message: "Reminder: Monthly staff meeting scheduled for tomorrow at 3:30 PM in the conference room.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
        read: true,
        link: "/dashboard/notices",
      },
      {
        id: "6",
        type: "system",
        title: "Timetable Updated",
        message: "Your class timetable has been updated for next week. Please review the changes.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        read: true,
      },
    ]
  }

  // Parent notifications
  return [
    ...baseNotifications,
    {
      id: "2",
      type: "marks",
      title: "New Marks Available",
      message: "Mid-term examination results for Mathematics have been published. Kasun scored 85/100 (Grade A).",
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      read: false,
      link: "/dashboard/marks",
    },
    {
      id: "11",
      type: "exams",
      title: "Upcoming Examination",
      message:
        "First Term examination will begin on December 15th. Please ensure your child is prepared. View the full schedule in the portal.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false,
      link: "/dashboard/marks",
    },
    {
      id: "3",
      type: "appointment",
      title: "Appointment Confirmed",
      message: "Your meeting request with Mrs. Fernando has been approved. Scheduled for December 15th at 2:00 PM.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      read: true,
      link: "/dashboard/appointments",
    },
    {
      id: "4",
      type: "attendance",
      title: "Attendance Update",
      message: "Kasun was marked present for all classes today. Current month attendance: 95%",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      read: true,
      link: "/dashboard/attendance",
    },
    {
      id: "5",
      type: "marks",
      title: "Science Project Due",
      message: "Reminder: Kasun's science project is due on December 20th. Please ensure timely submission.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      read: false,
      link: "/dashboard/marks",
    },
    {
      id: "6",
      type: "notice",
      title: "Fee Payment Reminder",
      message: "Term 3 fee payment is due by December 25th. Please make the payment to avoid late fees.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
      read: true,
      link: "/dashboard/notices",
    },
  ]
}

export default function NotificationsPage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNotifications()
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await apiRequest('/notifications')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to fetch notifications')
      }

      const notificationsList = (data.data?.notifications || []).map((notif: any) => ({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        timestamp: new Date(notif.timestamp || notif.createdAt),
        read: notif.read || notif.isRead || false,
        link: notif.link,
      }))

      setNotifications(notificationsList)
    } catch (err: any) {
      console.error('Fetch notifications error:', err)
      if (err.message.includes('Token refresh failed') || err.message.includes('login')) {
        setError("Session expired. Please login again.")
      } else {
        setError(err.message || 'Failed to load notifications')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = async (id: string) => {
    try {
      const response = await apiRequest(`/notifications/${id}/read`, {
        method: 'PATCH',
      })

      const data = await response.json()

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
      }
    } catch (err: any) {
      console.error('Mark as read error:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await apiRequest('/notifications/read-all', {
        method: 'PATCH',
      })

      const data = await response.json()

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      }
    } catch (err: any) {
      console.error('Mark all as read error:', err)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const response = await apiRequest(`/notifications/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
      }
    } catch (err: any) {
      console.error('Delete notification error:', err)
    }
  }

  const clearAllRead = async () => {
    try {
      const response = await apiRequest('/notifications/read/all', {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => !n.read))
      }
    } catch (err: any) {
      console.error('Clear all read error:', err)
    }
  }

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "appointment":
        return <Calendar className="h-5 w-5" />
      case "notice":
        return <Bell className="h-5 w-5" />
      case "marks":
        return <FileText className="h-5 w-5" />
      case "attendance":
        return <ClipboardCheck className="h-5 w-5" />
      case "system":
        return <MessageSquare className="h-5 w-5" />
      case "exams":
        return <GraduationCap className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "appointment":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
      case "notice":
        return "bg-primary/10 text-primary border-primary/20"
      case "marks":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
      case "attendance":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
      case "system":
        return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
      case "exams":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const getTypeBadgeVariant = (type: Notification["type"]) => {
    switch (type) {
      case "appointment":
        return "secondary"
      case "notice":
        return "default"
      case "marks":
        return "secondary"
      case "attendance":
        return "secondary"
      case "system":
        return "outline"
      case "exams":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const filteredNotifications = notifications.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "all" || n.type === filterType
    const matchesTab = activeTab === "all" || (activeTab === "unread" && !n.read) || (activeTab === "read" && n.read)
    return matchesSearch && matchesType && matchesTab
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("notifications")}</h1>
          <p className="text-muted-foreground">
            {t("allNotifications")} ({unreadCount} {t("unread")})
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                {t("markAllRead")}
              </Button>
            )}
            {notifications.some((n) => n.read) && (
              <Button variant="outline" size="sm" onClick={clearAllRead}>
                <Trash2 className="h-4 w-4 mr-2" />
                {t("clearRead")}
              </Button>
            )}
          </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("searchNotifications")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={t("filterByType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allTypes")}</SelectItem>
                <SelectItem value="notice">{t("notices")}</SelectItem>
                <SelectItem value="appointment">{t("appointments")}</SelectItem>
                <SelectItem value="marks">{t("marks")}</SelectItem>
                <SelectItem value="attendance">{t("attendance")}</SelectItem>
                <SelectItem value="exams">{t("exams")}</SelectItem>
                <SelectItem value="system">{t("system")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            {t("all")} ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            {t("unread")} ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="read">
            {t("read")} ({notifications.length - unreadCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-1">{t("noNotifications")}</h3>
                <p className="text-sm text-muted-foreground">{t("noNotificationsDesc")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`transition-all hover:shadow-md ${
                    !notification.read ? "border-l-4 border-l-primary bg-primary/5" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 border ${getNotificationColor(
                          notification.type,
                        )}`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3
                              className={`font-semibold ${
                                !notification.read ? "text-foreground" : "text-muted-foreground"
                              }`}
                            >
                              {notification.title}
                            </h3>
                            <Badge variant={getTypeBadgeVariant(notification.type)} className="text-xs">
                              {notification.type}
                            </Badge>
                            {!notification.read && <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />}
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </span>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">{notification.message}</p>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground/70">
                            {format(notification.timestamp, "PPP 'at' p")}
                          </span>

                          <div className="flex items-center gap-2">
                            {notification.link && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs"
                                onClick={() => {
                                  markAsRead(notification.id)
                                  window.location.href = notification.link!
                                }}
                              >
                                {t("viewDetails")}
                              </Button>
                            )}
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                {t("markRead")}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-destructive hover:text-destructive"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
        </>
      )}
    </div>
  )
}
