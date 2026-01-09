"use client"

import { useAuth } from "@/lib/auth/context"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { TeacherDashboard } from "@/components/dashboard/teacher-dashboard"
import { ParentDashboard } from "@/components/dashboard/parent-dashboard"

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) return null

  switch (user.role) {
    case "admin":
      return <AdminDashboard />
    case "teacher":
      return <TeacherDashboard />
    case "parent":
      return <ParentDashboard />
    default:
      return null
  }
}
