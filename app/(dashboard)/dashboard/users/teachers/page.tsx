"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Plus, Search, Edit, Trash2, Mail, Phone } from "lucide-react"

// Mock data
const initialTeachers = [
  {
    id: "1",
    name: "Mrs. Kumari Perera",
    email: "kumari.perera@iskole.lk",
    phone: "+94 71 234 5678",
    subject: "Mathematics",
    assignedClass: "Grade 10-A",
    status: "active",
  },
  {
    id: "2",
    name: "Mr. Amal Kumar",
    email: "amal.kumar@iskole.lk",
    phone: "+94 77 345 6789",
    subject: "Science",
    assignedClass: "Grade 9-A",
    status: "active",
  },
  {
    id: "3",
    name: "Mrs. Sithara Fernando",
    email: "sithara.fernando@iskole.lk",
    phone: "+94 76 456 7890",
    subject: "English",
    assignedClass: "Grade 8-B",
    status: "active",
  },
  {
    id: "4",
    name: "Mr. Nuwan Bandara",
    email: "nuwan.bandara@iskole.lk",
    phone: "+94 78 567 8901",
    subject: "Sinhala",
    assignedClass: "Grade 10-B",
    status: "inactive",
  },
  {
    id: "5",
    name: "Mrs. Malini Rathnayake",
    email: "malini.rathnayake@iskole.lk",
    phone: "+94 72 678 9012",
    subject: "History",
    assignedClass: "Grade 11-A",
    status: "active",
  },
]

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
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    assignedClass: "",
  })

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddTeacher = () => {
    const newId = (teachers.length + 1).toString()
    setTeachers([...teachers, { ...newTeacher, id: newId, status: "active" }])
    setDialogOpen(false)
    setNewTeacher({ name: "", email: "", phone: "", subject: "", assignedClass: "" })
  }

  const handleEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher)
    setEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (editingTeacher) {
      setTeachers(teachers.map((t) => (t.id === editingTeacher.id ? editingTeacher : t)))
      setEditDialogOpen(false)
      setEditingTeacher(null)
    }
  }

  const handleDeleteTeacher = (id: string) => {
    if (confirm("Are you sure you want to delete this teacher?")) {
      setTeachers(teachers.filter((t) => t.id !== id))
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t("cancel")}
              </Button>
              <Button onClick={handleAddTeacher}>{t("add")}</Button>
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
                {filteredTeachers.map((teacher) => (
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
                        <Button size="sm" variant="ghost" onClick={() => handleEditTeacher(teacher)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleDeleteTeacher(teacher.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
