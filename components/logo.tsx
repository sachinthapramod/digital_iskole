"use client"

import { GraduationCap } from "lucide-react"
import { useLanguage } from "@/lib/i18n/context"

interface LogoProps {
  showText?: boolean
  size?: "sm" | "md" | "lg"
}

export function Logo({ showText = true, size = "md" }: LogoProps) {
  const { t } = useLanguage()

  const sizes = {
    sm: { icon: "h-6 w-6", text: "text-lg" },
    md: { icon: "h-8 w-8", text: "text-xl" },
    lg: { icon: "h-10 w-10", text: "text-2xl" },
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center rounded-lg bg-primary p-1.5">
        <GraduationCap className={`${sizes[size].icon} text-primary-foreground`} />
      </div>
      {showText && <span className={`font-bold ${sizes[size].text} text-foreground`}>{t("appName")}</span>}
    </div>
  )
}
