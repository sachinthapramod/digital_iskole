"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Plus, Search, Edit, Trash2, Mail, Phone, Users } from "lucide-react"

interface Parent {
  id: string
  name: string
  email: string
  phone: string
  children: string[]
  status: string
}

const initialParents: Parent[] = [
  {
    id: "1",
    name: "Mr. Nimal Perera",
    email: "nimal.perera@gmail.com",
    phone: "+94 71 234 5678",
    children: ["Kasun Perera (10-A)"],
    status: "active",
  },
  {
    id: "2",
    name: "Mrs. Kamala Silva",
    email: "kamala.silva@gmail.com",
    phone: "+94 77 345 6789",
    children: ["Nimali Silva (10-A)", "Amal Silva (8-B)"],
    status: "active",
  },
  {
    id: "3",
    name: "Mr. Sunil Fernando",
    email: "sunil.fernando@gmail.com",
    phone: "+94 76 456 7890",
    children: ["Amal Fernando (10-A)"],
    status: "active",
  },
  {
    id: "4",
    name: "Mrs. Malini Jayawardena",
    email: "malini.j@gmail.com",
    phone: "+94 78 567 8901",
    children: ["Sithara Jayawardena (9-A)"],
    status: "inactive",
  },
]

export default function ParentsPage() {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [parents, setParents] = useState<Parent[]>(initialParents)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingParent, setEditingParent] = useState<Parent | null>(null)
  const [newParent, setNewParent] = useState({ name: "", email: "", phone: "", password: "" })

  const filteredParents = parents.filter(
    (parent) =>
      parent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parent.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddParent = () => {
    setParents([...parents, { ...newParent, id: String(parents.length + 1), children: [], status: "active" }])
    setDialogOpen(false)
    setNewParent({ name: "", email: "", phone: "", password: "" })
  }

  const handleEditParent = (parent: Parent) => {
    setEditingParent(parent)
    setEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (editingParent) {
      setParents(parents.map((p) => (p.id === editingParent.id ? editingParent : p)))
      setEditDialogOpen(false)
      setEditingParent(null)
    }
  }

  const handleDeleteParent = (id: string) => {
    if (confirm("Are you sure you want to delete this parent?")) {
      setParents(parents.filter((p) => p.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("parents")}</h1>
          <p className="text-muted-foreground">Manage parent accounts and associations</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Parent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Parent</DialogTitle>
              <DialogDescription>Create a parent account</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("userName")}</Label>
                <Input
                  placeholder="Full name"
                  value={newParent.name}
                  onChange={(e) => setNewParent({ ...newParent, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("email")}</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={newParent.email}
                  onChange={(e) => setNewParent({ ...newParent, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  placeholder="+94 XX XXX XXXX"
                  value={newParent.phone}
                  onChange={(e) => setNewParent({ ...newParent, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("password")}</Label>
                <Input
                  type="password"
                  placeholder="Temporary password"
                  value={newParent.password}
                  onChange={(e) => setNewParent({ ...newParent, password: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t("cancel")}
              </Button>
              <Button onClick={handleAddParent}>{t("add")}</Button>
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
              placeholder="Search parents by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Parents Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Parents</CardTitle>
          <CardDescription>{filteredParents.length} parents found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">{t("userName")}</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Contact</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Children</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">{t("status")}</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredParents.map((parent) => (
                  <tr key={parent.id} className="border-b border-border last:border-0">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-medium">
                          {parent.name
                            .split(" ")
                            .slice(1)
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <span className="text-sm font-medium text-foreground">{parent.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {parent.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {parent.phone}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div className="space-y-1">
                          {parent.children.length > 0 ? (
                            parent.children.map((child, idx) => (
                              <p key={idx} className="text-sm text-foreground">
                                {child}
                              </p>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">No children linked</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <Badge
                        variant={parent.status === "active" ? "default" : "secondary"}
                        className={parent.status === "active" ? "bg-success text-success-foreground" : ""}
                      >
                        {t(parent.status as "active" | "inactive")}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEditParent(parent)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleDeleteParent(parent.id)}
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
            <DialogTitle>Edit Parent</DialogTitle>
            <DialogDescription>Update parent information</DialogDescription>
          </DialogHeader>
          {editingParent && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("userName")}</Label>
                <Input
                  value={editingParent.name}
                  onChange={(e) => setEditingParent({ ...editingParent, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("email")}</Label>
                <Input
                  type="email"
                  value={editingParent.email}
                  onChange={(e) => setEditingParent({ ...editingParent, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={editingParent.phone}
                  onChange={(e) => setEditingParent({ ...editingParent, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("status")}</Label>
                <Select
                  value={editingParent.status}
                  onValueChange={(v) => setEditingParent({ ...editingParent, status: v })}
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
