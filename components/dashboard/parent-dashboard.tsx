"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useLanguage } from "@/lib/i18n/context"
import { FileText, Calendar, Bell, ArrowRight, TrendingUp, User, Clock } from "lucide-react"
import Link from "next/link"

// Mock data for parent's children
const children = [
  {
    id: "student-1",
    name: "Kasun Silva",
    grade: "Grade 10-A",
    attendanceRate: 94,
    averageMarks: 78,
    recentGrade: "A",
  },
  {
    id: "student-2",
    name: "Nimali Silva",
    grade: "Grade 8-B",
    attendanceRate: 98,
    averageMarks: 85,
    recentGrade: "A+",
  },
]

const recentMarks = [
  { subject: "Mathematics", marks: 82, total: 100, grade: "A", child: "Kasun Silva" },
  { subject: "Science", marks: 78, total: 100, grade: "B+", child: "Kasun Silva" },
  { subject: "English", marks: 88, total: 100, grade: "A", child: "Nimali Silva" },
  { subject: "Sinhala", marks: 92, total: 100, grade: "A+", child: "Nimali Silva" },
]

const notices = [
  { id: 1, title: "School Sports Day", date: "2024-12-15", type: "Event" },
  { id: 2, title: "Parent-Teacher Meeting", date: "2024-12-20", type: "Meeting" },
  { id: 3, title: "Holiday Announcement", date: "2024-12-25", type: "Notice" },
]

const appointments = [
  {
    id: 1,
    child: "Kasun Silva",
    childClass: "Grade 10-A",
    teacher: "Mrs. Perera",
    date: "2024-12-14",
    time: "10:00 AM",
    status: "approved",
    reason: "Discuss academic progress",
  },
  {
    id: 2,
    child: "Nimali Silva",
    childClass: "Grade 8-B",
    teacher: "Mr. Kumar",
    date: "2024-12-16",
    time: "2:00 PM",
    status: "pending",
    reason: "Review exam results",
  },
]

export function ParentDashboard() {
  const { t } = useLanguage()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-success text-success-foreground text-xs">{t("approved")}</Badge>
      case "pending":
        return (
          <Badge variant="secondary" className="text-xs">
            {t("pending")}
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive" className="text-xs">
            {t("rejected")}
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t("dashboard")}</h1>
          <p className="text-sm text-muted-foreground">Monitor your children&apos;s progress</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/dashboard/appointments">
            <Calendar className="h-4 w-4 mr-2" />
            {t("requestAppointment")}
          </Link>
        </Button>
      </div>

      {/* Children Overview */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
        {children.map((child) => (
          <Card key={child.id} className="overflow-hidden">
            <CardHeader className="bg-primary/5 pb-3 sm:pb-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-lg sm:text-xl font-bold flex-shrink-0">
                  {child.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base sm:text-lg truncate">{child.name}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{child.grade}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-3 sm:pt-4">
              <div className="grid gap-3 sm:gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <span className="text-xs sm:text-sm text-muted-foreground">{t("attendance")}</span>
                    <span className="text-xs sm:text-sm font-medium">{child.attendanceRate}%</span>
                  </div>
                  <Progress value={child.attendanceRate} className="h-1.5 sm:h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <span className="text-xs sm:text-sm text-muted-foreground">Average Marks</span>
                    <span className="text-xs sm:text-sm font-medium">{child.averageMarks}%</span>
                  </div>
                  <Progress value={child.averageMarks} className="h-1.5 sm:h-2" />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-success" />
                    <span className="text-xs sm:text-sm text-muted-foreground">Recent Grade</span>
                  </div>
                  <Badge variant="outline" className="font-bold text-xs">
                    {child.recentGrade}
                  </Badge>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-3 sm:mt-4 bg-transparent text-xs sm:text-sm" asChild>
                <Link href={`/dashboard/children/${child.id}`}>
                  {t("viewDetails")} <ArrowRight className="ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Recent Marks */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 sm:pb-4">
            <div>
              <CardTitle className="text-base sm:text-lg">{t("marks")}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Recent examination results</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="self-start sm:self-auto">
              <Link href="/dashboard/marks">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {recentMarks.map((mark, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-border last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-xs sm:text-sm text-foreground truncate">{mark.subject}</p>
                      <p className="text-xs text-muted-foreground truncate">{mark.child}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-medium text-xs sm:text-sm">
                      {mark.marks}/{mark.total}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {mark.grade}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notices */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 sm:pb-4">
            <div>
              <CardTitle className="text-base sm:text-lg">{t("notices")}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">School announcements</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="self-start sm:self-auto">
              <Link href="/dashboard/notices">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {notices.map((notice) => (
                <div
                  key={notice.id}
                  className="flex items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-border last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-accent/50 flex items-center justify-center flex-shrink-0">
                      <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-xs sm:text-sm text-foreground truncate">{notice.title}</p>
                      <p className="text-xs text-muted-foreground">{notice.date}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    {notice.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Appointments */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 sm:pb-4">
            <div>
              <CardTitle className="text-base sm:text-lg">{t("appointments")}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Your scheduled meetings with class teachers
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="self-start sm:self-auto">
              <Link href="/dashboard/appointments">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                <Calendar className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No appointments scheduled</p>
                <Button variant="outline" className="mt-4 bg-transparent" asChild>
                  <Link href="/dashboard/appointments">{t("requestAppointment")}</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-3 sm:p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-xs sm:text-sm text-foreground truncate">{appointment.child}</p>
                          <p className="text-xs text-muted-foreground">{appointment.childClass}</p>
                        </div>
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">
                          Class Teacher: <span className="text-foreground font-medium">{appointment.teacher}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span>{appointment.date}</span>
                        <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1 sm:ml-2 flex-shrink-0" />
                        <span>{appointment.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground pt-1 border-t border-border mt-2 truncate">
                        {appointment.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
