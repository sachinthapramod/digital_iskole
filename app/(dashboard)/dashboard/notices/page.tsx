"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useLanguage } from "@/lib/i18n/context"
import { useAuth } from "@/lib/auth/context"
import { Bell, Plus, Calendar, Users, Search, Edit, Trash2 } from "lucide-react"

interface Notice {
  id: string
  title: string
  content: string
  target: string
  author: string
  date: string
  priority: string
}

const initialNotices: Notice[] = [
  {
    id: "1",
    title: "School Sports Day 2024",
    content:
      "We are pleased to announce that the Annual Sports Day will be held on December 20th, 2024. All students are expected to participate in at least one event. Parents are cordially invited to attend and support their children.",
    target: "all",
    author: "Admin Office",
    date: "2024-12-10",
    priority: "high",
  },
  {
    id: "2",
    title: "Parent-Teacher Meeting Schedule",
    content:
      "The quarterly Parent-Teacher meeting is scheduled for December 15th, 2024. Please check the appointment schedule and confirm your attendance through the portal.",
    target: "parents",
    author: "Principal",
    date: "2024-12-08",
    priority: "medium",
  },
  {
    id: "3",
    title: "Holiday Calendar Update",
    content:
      "Please note that the school will remain closed from December 23rd to January 2nd for the winter holidays. Regular classes will resume on January 3rd, 2025.",
    target: "all",
    author: "Admin Office",
    date: "2024-12-05",
    priority: "low",
  },
  {
    id: "4",
    title: "Mid-Term Examination Results",
    content:
      "Mid-term examination results are now available. Parents can view their child's performance through the Marks section of the portal.",
    target: "parents",
    author: "Examination Department",
    date: "2024-12-01",
    priority: "medium",
  },
  {
    id: "5",
    title: "Staff Meeting Notice",
    content:
      "All teaching staff are requested to attend the monthly staff meeting on December 18th at 3:00 PM in the main auditorium.",
    target: "teachers",
    author: "Principal",
    date: "2024-12-03",
    priority: "high",
  },
]

export default function NoticesPage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterTarget, setFilterTarget] = useState("all")
  const [notices, setNotices] = useState<Notice[]>(initialNotices)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null)
  const [newNotice, setNewNotice] = useState({
    title: "",
    content: "",
    target: "all",
    priority: "medium",
  })

  const canCreateNotice = user?.role === "admin" || user?.role === "teacher"
  const isAdmin = user?.role === "admin"

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch =
      notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTarget = filterTarget === "all" || notice.target === filterTarget || notice.target === "all"

    // Filter based on user role
    if (user?.role === "teacher") {
      return matchesSearch && (notice.target === "all" || notice.target === "teachers")
    }
    if (user?.role === "parent") {
      return matchesSearch && (notice.target === "all" || notice.target === "parents")
    }
    return matchesSearch && matchesTarget
  })

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High Priority</Badge>
      case "medium":
        return <Badge variant="secondary">Medium</Badge>
      case "low":
        return <Badge variant="outline">Low</Badge>
      default:
        return null
    }
  }

  const getTargetBadge = (target: string) => {
    switch (target) {
      case "all":
        return <Badge className="bg-primary">{t("allUsers")}</Badge>
      case "teachers":
        return <Badge className="bg-success text-success-foreground">{t("teachers")}</Badge>
      case "parents":
        return <Badge className="bg-accent text-accent-foreground">{t("parents")}</Badge>
      case "students":
        return <Badge className="bg-secondary text-secondary-foreground">{t("students")}</Badge>
      default:
        return null
    }
  }

  const handleCreateNotice = () => {
    const notice: Notice = {
      id: String(notices.length + 1),
      ...newNotice,
      author: user?.name || "Unknown",
      date: new Date().toISOString().split("T")[0],
    }
    setNotices([notice, ...notices])
    setDialogOpen(false)
    setNewNotice({ title: "", content: "", target: "all", priority: "medium" })
  }

  const handleEditNotice = (notice: Notice) => {
    setEditingNotice(notice)
    setEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (editingNotice) {
      setNotices(notices.map((n) => (n.id === editingNotice.id ? editingNotice : n)))
      setEditDialogOpen(false)
      setEditingNotice(null)
    }
  }

  const handleDeleteNotice = (id: string) => {
    if (confirm("Are you sure you want to delete this notice?")) {
      setNotices(notices.filter((n) => n.id !== id))
    }
  }

  const getTargetOptions = () => {
    if (user?.role === "admin") {
      return [
        { value: "all", label: t("allUsers") },
        { value: "teachers", label: `${t("teachers")} Only` },
        { value: "parents", label: `${t("parents")} Only` },
        { value: "students", label: `${t("students")} Only` },
      ]
    }
    // Teachers can only send notices to their students and their parents
    return [
      { value: "students", label: "My Class Students" },
      { value: "parents", label: "Class Parents" },
    ]
  }

  const canModifyNotice = (notice: Notice) => {
    if (user?.role === "admin") return true
    if (user?.role === "teacher" && notice.author === user?.name) return true
    return false
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("notices")}</h1>
          <p className="text-muted-foreground">School announcements and updates</p>
        </div>
        {canCreateNotice && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t("createNotice")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t("createNotice")}</DialogTitle>
                <DialogDescription>
                  {isAdmin
                    ? "Create a new announcement for the school community"
                    : "Create a notice for your class students or their parents"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>{t("noticeTitle")}</Label>
                  <Input
                    placeholder="Enter notice title"
                    value={newNotice.title}
                    onChange={(e) => setNewNotice((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("noticeContent")}</Label>
                  <Textarea
                    placeholder="Write your announcement here..."
                    rows={5}
                    value={newNotice.content}
                    onChange={(e) => setNewNotice((prev) => ({ ...prev, content: e.target.value }))}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t("noticeTarget")}</Label>
                    <Select
                      value={newNotice.target}
                      onValueChange={(v) => setNewNotice((prev) => ({ ...prev, target: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getTargetOptions().map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={newNotice.priority}
                      onValueChange={(v) => setNewNotice((prev) => ({ ...prev, priority: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="low">Low Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  {t("cancel")}
                </Button>
                <Button onClick={handleCreateNotice}>{t("submit")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("search")}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            {isAdmin && (
              <div className="space-y-2">
                <Label>{t("filter")}</Label>
                <Select value={filterTarget} onValueChange={setFilterTarget}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Notices</SelectItem>
                    <SelectItem value="teachers">{t("teachers")} Only</SelectItem>
                    <SelectItem value="parents">{t("parents")} Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notices List */}
      <div className="space-y-4">
        {filteredNotices.map((notice) => (
          <Card key={notice.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{notice.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3" />
                      {notice.date}
                      <span className="mx-1">•</span>
                      <Users className="h-3 w-3" />
                      {notice.author}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {getPriorityBadge(notice.priority)}
                  {getTargetBadge(notice.target)}
                  {canModifyNotice(notice) && (
                    <div className="flex gap-1 ml-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEditNotice(notice)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDeleteNotice(notice.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{notice.content}</p>
            </CardContent>
          </Card>
        ))}

        {filteredNotices.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">{t("noData")}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Notice</DialogTitle>
            <DialogDescription>Update the notice details</DialogDescription>
          </DialogHeader>
          {editingNotice && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("noticeTitle")}</Label>
                <Input
                  value={editingNotice.title}
                  onChange={(e) => setEditingNotice({ ...editingNotice, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("noticeContent")}</Label>
                <Textarea
                  rows={5}
                  value={editingNotice.content}
                  onChange={(e) => setEditingNotice({ ...editingNotice, content: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("noticeTarget")}</Label>
                  <Select
                    value={editingNotice.target}
                    onValueChange={(v) => setEditingNotice({ ...editingNotice, target: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getTargetOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={editingNotice.priority}
                    onValueChange={(v) => setEditingNotice({ ...editingNotice, priority: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleSaveEdit}>{t("save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
