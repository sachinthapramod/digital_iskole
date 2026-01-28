"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Logo } from "@/components/logo"
import { useLanguage } from "@/lib/i18n/context"
import { useAuth } from "@/lib/auth/context"
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  School,
  ClipboardCheck,
  FileText,
  Calendar,
  Bell,
  BellRing,
  Settings,
  Menu,
  ChevronDown,
  ChevronRight,
  UserCircle,
  FileBarChart,
  type LucideIcon,
} from "lucide-react"

interface NavItem {
  label: string
  href?: string
  icon: LucideIcon
  children?: { label: string; href: string }[]
  roles: ("admin" | "teacher" | "parent")[]
}

export function DashboardSidebar() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<string[]>(["users", "academic"])
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems: NavItem[] = [
    {
      label: t("dashboard"),
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "teacher", "parent"],
    },
    {
      label: t("users"),
      icon: Users,
      roles: ["admin"],
      children: [
        { label: t("teachers"), href: "/dashboard/users/teachers" },
        { label: t("parents"), href: "/dashboard/users/parents" },
        { label: t("students"), href: "/dashboard/users/students" },
      ],
    },
    {
      label: "Academic",
      icon: School,
      roles: ["admin"],
      children: [
        { label: t("classes"), href: "/dashboard/academic/classes" },
        { label: t("subjects"), href: "/dashboard/academic/subjects" },
      ],
    },
    {
      label: t("myChildren"),
      href: "/dashboard/children",
      icon: GraduationCap,
      roles: ["parent"],
    },
    {
      label: t("reports"),
      href: "/dashboard/reports",
      icon: FileBarChart,
      roles: ["parent", "teacher", "admin"],
    },
    {
      label: t("students"),
      href: "/dashboard/students",
      icon: GraduationCap,
      roles: ["teacher"],
    },
    {
      label: t("attendance"),
      href: "/dashboard/attendance",
      icon: ClipboardCheck,
      roles: ["admin", "teacher", "parent"],
    },
    {
      label: t("marks"),
      href: "/dashboard/marks",
      icon: FileText,
      roles: ["admin", "teacher", "parent"],
    },
    {
      label: t("exams"),
      href: "/dashboard/exams",
      icon: BookOpen,
      roles: ["admin", "teacher"],
    },
    {
      label: t("appointments"),
      href: "/dashboard/appointments",
      icon: Calendar,
      roles: ["admin", "teacher", "parent"],
    },
    {
      label: t("notices"),
      href: "/dashboard/notices",
      icon: Bell,
      roles: ["admin", "teacher", "parent"],
    },
    {
      label: t("notifications"),
      href: "/dashboard/notifications",
      icon: BellRing,
      roles: ["admin", "teacher", "parent"],
    },
    {
      label: t("profile"),
      href: "/dashboard/profile",
      icon: UserCircle,
      roles: ["admin", "teacher", "parent"],
    },
    {
      label: t("settings"),
      href: "/dashboard/settings",
      icon: Settings,
      roles: ["admin"],
    },
  ]

  const filteredNavItems = navItems.filter((item) => user && item.roles.includes(user.role))

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => (prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label]))
  }

  const isActive = (href: string) => pathname === href
  const isParentActive = (children?: { href: string }[]) => children?.some((child) => pathname === child.href)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-3 sm:p-4 border-b border-sidebar-border">
        <Logo />
      </div>
      <ScrollArea className="flex-1 px-2 sm:px-3 py-3 sm:py-4">
        <nav className="space-y-1">
          {filteredNavItems.map((item) => {
            if (item.children) {
              const isOpen = openMenus.includes(item.label)
              const hasActiveChild = isParentActive(item.children)

              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={cn(
                      "w-full flex items-center justify-between px-2.5 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors",
                      hasActiveChild
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>{item.label}</span>
                    </div>
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  {isOpen && (
                    <div className="ml-3 sm:ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-3 sm:pl-4">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "block px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors",
                            isActive(child.href)
                              ? "bg-sidebar-primary text-sidebar-primary-foreground"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href!}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors",
                  isActive(item.href!)
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
      <div className="p-3 sm:p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-medium text-sm">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-sidebar border-r border-sidebar-border">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden fixed top-3 left-3 z-40 h-8 w-8 sm:h-9 sm:w-9">
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-sidebar">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}
