"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationsPopover } from "@/components/dashboard/notifications-popover"
import { useLanguage } from "@/lib/i18n/context"
import { useAuth } from "@/lib/auth/context"
import { useRouter } from "next/navigation"
import { LogOut, User, Settings } from "lucide-react"

export function DashboardHeader() {
  const { t } = useLanguage()
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 sm:h-16 px-4 lg:px-6 bg-background border-b border-border">
      <div className="lg:hidden w-10" /> {/* Spacer for mobile menu button */}
      <div className="hidden lg:block">
        <h1 className="text-lg font-semibold text-foreground">
          {t("welcome")}, {user?.name?.split(" ")[0]}
        </h1>
      </div>
      <div className="lg:hidden flex-1 text-center">
        <h1 className="text-sm font-semibold text-foreground truncate">
          {t("welcome")}, {user?.name?.split(" ")[0]}
        </h1>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <NotificationsPopover />

        <div className="hidden xs:block sm:block">
          <LanguageSwitcher />
        </div>
        <ThemeToggle />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 sm:h-9 sm:w-9">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm sm:text-base font-medium">
                {user?.name?.charAt(0) || "U"}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <div className="sm:hidden px-2 py-1.5">
              <LanguageSwitcher />
            </div>
            <DropdownMenuSeparator className="sm:hidden" />
            <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
              <User className="mr-2 h-4 w-4" />
              {t("profile")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              {t("settings")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              {t("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
