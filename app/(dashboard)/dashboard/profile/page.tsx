"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useLanguage } from "@/lib/i18n/context"
import { useAuth } from "@/lib/auth/context"
import { Mail, Phone, MapPin, Calendar, Shield, Save, Eye, EyeOff, Lock } from "lucide-react"

export default function ProfilePage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" })

  const handleSave = () => {
    alert("Profile updated successfully!")
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t("profile")}</h1>
        <p className="text-sm text-muted-foreground">Manage your account information</p>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl sm:text-3xl font-bold">
                {user?.name?.charAt(0) || "U"}
              </div>
              <h2 className="mt-4 text-lg sm:text-xl font-semibold text-foreground">{user?.name}</h2>
              <p className="text-sm text-muted-foreground capitalize">{user?.role}</p>

              <Separator className="my-4 sm:my-6" />

              <div className="w-full space-y-3 sm:space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-foreground truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-foreground">+94 71 234 5678</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-foreground">Colombo, Sri Lanka</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-foreground">Joined Dec 2023</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-foreground capitalize">{user?.role} Access</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Edit Profile</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input defaultValue={user?.name?.split(" ")[0]} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input defaultValue={user?.name?.split(" ").slice(1).join(" ")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("email")}</Label>
              <Input type="email" defaultValue={user?.email} />
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input defaultValue="+94 71 234 5678" />
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input type="date" defaultValue="1985-06-15" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <Input defaultValue="123 Main Street, Colombo 07" />
            </div>

            <Separator />

            <Card className="border-dashed">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  <CardTitle className="text-sm sm:text-base">Change Password</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Current Password</Label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Current password"
                        value={passwords.current}
                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">New Password</Label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="New password"
                        value={passwords.new}
                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSave} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                {t("save")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
