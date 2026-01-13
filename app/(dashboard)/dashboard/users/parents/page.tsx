"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
import { Plus, Search, Edit, Trash2, Mail, Phone, Users, Loader2, AlertCircle } from "lucide-react"
import { apiRequest } from "@/lib/api/client"

interface Parent {
  id: string
  name: string
  email: string
  phone: string
  children: string[]
  status: string
}

export default function ParentsPage() {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [parents, setParents] = useState<Parent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingParent, setEditingParent] = useState<Parent | null>(null)
  const [newParent, setNewParent] = useState({ name: "", email: "", phone: "", password: "" })

  // Fetch parents on mount
  useEffect(() => {
    fetchParents()
  }, [])

  const fetchParents = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await apiRequest('/users/parents')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to fetch parents')
      }

      setParents(data.data?.parents || [])
    } catch (err: any) {
      console.error('Fetch parents error:', err)
      if (err.message.includes('Token refresh failed') || err.message.includes('login')) {
        setError("Session expired. Please login again.")
      } else {
        setError(err.message || 'Failed to load parents')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const filteredParents = parents.filter(
    (parent) =>
      parent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parent.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddParent = async () => {
    if (!newParent.name || !newParent.email || !newParent.phone || !newParent.password) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      const response = await apiRequest('/users/parents', {
        method: 'POST',
        body: JSON.stringify({
          name: newParent.name,
          email: newParent.email,
          phone: newParent.phone,
          password: newParent.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to create parent')
      }

      setDialogOpen(false)
      setNewParent({ name: "", email: "", phone: "", password: "" })
      await fetchParents() // Refresh list
    } catch (err: any) {
      console.error('Add parent error:', err)
      if (err.message.includes('Token refresh failed') || err.message.includes('login')) {
        setError("Session expired. Please login again.")
      } else {
        setError(err.message || 'Failed to create parent')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditParent = (parent: Parent) => {
    setEditingParent(parent)
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingParent) return

    try {
      setIsSaving(true)
      setError(null)

      const response = await apiRequest(`/users/parents/${editingParent.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editingParent.name,
          email: editingParent.email,
          phone: editingParent.phone,
          status: editingParent.status,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to update parent')
      }

      setEditDialogOpen(false)
      setEditingParent(null)
      await fetchParents() // Refresh list
    } catch (err: any) {
      console.error('Update parent error:', err)
      if (err.message.includes('Token refresh failed') || err.message.includes('login')) {
        setError("Session expired. Please login again.")
      } else {
        setError(err.message || 'Failed to update parent')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteParent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this parent? This action cannot be undone.")) {
      return
    }

    try {
      setIsDeleting(id)
      setError(null)

      const response = await apiRequest(`/users/parents/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to delete parent')
      }

      await fetchParents() // Refresh list
    } catch (err: any) {
      console.error('Delete parent error:', err)
      if (err.message.includes('Token refresh failed') || err.message.includes('login')) {
        setError("Session expired. Please login again.")
      } else {
        setError(err.message || 'Failed to delete parent')
      }
    } finally {
      setIsDeleting(null)
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
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>
                {t("cancel")}
              </Button>
              <Button onClick={handleAddParent} disabled={isSaving}>
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
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Children</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">{t("status")}</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-muted-foreground">
                        No parents found
                      </td>
                    </tr>
                  ) : (
                    filteredParents.map((parent) => (
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
                        <Button size="sm" variant="ghost" onClick={() => handleEditParent(parent)} disabled={isDeleting === parent.id}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleDeleteParent(parent.id)}
                          disabled={isDeleting === parent.id}
                        >
                          {isDeleting === parent.id ? (
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
