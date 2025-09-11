"use client"


import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, User, Mail, Shield, Key, Pencil } from "lucide-react"



/**
 * @typedef {Object} UserFormProps
 * @property {(userData: UserFormData) => void} onSubmit
 * @property {boolean} [isLoading]
 * @property {UserFormData} [initialData]
 * @property {"add" | "edit"} [mode]
 */

export function UserForm({
  onSubmit,
  isLoading = false,
  initialData,
  mode = "add",
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<UserFormData>({
    id: undefined,
    name: "",
    email: "",
    password: "",
    role: "",
  })

  useEffect(() => {
    if (initialData && mode === "edit") {
      setFormData({ ...initialData, password: "" }) // password blank rakhenge
    }
  }, [initialData, mode])

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.email.trim() || !formData.role.trim()) {
      return
    }

    onSubmit(formData)
    setIsOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      id: undefined,
      name: "",
      email: "",
      password: "",
      role: "",
    })
  }

  const handleClose = () => {
    setIsOpen(false)
    resetForm()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
       <span className="flex items-center text-sm font-medium text-gray-700">
  {mode === "edit" ? (
    <>
      Edit
    </>
  ) : (
    <>
      <Plus className="h-4 w-4 mr-2" /> Add User
    </>
  )}
</span>

      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {mode === "edit" ? "Edit User" : "Add New User"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            {/* Role */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="uploader">Uploader</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Password */}
            <div className="space-y-2 col-span-3">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
              />
              {mode === "add" ? (
                <p className="text-xs text-muted-foreground">
                  Set an initial password for the new user
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Leave empty to keep current password
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 bg-transparent"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading
                ? mode === "edit"
                  ? "Updating..."
                  : "Creating..."
                : mode === "edit"
                ? "Update User"
                : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
