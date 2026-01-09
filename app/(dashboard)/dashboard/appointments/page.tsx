"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Calendar, Clock, Plus, Check, X, User } from "lucide-react"

// Mock data
const mockAppointments = [
  {
    id: "1",
    parent: "Mr. Nimal Silva",
    teacher: "Mrs. Kumari Perera",
    student: "Kasun Silva",
    date: "2024-12-14",
    time: "10:00 AM",
    reason: "Discuss academic progress",
    status: "pending",
  },
  {
    id: "2",
    parent: "Mrs. Malini Fernando",
    teacher: "Mr. Amal Kumar",
    student: "Priya Fernando",
    date: "2024-12-15",
    time: "2:00 PM",
    reason: "Attendance concerns",
    status: "approved",
  },
  {
    id: "3",
    parent: "Mr. Ruwan Bandara",
    teacher: "Mrs. Kumari Perera",
    student: "Dinesh Bandara",
    date: "2024-12-13",
    time: "11:00 AM",
    reason: "Career guidance discussion",
    status: "completed",
  },
  {
    id: "4",
    parent: "Mrs. Sithara Mendis",
    teacher: "Mr. Amal Kumar",
    student: "Nuwan Mendis",
    date: "2024-12-16",
    time: "3:00 PM",
    reason: "Behavioral concerns",
    status: "rejected",
  },
]

const mockParentChildren = [
  {
    id: "1",
    name: "Kasun Silva",
    class: "Grade 10 - A",
    classTeacher: {
      id: "t1",
      name: "Mrs. Kumari Perera",
    },
  },
  {
    id: "2",
    name: "Nimali Silva",
    class: "Grade 8 - B",
    classTeacher: {
      id: "t2",
      name: "Mr. Amal Kumar",
    },
  },
]

type AppointmentStatus = "pending" | "approved" | "rejected" | "completed"

export default function AppointmentsPage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [appointments, setAppointments] = useState(mockAppointments)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedChild, setSelectedChild] = useState("")
  const [newAppointment, setNewAppointment] = useState({
    date: "",
    time: "",
    reason: "",
  })

  const getSelectedChildTeacher = () => {
    const child = mockParentChildren.find((c) => c.id === selectedChild)
    return child?.classTeacher
  }

  const getStatusBadge = (status: AppointmentStatus) => {
    const statusConfig = {
      pending: { label: t("pending"), variant: "secondary" as const },
      approved: { label: t("approved"), className: "bg-success text-success-foreground" },
      rejected: { label: t("rejected"), variant: "destructive" as const },
      completed: { label: t("completed"), variant: "outline" as const },
    }
    const config = statusConfig[status]
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const handleStatusChange = (id: string, status: AppointmentStatus) => {
    setAppointments((prev) => prev.map((apt) => (apt.id === id ? { ...apt, status } : apt)))
  }

  const handleCreateAppointment = () => {
    const child = mockParentChildren.find((c) => c.id === selectedChild)
    if (!child) return

    const newApt = {
      id: String(appointments.length + 1),
      parent: "Mr. Nimal Silva", // Mock logged-in parent
      teacher: child.classTeacher.name,
      student: child.name,
      date: newAppointment.date,
      time: newAppointment.time,
      reason: newAppointment.reason,
      status: "pending",
    }
    setAppointments((prev) => [...prev, newApt])
    setDialogOpen(false)
    setSelectedChild("")
    setNewAppointment({ date: "", time: "", reason: "" })
  }

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setSelectedChild("")
      setNewAppointment({ date: "", time: "", reason: "" })
    }
  }

  const filteredAppointments =
    user?.role === "teacher"
      ? appointments.filter((apt) => apt.teacher === "Mrs. Kumari Perera") // Mock filter for logged-in teacher
      : user?.role === "parent"
        ? appointments.filter((apt) => apt.parent === "Mr. Nimal Silva") // Mock filter for logged-in parent
        : appointments

  const pendingCount = filteredAppointments.filter((apt) => apt.status === "pending").length
  const approvedCount = filteredAppointments.filter((apt) => apt.status === "approved").length

  const selectedTeacher = getSelectedChildTeacher()

  const isTeacher = user?.role === "teacher"
  const isAdmin = user?.role === "admin"
  const isParent = user?.role === "parent"

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t("appointments")}</h1>
          <p className="text-sm text-muted-foreground">
            {isParent
              ? "Request and manage teacher meetings"
              : isAdmin
                ? "View all parent-teacher appointments"
                : "Manage parent-teacher appointments"}
          </p>
        </div>
        {isParent && (
          <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                {t("requestAppointment")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{t("requestAppointment")}</DialogTitle>
                <DialogDescription>Schedule a meeting with your child&apos;s class teacher</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>{t("selectChild")}</Label>
                  <Select value={selectedChild} onValueChange={setSelectedChild}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your child" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockParentChildren.map((child) => (
                        <SelectItem key={child.id} value={child.id}>
                          {child.name} - {child.class}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedChild && selectedTeacher && (
                  <div className="space-y-2">
                    <Label>{t("classTeacher")}</Label>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{selectedTeacher.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          Class Teacher - {mockParentChildren.find((c) => c.id === selectedChild)?.class}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t("appointmentDate")}</Label>
                    <Input
                      type="date"
                      value={newAppointment.date}
                      onChange={(e) => setNewAppointment((prev) => ({ ...prev, date: e.target.value }))}
                      disabled={!selectedChild}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("appointmentTime")}</Label>
                    <Select
                      value={newAppointment.time}
                      onValueChange={(v) => setNewAppointment((prev) => ({ ...prev, time: v }))}
                      disabled={!selectedChild}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="09:00 AM">9:00 AM</SelectItem>
                        <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                        <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                        <SelectItem value="02:00 PM">2:00 PM</SelectItem>
                        <SelectItem value="03:00 PM">3:00 PM</SelectItem>
                        <SelectItem value="04:00 PM">4:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("reason")}</Label>
                  <Textarea
                    placeholder="Briefly describe the reason for the meeting..."
                    value={newAppointment.reason}
                    onChange={(e) => setNewAppointment((prev) => ({ ...prev, reason: e.target.value }))}
                    disabled={!selectedChild}
                  />
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => handleDialogChange(false)} className="w-full sm:w-auto">
                  {t("cancel")}
                </Button>
                <Button
                  onClick={handleCreateAppointment}
                  disabled={!selectedChild || !newAppointment.date || !newAppointment.time || !newAppointment.reason}
                  className="w-full sm:w-auto"
                >
                  {t("submit")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">{t("pending")}</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{pendingCount}</p>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-warning/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">{t("approved")}</p>
                <p className="text-xl sm:text-2xl font-bold text-success">{approvedCount}</p>
              </div>
              <Check className="h-6 w-6 sm:h-8 sm:w-8 text-success/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">{t("completed")}</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  {filteredAppointments.filter((apt) => apt.status === "completed").length}
                </p>
              </div>
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{filteredAppointments.length}</p>
              </div>
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments List */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">All Appointments</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {isAdmin ? "View all appointment requests" : "View and manage appointment requests"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4 w-full justify-start overflow-x-auto">
              <TabsTrigger value="all" className="text-xs sm:text-sm">
                All
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-xs sm:text-sm">
                {t("pending")}
              </TabsTrigger>
              <TabsTrigger value="approved" className="text-xs sm:text-sm">
                {t("approved")}
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs sm:text-sm">
                {t("completed")}
              </TabsTrigger>
            </TabsList>

            {["all", "pending", "approved", "completed"].map((tab) => (
              <TabsContent key={tab} value={tab}>
                <div className="block sm:hidden space-y-3">
                  {filteredAppointments
                    .filter((apt) => tab === "all" || apt.status === tab)
                    .map((appointment) => (
                      <div key={appointment.id} className="p-3 rounded-lg border border-border bg-card">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-sm text-foreground">{appointment.student}</p>
                            <p className="text-xs text-muted-foreground">
                              {!isParent && appointment.parent}
                              {!isTeacher && !isParent && " • "}
                              {!isTeacher && appointment.teacher}
                            </p>
                          </div>
                          {getStatusBadge(appointment.status as AppointmentStatus)}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {appointment.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {appointment.time}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{appointment.reason}</p>
                        {isTeacher && appointment.status === "pending" && (
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              className="bg-success hover:bg-success/80 flex-1"
                              onClick={() => handleStatusChange(appointment.id, "approved")}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex-1"
                              onClick={() => handleStatusChange(appointment.id, "rejected")}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                        {isTeacher && appointment.status === "approved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full mt-2 bg-transparent"
                            onClick={() => handleStatusChange(appointment.id, "completed")}
                          >
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    ))}
                </div>
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        {!isParent && (
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Parent</th>
                        )}
                        {!isTeacher && (
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Teacher</th>
                        )}
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Student</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                          {t("date")} & {t("time")}
                        </th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">{t("reason")}</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">{t("status")}</th>
                        {isTeacher && (
                          <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                            {t("actions")}
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppointments
                        .filter((apt) => tab === "all" || apt.status === tab)
                        .map((appointment) => (
                          <tr key={appointment.id} className="border-b border-border last:border-0">
                            {!isParent && <td className="py-3 px-2 text-sm text-foreground">{appointment.parent}</td>}
                            {!isTeacher && <td className="py-3 px-2 text-sm text-foreground">{appointment.teacher}</td>}
                            <td className="py-3 px-2 text-sm text-foreground">{appointment.student}</td>
                            <td className="py-3 px-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {appointment.date}
                                <Clock className="h-4 w-4 ml-2" />
                                {appointment.time}
                              </div>
                            </td>
                            <td className="py-3 px-2 text-sm text-muted-foreground max-w-xs truncate">
                              {appointment.reason}
                            </td>
                            <td className="py-3 px-2">{getStatusBadge(appointment.status as AppointmentStatus)}</td>
                            {isTeacher && (
                              <td className="py-3 px-2">
                                {appointment.status === "pending" && (
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      className="bg-success hover:bg-success/80"
                                      onClick={() => handleStatusChange(appointment.id, "approved")}
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleStatusChange(appointment.id, "rejected")}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                                {appointment.status === "approved" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleStatusChange(appointment.id, "completed")}
                                  >
                                    Mark Complete
                                  </Button>
                                )}
                              </td>
                            )}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
