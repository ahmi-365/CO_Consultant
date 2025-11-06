// src/components/forms/UserForm.jsx
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
import { User, Mail, Plus, Loader2, AlertCircle, Folder, File, FolderOpen, X, Shield, Edit } from "lucide-react";
import { FolderSelectionModal } from '../../FolderSelectionModal';

// roleService remains unchanged
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

// Data structure for selectedFolders now includes permission info:
// [{ id: 1, name: 'folder A', type: 'folder', permissions: ['read', 'write'] }]
export function UserForm({ onSubmit, isLoading = false, initialData, mode = "add" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showFolderModal, setShowFolderModal] = useState(false);
  // State now holds full item objects, which includes permission data
  const [selectedFolders, setSelectedFolders] = useState([]);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
    role: "", // This needs to be the role name string (e.g., "admin")
    folders: [], // Will be array of IDs for API submission
  });
  

  /**
   * Effect 1: Handles initial data population on open (mode="edit") or reset (mode="add").
   */
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        // Determine the role value and convert to lowercase for the select component.
        // It handles if initialData.role is an object { name: 'Admin' } or a string 'Admin'.
        const initialRole = initialData.role;
        const roleValue = initialRole?.name
          ? initialRole.name.toLowerCase()
          : (typeof initialRole === 'string' ? initialRole.toLowerCase() : "");

        const { user_type, role, ...userData } = initialData; // Destructure `role` explicitly
        setFormData({ ...userData, password: "", role: roleValue });
        setSelectedFolders(initialData.folders || []);
      } else if (mode === "add") {
        resetForm();
      }
    }
  }, [isOpen, mode, initialData]);

  /**
   * Effect 2: Fetches roles when the dialog opens and roles haven't been loaded.
   */
  useEffect(() => {
    if (isOpen && roles.length === 0) {
      fetchRoles();
    }
  }, [isOpen, roles.length]);

  /**
   * Effect 3 (FIX): Ensures role is correctly set after roles are fetched asynchronously.
   * This is necessary because 'initialData' might load before 'roles' are loaded.
   */
  useEffect(() => {
    if (mode === "edit" && isOpen && roles.length > 0 && initialData) {
      const initialRoleName = initialData.role?.name || initialData.role;

      if (initialRoleName) {
        // Find the role in the fetched list that matches the initial data's role name
        const roleToSet = roles.find(r => r.name.toLowerCase() === initialRoleName.toLowerCase())?.name.toLowerCase();

        // Only update if the value is different to avoid unnecessary re-renders
        if (roleToSet && formData.role !== roleToSet) {
          setFormData(prev => ({ ...prev, role: roleToSet }));
        }
      }
    }
  }, [roles, mode, isOpen, initialData]);

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
        setSubmitError(`Failed to load roles: ${res.message}`);
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      setSubmitError("Failed to load roles. Check console for details.");
    } finally {
      setRolesLoading(false);
    }
  };

  /**
   * Handles selection data from FolderSelectionModal.
   */
  const handleFolderSelection = (selectionData) => {
    // The selectionData is the final payload from the modal (selectedItems + Permissions)
    const finalItems = selectionData.map(item => ({
      id: item.id,
      name: item.name,
      type: item.type,
      // Permissions are now expected to be attached to the item object itself or accessed via a lookup
      permissions: item.permissions || selectionData.permissions || [],
    }));

    // This sets the full item objects in the local state
    setSelectedFolders(finalItems);
    // Do NOT update formData here, it needs to be processed in handleSubmit
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitError(null);
    setFieldErrors({});

    // Basic form validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.role.trim() || (mode === "add" && !formData.password)) {
      setSubmitError("Please fill in all required fields");
      return;
    }

    try {
      // Transform selectedFolders into the final API payload format:
      // { itemId: [permission1, permission2], ... }
      const folderPermissionsPayload = selectedFolders.reduce((acc, item) => {
        console.log(`Processing item ${item.id}:`, item.permissions);
        acc[item.id] = item.permissions; // This should be an array of permissions
        return acc;
      }, {});

      console.log("Final payload:", folderPermissionsPayload);

      const submitData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        folders: folderPermissionsPayload,
      };

      // Add id if in edit mode
      if (mode === "edit" && formData.id) {
        submitData.id = formData.id;
      }

      // Only add password if it exists
      if (formData.password && formData.password.trim()) {
        submitData.password = formData.password;
      }


      const result = await onSubmit(submitData);
      if (result?.success === true || result?.id) {
        setIsOpen(false);
        resetForm();
      } else {
        if (result?.errors) {
          setFieldErrors(result.errors);
        }
        setSubmitError(result?.message || "Failed to save user. Please try again.");
      }

    } catch (error) {
      console.error("Submit error:", error);
      const message = error.response?.data?.message || error.message || "An unexpected error occurred. Please try again.";
      const errors = error.response?.data?.errors || {};
      setFieldErrors(errors);
      setSubmitError(message);
    }
  };

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      email: "",
      password: "",
      role: "",
      folders: [],
    });
    setSelectedFolders([]);
    setSubmitError(null);
    setFieldErrors({});
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
  };

  const dialogKey = `${mode}-${initialData?.id || "new"}`;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {mode === "edit" ? (
            <Button variant="outline" size="icon" >
              <Edit className="h-4 w-4" />
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
            {submitError && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4" />
                {submitError}
              </div>
            )}

            <div className="grid grid-cols-3 gap-6">
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
                  <p className="text-xs text-muted-foreground ">
                    Unable to load roles. Please try refreshing the page.
                  </p>
                )}
              </div>

              {/* Folder Selection (CONDITIONAL DISPLAY) - Hidden in edit mode */}
              {mode !== "edit" && (
                <div className="space-y-2 col-span-3">
                  <Label>Folders & Files (Optional)</Label>
                  <div
                    className="border rounded-md w-full p-1 min-h-[40px] flex flex-wrap items-center gap-1.5 transition-shadow"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowFolderModal(true)}
                      className={`h-auto px-2 py-0.5 text-sm justify-start text-muted-foreground hover:bg-transparent hover:text-primary ${selectedFolders.length > 0 ? 'order-last' : ''}`}
                    >
                      <FolderOpen className="h-4 w-4 mr-2" />
                      {selectedFolders.length === 0
                        ? "Select Folders & Files"
                        : `(Edit Selection: ${selectedFolders.length} item${selectedFolders.length === 1 ? '' : 's'})`
                      }
                    </Button>

                    {/* Integrated Selected Items (Tags) - FIXED to show item name and permissions */}
                    {selectedFolders.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full text-xs border border-muted-foreground/20"
                      >
                        {item.type === 'folder' ? (
                          <Folder className="h-3 w-3 text-blue-600" />
                        ) : (
                          <File className="h-3 w-3 text-gray-600" />
                        )}
                        <span className="max-w-32 truncate font-medium" title={item.name}>{item.name}</span>

                        {/* Permissions Indicator */}
                        {item.permissions && item.permissions.length > 0 && (
                          <span className="flex items-center gap-1 text-green-700 bg-green-100 px-1 rounded-full ml-1">
                            <Shield className="h-3 w-3" />
                            ({item.permissions.length})
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            const updatedItems = selectedFolders.filter(f => f.id !== item.id);
                            setSelectedFolders(updatedItems);
                            // Note: We don't need to update formData here, only in handleSubmit
                          }}
                          className="ml-0.5 hover:text-red-600 p-0.5 rounded-full hover:bg-white/50 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Password */}
              {mode === "add" && (
                <div className="space-y-2 col-span-3">
                  <Label htmlFor="password">
                    Password *
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, password: e.target.value }))
                    }
                    required
                    className={fieldErrors.password ? "border-red-500" : ""}
                    autoComplete="new-password"
                  />
                  {fieldErrors.password && (
                    <p className="text-xs text-red-500">{fieldErrors.password[0]}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Set an initial password for the new user
                  </p>
                </div>
              )}

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

      {/* Folder Selection Modal (Conditionally rendered) */}
      {mode !== "edit" && (
        <FolderSelectionModal
          isOpen={showFolderModal}
          onClose={() => setShowFolderModal(false)}
          onSelect={handleFolderSelection}
          selectedItems={selectedFolders}
        />
      )}
    </>
  );
}