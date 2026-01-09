"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatsCard } from "@/components/dashboard/stats-card"
import { useLanguage } from "@/lib/i18n/context"
import { Users, GraduationCap, School, ClipboardCheck, Calendar, Bell, Plus, ArrowRight } from "lucide-react"
import Link from "next/link"

// Mock data
const recentNotices = [
  { id: 1, title: "School Sports Day Announcement", date: "2024-12-10", target: "All" },
  { id: 2, title: "Parent-Teacher Meeting Schedule", date: "2024-12-08", target: "Parents" },
  { id: 3, title: "Holiday Calendar Update", date: "2024-12-05", target: "All" },
]

const upcomingExams = [
  { id: 1, name: "Mid-Term Examination", date: "2024-12-20", grade: "Grade 10" },
  { id: 2, name: "Science Quiz", date: "2024-12-15", grade: "Grade 8" },
  { id: 3, name: "Mathematics Test", date: "2024-12-18", grade: "Grade 9" },
]

const pendingAppointments = [
  {
    id: 1,
    parent: "Mr. Silva",
    teacher: "Mrs. Perera",
    child: "Kasun Silva",
    class: "Grade 10-A",
    date: "2024-12-12",
    time: "10:00 AM",
    reason: "Academic Progress Discussion",
    status: "pending",
  },
  {
    id: 2,
    parent: "Mrs. Fernando",
    teacher: "Mr. Kumar",
    child: "Nethmi Fernando",
    class: "Grade 8-B",
    date: "2024-12-13",
    time: "2:00 PM",
    reason: "Behavior Concern",
    status: "pending",
  },
  {
    id: 3,
    parent: "Mr. Jayawardena",
    teacher: "Mrs. Perera",
    child: "Amal Jayawardena",
    class: "Grade 10-A",
    date: "2024-12-14",
    time: "11:00 AM",
    reason: "Career Guidance",
    status: "pending",
  },
]

export function AdminDashboard() {
  const { t } = useLanguage()

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t("dashboard")}</h1>
          <p className="text-sm text-muted-foreground">Overview of school management system</p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/dashboard/notices">
              <Plus className="h-4 w-4 mr-2" />
              {t("createNotice")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t("totalStudents")}
          value="1,234"
          icon={GraduationCap}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard title={t("totalTeachers")} value="86" icon={Users} trend={{ value: 5, isPositive: true }} />
        <StatsCard title={t("totalClasses")} value="42" icon={School} description="Across all grades" />
        <StatsCard
          title={t("todayAttendance")}
          value="94.5%"
          icon={ClipboardCheck}
          trend={{ value: 2.3, isPositive: true }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Recent Notices */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 sm:pb-4">
            <div>
              <CardTitle className="text-base sm:text-lg">{t("recentNotices")}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Latest announcements and updates</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="self-start sm:self-auto">
              <Link href="/dashboard/notices">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {recentNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="flex items-start justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-border last:border-0 last:pb-0"
                >
                  <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-xs sm:text-sm text-foreground truncate">{notice.title}</p>
                      <p className="text-xs text-muted-foreground">{notice.date}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    {notice.target}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Exams */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 sm:pb-4">
            <div>
              <CardTitle className="text-base sm:text-lg">{t("upcomingExams")}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Scheduled examinations</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="self-start sm:self-auto">
              <Link href="/dashboard/exams">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {upcomingExams.map((exam) => (
                <div
                  key={exam.id}
                  className="flex items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-border last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-accent/50 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-xs sm:text-sm text-foreground truncate">{exam.name}</p>
                      <p className="text-xs text-muted-foreground">{exam.grade}</p>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">{exam.date}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Appointments */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 sm:pb-4">
            <div>
              <CardTitle className="text-base sm:text-lg">{t("pendingAppointments")}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Overview of parent-teacher meeting requests
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="self-start sm:self-auto">
              <Link href="/dashboard/appointments">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {pendingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-3 sm:p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-xs sm:text-sm text-foreground">{appointment.parent}</p>
                        <p className="text-xs text-muted-foreground">{appointment.child}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-xs">
                      Pending
                    </Badge>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GraduationCap className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                      <span className="truncate">
                        {appointment.teacher} ({appointment.class})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                      <span>
                        {appointment.date} at {appointment.time}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground pt-1 border-t border-border mt-2 truncate">
                      {appointment.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
