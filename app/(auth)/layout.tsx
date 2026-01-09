"use client"

import type React from "react"

import { LanguageProvider } from "@/lib/i18n/context"
import { ThemeProvider } from "@/lib/theme/context"
import { AuthProvider } from "@/lib/auth/context"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>{children}</AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
