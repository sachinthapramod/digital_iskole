"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
import { apiRequest } from "@/lib/api/client"
import { Bell, Plus, Calendar, Users, Search, Edit, Trash2, Loader2, AlertCircle } from "lucide-react"

interface Notice {
  id: string
  title: string
  content: string
  target: string
  author: string
  date: string
  priority: string
}

export default function NoticesPage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterTarget, setFilterTarget] = useState("all")
  const [notices, setNotices] = useState<Notice[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null)
  const [newNotice, setNewNotice] = useState({
    title: "",
    content: "",
    target: "all",
    priority: "medium",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const canCreateNotice = user?.role === "admin"
  const isAdmin = user?.role === "admin"

  useEffect(() => {
    fetchNotices()
  }, [filterTarget])

  const fetchNotices = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const targetParam = filterTarget !== 'all' ? `?target=${filterTarget}` : ''
      const response = await apiRequest(`/notices${targetParam}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to fetch notices')
      }

      setNotices(data.data?.notices || [])
    } catch (err: any) {
      console.error('Fetch notices error:', err)
      if (err.message.includes('Token refresh failed') || err.message.includes('login')) {
        setError("Session expired. Please login again.")
      } else {
        setError(err.message || 'Failed to load notices')
      }
    } finally {
      setIsLoading(false)
    }
  }

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

  const handleCreateNotice = async () => {
    if (!newNotice.title || !newNotice.content) {
      setError("Please fill in title and content")
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      setSuccess(null)

      const response = await apiRequest('/notices', {
        method: 'POST',
        body: JSON.stringify({
          title: newNotice.title,
          content: newNotice.content,
          priority: newNotice.priority,
          target: newNotice.target,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to create notice')
      }

      setSuccess("Notice created successfully!")
      setDialogOpen(false)
      setNewNotice({ title: "", content: "", target: "all", priority: "medium" })
      await fetchNotices()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Create notice error:', err)
      setError(err.message || 'Failed to create notice')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditNotice = (notice: Notice) => {
    setEditingNotice(notice)
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingNotice || !editingNotice.title || !editingNotice.content) {
      setError("Please fill in title and content")
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      setSuccess(null)

      const response = await apiRequest(`/notices/${editingNotice.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: editingNotice.title,
          content: editingNotice.content,
          priority: editingNotice.priority,
          target: editingNotice.target,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to update notice')
      }

      setSuccess("Notice updated successfully!")
      setEditDialogOpen(false)
      setEditingNotice(null)
      await fetchNotices()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Update notice error:', err)
      setError(err.message || 'Failed to update notice')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteNotice = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notice?")) {
      return
    }

    try {
      setIsDeleting(id)
      setError(null)

      const response = await apiRequest(`/notices/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to delete notice')
      }

      setSuccess("Notice deleted successfully!")
      await fetchNotices()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Delete notice error:', err)
      setError(err.message || 'Failed to delete notice')
    } finally {
      setIsDeleting(null)
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
    // Only admins can modify notices
    return user?.role === "admin"
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
                <Button variant="outline" onClick={() => {
                  setDialogOpen(false)
                  setNewNotice({ title: "", content: "", target: "all", priority: "medium" })
                }}>
                  {t("cancel")}
                </Button>
                <Button onClick={handleCreateNotice} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    t("submit")
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Error/Success Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="bg-success/10 border-success">
          <AlertCircle className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">{success}</AlertDescription>
        </Alert>
      )}

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
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
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
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleEditNotice(notice)}
                        disabled={isDeleting === notice.id}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDeleteNotice(notice.id)}
                        disabled={isDeleting === notice.id}
                      >
                        {isDeleting === notice.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
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
      )}

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
            <Button variant="outline" onClick={() => {
              setEditDialogOpen(false)
              setEditingNotice(null)
            }}>
              {t("cancel")}
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                t("save")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
