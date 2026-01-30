"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Logo } from "@/components/logo"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import { useLanguage } from "@/lib/i18n/context"
import { Loader2, AlertCircle, ArrowLeft, CheckCircle } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

export default function ForgotPasswordPage() {
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const message = data?.message || data?.error?.message || "Something went wrong. Please try again."
        setError(message)
        setIsSubmitting(false)
        return
      }

      setSuccess(true)
    } catch (_err) {
      setError("Unable to connect. Please check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between p-4 border-b border-border">
        <Logo />
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t("forgotPasswordTitle")}</CardTitle>
            <CardDescription>{t("forgotPasswordSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <Alert className="border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{t("resetEmailSent")}</AlertDescription>
                </Alert>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t("backToLogin")}
                  </Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">{t("email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@digitaliskole.lk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("loading")}
                    </>
                  ) : (
                    t("sendResetLink")
                  )}
                </Button>

                <Button asChild variant="ghost" className="w-full">
                  <Link href="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t("backToLogin")}
                  </Link>
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>

      <footer className="p-4 text-center text-sm text-muted-foreground border-t border-border">
        <p>&copy; {new Date().getFullYear()} Digital Iskole. All rights reserved.</p>
      </footer>
    </div>
  )
}
