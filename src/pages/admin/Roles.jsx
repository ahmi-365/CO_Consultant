import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, MoreHorizontal, Loader2, X } from "lucide-react";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Real API Services
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

  async getById(id) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/roles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const result = await res.json();

      if (!res.ok) {
        return { success: false, message: result.message || "Failed to fetch role" };
      }

      return { success: true, data: result };
    } catch (err) {
      console.error("❌ Get role by ID error:", err);
      return { success: false, message: "Something went wrong" };
    }
  },

  async create(data) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        return { success: false, message: result.message || "Failed to create role" };
      }

      return { success: true, data: result };
    } catch (err) {
      console.error("❌ Create role error:", err);
      return { success: false, message: "Something went wrong" };
    }
  },

  async update(id, data) {
    try {
      const token = localStorage.getItem("token");
      const payload = { ...data, _method: "put" };
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/roles/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        return { success: false, message: result.message || "Failed to update role" };
      }

      return { success: true, data: result };
    } catch (err) {
      console.error("❌ Update role error:", err);
      return { success: false, message: "Something went wrong" };
    }
  },

  async delete(id) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/roles/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const result = await res.json().catch(() => null);

      if (!res.ok) {
        return { success: false, message: result?.message || "Failed to delete role" };
      }

      return { success: true, message: result?.message || "Role deleted successfully" };
    } catch (err) {
      console.error("❌ Delete role error:", err);
      return { success: false, message: "Something went wrong" };
    }
  },
};

const permissionService = {
  async getAll() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/permissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const result = await res.json();

      if (!res.ok) {
        return { success: false, message: result.message || "Failed to fetch permissions" };
      }

      console.log("Fetched permissions:", result);
      return { success: true, data: result };
    } catch (err) {
      console.error("❌ Get permissions error:", err);
      return { success: false, message: "Something went wrong" };
    }
  },

  async getById(id) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/permissions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const result = await res.json();

      if (!res.ok) {
        return { success: false, message: result.message || "Failed to fetch permission" };
      }

      return { success: true, data: result };
    } catch (err) {
      console.error("❌ Get permission by ID error:", err);
      return { success: false, message: "Something went wrong" };
    }
  },

  async create(data) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/permissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        return { success: false, message: result.message || "Failed to create permission" };
      }

      return { success: true, data: result };
    } catch (err) {
      console.error("❌ Create permission error:", err);
      return { success: false, message: "Something went wrong" };
    }
  },

  async update(id, data) {
    try {
      const token = localStorage.getItem("token");
      const payload = { ...data, _method: "put" };
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/permissions/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        return { success: false, message: result.message || "Failed to update permission" };
      }

      return { success: true, data: result };
    } catch (err) {
      console.error("❌ Update permission error:", err);
      return { success: false, message: "Something went wrong" };
    }
  },

  async delete(id) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/permissions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const result = await res.json().catch(() => null);

      if (!res.ok) {
        return { success: false, message: result?.message || "Failed to delete permission" };
      }

      return { success: true, message: result?.message || "Permission deleted successfully" };
    } catch (err) {
      console.error("❌ Delete permission error:", err);
      return { success: false, message: "Something went wrong" };
    }
  },
};

// Helper function to safely render permission text
const safeRenderPermissionText = (permission) => {
  try {
    if (typeof permission === "string") {
      return permission;
    }
    if (typeof permission === "object" && permission !== null) {
      return permission.name || permission.id?.toString() || "Unknown Permission";
    }
    return "Unknown Permission";
  } catch (error) {
    console.error("Error rendering permission text:", error, permission);
    return "Unknown Permission";
  }
};

// Helper function to extract permission names from mixed data
const extractPermissionNames = (permissions) => {
  if (!Array.isArray(permissions)) return [];
  
  return permissions.map(permission => {
    if (typeof permission === "string") {
      return permission;
    }
    if (typeof permission === "object" && permission !== null) {
      return permission.name || permission.id?.toString() || "Unknown Permission";
    }
    return "Unknown Permission";
  });
};

// Modal for viewing permissions
function RolePermissionsModal({ role }) {
  const [open, setOpen] = useState(false);

  const permissionNames = extractPermissionNames(role.permissions || []);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="text-xs">
        View Permissions ({permissionNames.length})
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Permissions for {role.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-wrap gap-2 mt-4">
            {permissionNames.length > 0 ? (
              permissionNames.map((permissionName, index) => (
                <Badge key={`${permissionName}-${index}`} variant="secondary" className="px-3 py-1 text-xs">
                  {permissionName}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No permissions assigned.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Add/Edit Role Modal
function RoleModal({ open, onOpenChange, role, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    permissions: []
  });
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!role;

  // Fetch permissions when modal opens
  useEffect(() => {
    if (open) {
      fetchPermissions();
      if (isEdit) {
        // Extract permission names from role.permissions (which are objects)
        const permissionNames = extractPermissionNames(role.permissions || []);
        console.log("Extracted permission names for edit:", permissionNames);
        
        setFormData({
          name: role.name,
          permissions: permissionNames
        });
      } else {
        setFormData({
          name: "",
          permissions: []
        });
      }
    }
  }, [open, role, isEdit]);

  const fetchPermissions = async () => {
    setPermissionsLoading(true);
    try {
      const res = await permissionService.getAll();
      if (res.success) {
        // Handle different response formats
        let permissions = [];
        if (Array.isArray(res.data)) {
          permissions = res.data;
        } else if (res.data?.data && Array.isArray(res.data.data)) {
          permissions = res.data.data;
        }
        setAvailablePermissions(permissions);
        console.log("Available permissions:", permissions);
      } else {
        console.error("Failed to fetch permissions:", res.message);
        alert(`❌ ${res.message}`);
      }
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
      alert("❌ Failed to fetch permissions");
    } finally {
      setPermissionsLoading(false);
    }
  };

  const handlePermissionToggle = (permissionName) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionName)
        ? prev.permissions.filter(p => p !== permissionName)
        : [...prev.permissions, permissionName]
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert("Role name is required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        permissions: formData.permissions
      };

      let res;
      if (isEdit) {
        res = await roleService.update(role.id, payload);
      } else {
        res = await roleService.create(payload);
      }

      if (res.success) {
        alert(`✅ Role ${isEdit ? 'updated' : 'created'} successfully`);
        onSuccess();
        onOpenChange(false);
      } else {
        alert(`❌ ${res.message || 'Something went wrong'}`);
      }
    } catch (error) {
      console.error("Error saving role:", error);
      alert(`❌ Failed to ${isEdit ? 'update' : 'create'} role`);
    } finally {
      setSubmitting(false);
    }
  };

  const groupedPermissions = availablePermissions.reduce((acc, permission) => {
    const category = permission.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(permission);
    return acc;
  }, {});

  const formatCategoryName = (category) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {isEdit ? `Edit Role: ${role?.name}` : 'Create New Role'}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Role Name */}
          <div>
            <Label htmlFor="roleName">Role Name</Label>
            <Input
              id="roleName"
              placeholder="e.g., Project Manager"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              disabled={submitting}
            />
          </div>

          {/* Permissions */}
          <div>
            <Label className="text-base font-semibold">Permissions</Label>
            {permissionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading permissions...</span>
              </div>
            ) : availablePermissions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No permissions available.</p>
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                {Object.keys(groupedPermissions).length > 0 ? (
                  Object.entries(groupedPermissions).map(([category, permissions]) => (
                    <div key={category} className="border border-border rounded-lg p-4">
                      <h4 className="font-semibold text-sm mb-3 text-primary">
                        {formatCategoryName(category)}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {permissions.map((permission) => {
                          const permissionName = safeRenderPermissionText(permission);
                          return (
                            <div
                              key={permission.id}
                              className="flex items-center justify-between p-3 border border-border rounded-lg bg-card hover:shadow-sm transition"
                            >
                              <div className="flex-1">
                                <span className="font-medium text-sm block">{permissionName}</span>
                              </div>
                              <Switch
                                checked={formData.permissions.includes(permissionName)}
                                onCheckedChange={() => handlePermissionToggle(permissionName)}
                                disabled={submitting}
                                className="h-5 w-10 ml-2"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  // Fallback for ungrouped permissions
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availablePermissions.map((permission) => {
                      const permissionName = safeRenderPermissionText(permission);
                      return (
                        <div
                          key={permission.id || permission.name || Math.random()}
                          className="flex items-center justify-between p-3 border border-border rounded-lg bg-card hover:shadow-sm transition"
                        >
                          <div className="flex-1">
                            <span className="font-medium text-sm block">{permissionName}</span>
                          </div>
                          <Switch
                            checked={formData.permissions.includes(permissionName)}
                            onCheckedChange={() => handlePermissionToggle(permissionName)}
                            disabled={submitting}
                            className="h-5 w-10 ml-2"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected Permissions Summary */}
          {formData.permissions.length > 0 && (
            <div className="border border-border rounded-lg p-4 bg-muted/50">
              <Label className="text-sm font-semibold">Selected Permissions ({formData.permissions.length})</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.permissions.map((permission, index) => (
                  <Badge key={`selected-${permission}-${index}`} variant="secondary" className="text-xs">
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !formData.name.trim()}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEdit ? 'Update Role' : 'Create Role'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  // Fetch roles
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await roleService.getAll();
      if (res?.success) {
        // Handle different response formats from your API
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
        setRoles([]);
        if (res.message) {
          alert(`❌ ${res.message}`);
        }
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      setRoles([]);
      alert("❌ Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = () => {
    setSelectedRole(null);
    setRoleModalOpen(true);
  };

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setRoleModalOpen(true);
  };

  const handleDeleteRole = async (role) => {
    if (window.confirm(`Are you sure you want to delete the role "${role.name}"?\n\nNote: Roles with assigned users cannot be deleted.`)) {
      try {
        const res = await roleService.delete(role.id);
        if (res.success) {
          alert('✅ Role deleted successfully');
          fetchRoles();
        } else {
          alert(`❌ ${res.message || 'Failed to delete role'}`);
        }
      } catch (error) {
        console.error("Failed to delete role:", error);
        alert('❌ Failed to delete role');
      }
    }
  };

  const handleRoleSuccess = () => {
    fetchRoles();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Role Management</h1>
          <p className="text-muted-foreground mt-1">Manage user roles and permissions</p>
        </div>
        <Button onClick={handleAddRole} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Role
        </Button>
      </div>

      {/* Roles List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Existing Roles</CardTitle>
          <Badge variant="outline">{roles.length} roles</Badge>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading roles...</span>
            </div>
          ) : roles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">No roles found. Create your first role.</p>
              <Button onClick={handleAddRole} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create First Role
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wider pb-2 border-b">
                <div>Role Name</div>
                <div>Users</div>
                <div>Permissions</div>
                <div className="text-right">Actions</div>
              </div>

              {roles.map((role) => (
                <div
                  key={role.id || role._id}
                  className="grid grid-cols-4 gap-4 items-center py-4 border-b border-border last:border-0 hover:bg-muted/50 rounded-lg px-2 transition-colors"
                >
                  <div>
                    <div className="font-medium text-sm">{role.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {role.created_at && (
                        <>Created: {new Date(role.created_at).toLocaleDateString()}</>
                      )}
                    </div>
                  </div>
                  <div>
                    <Badge variant="outline" className="text-xs">
                      {role.user_count || 0} users
                    </Badge>
                  </div>
                  <div>
                    <RolePermissionsModal role={role} />
                  </div>
                  <div className="flex justify-end items-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditRole(role)}>
                          Edit Role
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteRole(role)}
                          className="text-destructive"
                        >
                          Delete Role
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Role Modal */}
      <RoleModal
        open={roleModalOpen}
        onOpenChange={setRoleModalOpen}
        role={selectedRole}
        onSuccess={handleRoleSuccess}
      />
    </div>
  );
}