"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Plus, Search, Edit, Trash2, Mail, Phone, Loader2, AlertCircle } from "lucide-react"

interface Teacher {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  assignedClass: string
  status: string
}

export default function TeachersPage() {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    assignedClass: "",
    password: "",
  })

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

  // Fetch teachers on mount
  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const token = localStorage.getItem("digital-iskole-token")
      
      if (!token) {
        setError("Not authenticated. Please login again.")
        setIsLoading(false)
        return
      }

      const response = await fetch(`${API_URL}/users/teachers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to fetch teachers')
      }

      setTeachers(data.data?.teachers || [])
    } catch (err: any) {
      console.error('Fetch teachers error:', err)
      setError(err.message || 'Failed to load teachers')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddTeacher = async () => {
    if (!newTeacher.name || !newTeacher.email || !newTeacher.phone || !newTeacher.subject || !newTeacher.password) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      const token = localStorage.getItem("digital-iskole-token")
      
      if (!token) {
        setError("Not authenticated. Please login again.")
        setIsSaving(false)
        return
      }

      const response = await fetch(`${API_URL}/users/teachers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newTeacher.name,
          email: newTeacher.email,
          phone: newTeacher.phone,
          subject: newTeacher.subject,
          assignedClass: newTeacher.assignedClass || undefined,
          password: newTeacher.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to create teacher')
      }

      setDialogOpen(false)
      setNewTeacher({ name: "", email: "", phone: "", subject: "", assignedClass: "", password: "" })
      await fetchTeachers() // Refresh list
    } catch (err: any) {
      console.error('Add teacher error:', err)
      setError(err.message || 'Failed to create teacher')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher)
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingTeacher) return

    try {
      setIsSaving(true)
      setError(null)
      const token = localStorage.getItem("digital-iskole-token")
      
      if (!token) {
        setError("Not authenticated. Please login again.")
        setIsSaving(false)
        return
      }

      const response = await fetch(`${API_URL}/users/teachers/${editingTeacher.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingTeacher.name,
          email: editingTeacher.email,
          phone: editingTeacher.phone,
          subject: editingTeacher.subject,
          assignedClass: editingTeacher.assignedClass || undefined,
          status: editingTeacher.status,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to update teacher')
      }

      setEditDialogOpen(false)
      setEditingTeacher(null)
      await fetchTeachers() // Refresh list
    } catch (err: any) {
      console.error('Update teacher error:', err)
      setError(err.message || 'Failed to update teacher')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteTeacher = async (id: string) => {
    if (!confirm("Are you sure you want to delete this teacher? This action cannot be undone.")) {
      return
    }

    try {
      setIsDeleting(id)
      setError(null)
      const token = localStorage.getItem("digital-iskole-token")
      
      if (!token) {
        setError("Not authenticated. Please login again.")
        setIsDeleting(null)
        return
      }

      const response = await fetch(`${API_URL}/users/teachers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to delete teacher')
      }

      await fetchTeachers() // Refresh list
    } catch (err: any) {
      console.error('Delete teacher error:', err)
      setError(err.message || 'Failed to delete teacher')
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("teachers")}</h1>
          <p className="text-muted-foreground">Manage teacher accounts and assignments</p>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Teacher
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Teacher</DialogTitle>
              <DialogDescription>Create a new teacher account</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("userName")}</Label>
                <Input
                  placeholder="Full name"
                  value={newTeacher.name}
                  onChange={(e) => setNewTeacher((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("email")}</Label>
                <Input
                  type="email"
                  placeholder="email@iskole.lk"
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  placeholder="+94 XX XXX XXXX"
                  value={newTeacher.phone}
                  onChange={(e) => setNewTeacher((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("subjectName")}</Label>
                <Select
                  value={newTeacher.subject}
                  onValueChange={(v) => setNewTeacher((prev) => ({ ...prev, subject: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Sinhala">Sinhala</SelectItem>
                    <SelectItem value="Tamil">Tamil</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                    <SelectItem value="Geography">Geography</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("className")}</Label>
                <Select
                  value={newTeacher.assignedClass}
                  onValueChange={(v) => setNewTeacher((prev) => ({ ...prev, assignedClass: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Assign class (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Grade 10-A">Grade 10-A</SelectItem>
                    <SelectItem value="Grade 10-B">Grade 10-B</SelectItem>
                    <SelectItem value="Grade 9-A">Grade 9-A</SelectItem>
                    <SelectItem value="Grade 9-B">Grade 9-B</SelectItem>
                    <SelectItem value="Grade 8-A">Grade 8-A</SelectItem>
                    <SelectItem value="Grade 8-B">Grade 8-B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("password")}</Label>
                <Input
                  type="password"
                  placeholder="Temporary password"
                  value={newTeacher.password}
                  onChange={(e) => setNewTeacher((prev) => ({ ...prev, password: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">Teacher will use this password to login</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>
                {t("cancel")}
              </Button>
              <Button onClick={handleAddTeacher} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  t("add")
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teachers by name, email, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Teachers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Teachers</CardTitle>
          <CardDescription>{filteredTeachers.length} teachers found</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">{t("userName")}</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Contact</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">{t("subjectName")}</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">{t("className")}</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">{t("status")}</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-foreground">
                        No teachers found
                      </td>
                    </tr>
                  ) : (
                    filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="border-b border-border last:border-0">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                          {teacher.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <span className="text-sm font-medium text-foreground">{teacher.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {teacher.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {teacher.phone}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm text-foreground">{teacher.subject}</td>
                    <td className="py-3 px-2 text-sm text-foreground">{teacher.assignedClass || "-"}</td>
                    <td className="py-3 px-2">
                      <Badge
                        variant={teacher.status === "active" ? "default" : "secondary"}
                        className={teacher.status === "active" ? "bg-success text-success-foreground" : ""}
                      >
                        {t(teacher.status as "active" | "inactive")}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEditTeacher(teacher)} disabled={isDeleting === teacher.id}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleDeleteTeacher(teacher.id)}
                          disabled={isDeleting === teacher.id}
                        >
                          {isDeleting === teacher.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Teacher</DialogTitle>
            <DialogDescription>Update teacher information</DialogDescription>
          </DialogHeader>
          {editingTeacher && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("userName")}</Label>
                <Input
                  value={editingTeacher.name}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("email")}</Label>
                <Input
                  type="email"
                  value={editingTeacher.email}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={editingTeacher.phone}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("subjectName")}</Label>
                <Select
                  value={editingTeacher.subject}
                  onValueChange={(v) => setEditingTeacher({ ...editingTeacher, subject: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Sinhala">Sinhala</SelectItem>
                    <SelectItem value="Tamil">Tamil</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                    <SelectItem value="Geography">Geography</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("className")}</Label>
                <Select
                  value={editingTeacher.assignedClass}
                  onValueChange={(v) => setEditingTeacher({ ...editingTeacher, assignedClass: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Grade 10-A">Grade 10-A</SelectItem>
                    <SelectItem value="Grade 10-B">Grade 10-B</SelectItem>
                    <SelectItem value="Grade 9-A">Grade 9-A</SelectItem>
                    <SelectItem value="Grade 9-B">Grade 9-B</SelectItem>
                    <SelectItem value="Grade 8-A">Grade 8-A</SelectItem>
                    <SelectItem value="Grade 8-B">Grade 8-B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("status")}</Label>
                <Select
                  value={editingTeacher.status}
                  onValueChange={(v) => setEditingTeacher({ ...editingTeacher, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t("active")}</SelectItem>
                    <SelectItem value="inactive">{t("inactive")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isSaving}>
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
