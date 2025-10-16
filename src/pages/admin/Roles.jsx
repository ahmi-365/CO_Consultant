import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, MoreHorizontal, Loader2, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

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

// Import your existing API service
import { roleService } from "../../services/role-service";

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

      return { success: true, data: result };
    } catch (err) {
      console.error("❌ Get permissions error:", err);
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

// Helper function to extract permission names (strings) from mixed data
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
  }).filter(name => name !== "Unknown Permission");
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
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    permissions: [],
    is_admin: false
  });
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!role;

  useEffect(() => {
    if (open) {
      fetchPermissions();
      if (isEdit) {
        const permissionNames = extractPermissionNames(role.permissions || []);
        
        setFormData({
          name: role.name,
          permissions: permissionNames,
          is_admin: role.is_admin === true || role.is_admin === 1 || false 
        });
      } else {
        setFormData({
          name: "",
          permissions: [],
          is_admin: false
        });
      }
    }
  }, [open, role, isEdit]);

  const fetchPermissions = async () => {
    setPermissionsLoading(true);
    try {
      const res = await permissionService.getAll();
      if (res.success) {
        let permissions = [];
        if (Array.isArray(res.data)) {
          permissions = res.data;
        } else if (res.data?.data && Array.isArray(res.data.data)) {
          permissions = res.data.data;
        }
        setAvailablePermissions(permissions);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: res.message || "Failed to fetch permissions",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch permissions",
      });
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
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Role name is required",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        permissions: formData.permissions, 
        is_admin: formData.is_admin
      };

      let res;
      if (isEdit) {
        res = await roleService.update(role.id, payload);
      } else {
        res = await roleService.create(payload);
      }

      if (res.success) {
        toast({
          title: "Success",
          description: `Role ${isEdit ? 'updated' : 'created'} successfully`,
        });
        onSuccess();
        onOpenChange(false);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: res.message || 'Something went wrong',
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${isEdit ? 'update' : 'create'} role`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const groupedPermissions = availablePermissions.reduce((acc, permission) => {
    const category = permission.category?.toLowerCase() || 'other';
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
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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

          <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/30">
            <div>
              <Label className="text-base font-semibold">Admin Role</Label>
              <p className="text-sm text-muted-foreground mt-1">Grant administrative privileges to this role</p>
            </div>
            <Switch
              checked={formData.is_admin}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_admin: checked }))}
              disabled={submitting}
              className="h-6 w-12"
            />
          </div>

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
                          const key = permission.id || permission.name; 
                          
                          return (
                            <div
                              key={key} 
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availablePermissions.map((permission) => {
                      const permissionName = safeRenderPermissionText(permission);
                      const key = permission.id || permission.name; 
                      
                      return (
                        <div
                          key={key} 
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
  const { toast } = useToast();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await roleService.getAll();
      if (res?.success) {
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
          toast({
            variant: "destructive",
            title: "Error",
            description: res.message,
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      setRoles([]);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch roles",
      });
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
          toast({
            title: "Success",
            description: "Role deleted successfully",
          });
          fetchRoles();
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: res.message || 'Failed to delete role',
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete role",
        });
      }
    }
  };

  const handleRoleSuccess = () => {
    fetchRoles();
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Role Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Manage user roles and permissions</p>
        </div>
        <Button onClick={handleAddRole} className="flex items-center gap-2 self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          Add Role
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Existing Roles</CardTitle>
          <Badge variant="outline">{roles.length} roles</Badge>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : roles.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-4">No roles found. Create your first role.</p>
              <Button onClick={handleAddRole} variant="outline" className="flex items-center gap-2 justify-center">
                <Plus className="h-4 w-4" />
                Create First Role
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="hidden md:grid grid-cols-4 gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wider pb-2 border-b">
                <div>Role Name</div>
                <div>Permissions</div>
                <div className="text-right">Actions</div>
              </div>

              {roles.map((role) => (
                <div
                  key={role.id || role._id} 
                  className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-4 gap-2 items-start sm:items-center py-4 border-b border-border last:border-0 hover:bg-muted/50 rounded-lg px-2 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{role.name}</span>
                      {(role.is_admin === true || role.is_admin === 1) && (
                        <span title="Admin Role" className="flex items-center gap-1 text-destructive/90">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.746 2.379l-4.114 3.525 1.256 5.272c.237.995-.39 1.844-1.256 1.844-.249 0-.498-.045-.736-.128l-4.225-2.427-4.225 2.427c-.238.083-.487.128-.736.128-1.07 0-1.587-1.164-1.256-1.844l1.256-5.272-4.113-3.526c-.89-.834-.418-2.286.746-2.379l5.404-.432 2.082-5.007z" clipRule="evenodd" />
                            </svg>
                          <span className="text-xs font-semibold">ADMIN</span>
                        </span>
                      )}
                    </div>
                    {role.created_at && (
                      <div className="text-xs text-muted-foreground">Created: {new Date(role.created_at).toLocaleDateString()}</div>
                    )}
                  </div>

                 

                  <div className="mt-2 sm:mt-0">
                    <RolePermissionsModal role={role} />
                  </div>

                  <div className="flex justify-start md:justify-end mt-2 sm:mt-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={`Actions for ${role.name}`}>
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditRole(role)}>Edit Role</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteRole(role)} className="text-destructive">
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

      <RoleModal
        open={roleModalOpen}
        onOpenChange={setRoleModalOpen}
        role={selectedRole}
        onSuccess={handleRoleSuccess}
      />
    </div>
  );
}