"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LanguageProvider } from "@/lib/i18n/context"
import { ThemeProvider } from "@/lib/theme/context"
import { AuthProvider, useAuth } from "@/lib/auth/context"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { Loader2 } from "lucide-react"

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <DashboardHeader />
        <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
