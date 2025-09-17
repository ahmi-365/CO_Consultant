"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Mail, Plus, Loader2, AlertCircle } from "lucide-react";

// Role service to fetch roles from API
const roleService = {
  async getAll() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/roles`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const result = await res.json();

      if (!res.ok) {
        return { success: false, message: result.message || "Failed to fetch roles" };
      }

      return { success: true, data: result };
    } catch (err) {
      console.error("❌ Get roles error:", err);
      return { success: false, message: "Something went wrong" };
    }
  },
};

export function UserForm({ onSubmit, isLoading = false, initialData, mode = "add" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
    role: "",
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setFormData({ ...initialData, password: "" });
      } else if (mode === "add") {
        resetForm();
      }
    }
  }, [isOpen, mode, initialData]);

  useEffect(() => {
    if (isOpen && roles.length === 0) {
      fetchRoles();
    }
  }, [isOpen]);

  const fetchRoles = async () => {
    setRolesLoading(true);
    try {
      const res = await roleService.getAll();
      if (res.success) {
        let rolesData = [];
        if (Array.isArray(res.data)) {
          rolesData = res.data;
        } else if (res.data?.data && Array.isArray(res.data.data)) {
          rolesData = res.data.data;
        } else if (res.data?.status === "success" && Array.isArray(res.data.data)) {
          rolesData = res.data.data;
        }

        setRoles(rolesData);
      } else {
        console.error("Failed to fetch roles:", res.message);
        alert(`⚠️ Failed to load roles: ${res.message}`);
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      alert("⚠️ Failed to load roles");
    } finally {
      setRolesLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitError(null);
    setFieldErrors({});

    if (!formData.name.trim() || !formData.email.trim() || !formData.role.trim()) {
      setSubmitError("Please fill in all required fields");
      return;
    }

    try {
      const result = await onSubmit(formData);

      if (result && result.success === true) {
        setIsOpen(false);
        resetForm();
      } else if (result && result.success === false) {
        if (result.errors) {
          setFieldErrors(result.errors);
        }
        setSubmitError(result.message || "Failed to save user. Please try again.");
      } else {
        setSubmitError("Failed to save user. Please try again.");
      }
    } catch (error) {
      console.error("Submit error:", error);
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.errors) {
          setFieldErrors(errorData.errors);
        }
        setSubmitError(errorData.message || "Failed to save user. Please try again.");
      } else if (error.message) {
        setSubmitError(error.message);
      } else {
        setSubmitError("An unexpected error occurred. Please try again.");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      email: "",
      password: "",
      role: "",
    });
    setSubmitError(null);
    setFieldErrors({});
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
  };

  const dialogKey = `${mode}-${initialData?.id || "new"}`;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {mode === "edit" ? (
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Add User
          </Button>
        )}
      </DialogTrigger>

      <DialogContent key={dialogKey} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {mode === "edit" ? "Edit User" : "Add New User"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          {/* Error Display */}
          {submitError && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4" />
              {submitError}
            </div>
          )}

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
                className={fieldErrors.name ? "border-red-500" : ""}
                autoComplete="new-name"
              />
              {fieldErrors.name && (
                <p className="text-xs text-red-500">{fieldErrors.name[0]}</p>
              )}
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
                  className={`pl-10 ${fieldErrors.email ? "border-red-500" : ""}`}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                  autoComplete="new-email"
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-red-500">{fieldErrors.email[0]}</p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, role: value }))
                }
                disabled={rolesLoading}
              >
                <SelectTrigger className={fieldErrors.role ? "border-red-500" : ""}>
                  <SelectValue placeholder={rolesLoading ? "Loading roles..." : "Select role"} />
                </SelectTrigger>
                <SelectContent>
                  {rolesLoading ? (
                    <SelectItem value="loading" disabled>
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading roles...
                      </div>
                    </SelectItem>
                  ) : roles.length > 0 ? (
                    roles.map((role) => (
                      <SelectItem key={role.id} value={role.name.toLowerCase()}>
                        {role.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-roles" disabled>
                      No roles available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {fieldErrors.role && (
                <p className="text-xs text-red-500">{fieldErrors.role[0]}</p>
              )}
              {!rolesLoading && roles.length === 0 && (
                <p className="text-xs text-muted-foreground text-red-500">
                  Unable to load roles. Please try refreshing the page.
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2 col-span-3">
              <Label htmlFor="password">
                Password {mode === "add" ? "*" : ""}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                required={mode === "add"}
                className={fieldErrors.password ? "border-red-500" : ""}
                autoComplete="new-password"
              />
              {fieldErrors.password && (
                <p className="text-xs text-red-500">{fieldErrors.password[0]}</p>
              )}
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

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || rolesLoading || (roles.length === 0 && !rolesLoading)}
              className="flex-1"
            >
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
  );
}