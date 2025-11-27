import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, MoreHorizontal, Loader2, X } from "lucide-react";
import { Trash2, Edit } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

// Helper function to check if role is admin
const isAdminRole = (role) => {
  return role.is_admin === true || role.is_admin === 1 || role.is_admin === "1";
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
          is_admin: isAdminRole(role)
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

 const [errorDialogOpen, setErrorDialogOpen] = useState(false);
const [errorDialogMessage, setErrorDialogMessage] = useState("");

const handleSubmit = async () => {
  if (!formData.name.trim()) {
    setErrorDialogMessage("Role name is required.");
    setErrorDialogOpen(true);
    return;
  }

  setSubmitting(true);
  try {
    const payload = {
      name: formData.name,
      permissions: formData.permissions,
      is_admin: formData.is_admin,
    };

    let res;
    if (isEdit) {
      res = await roleService.update(role.id, payload);
    } else {
      res = await roleService.create(payload);
    }

    // ✅ Check for duplicate or invalid data
    if (
      res?.message?.toLowerCase().includes("already exists") ||
      res?.errors?.name?.[0]?.toLowerCase().includes("already been taken") ||
      res?.message?.toLowerCase().includes("the given data was invalid")
    ) {
      setErrorDialogMessage("⚠️ Role with the same name already exists. Please choose a different name.");
      setErrorDialogOpen(true);
      return;
    }

    if (res.success) {
      toast({
        title: "Success",
        description: `Role ${isEdit ? "updated" : "created"} successfully`,
      });
      onSuccess();
      onOpenChange(false);
    } else {
      setErrorDialogMessage(res.message || "Something went wrong while saving the role.");
      setErrorDialogOpen(true);
    }
  } catch (error) {
    const errorMessage =
      error?.response?.data?.errors?.name?.[0] ||
      error?.response?.data?.message ||
      error?.message;

    if (errorMessage?.toLowerCase().includes("already")) {
      setErrorDialogMessage("⚠️ Role with the same name already exists. Please choose a different name.");
    } else {
      setErrorDialogMessage(
        `Failed to ${isEdit ? "update" : "create"} role: ${errorMessage || "Unknown error"}`
      );
    }
    setErrorDialogOpen(true);
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
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        // ⬇ This prevents the default "X" from appearing
        closeable={false}
      >
        {/* Custom Header with Single X */}
        <div className="flex items-center justify-between mb-6">
          <DialogTitle className="text-xl font-semibold">
            {isEdit ? `Edit Role: ${role?.name}` : "Create New Role"}
          </DialogTitle>
         
        </div>

        <div className="space-y-6">
          {/* Role Name */}
          <div>
            <Label htmlFor="roleName">Role Name</Label>
            <Input
              id="roleName"
              placeholder="e.g., Project Manager"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              disabled={submitting}
            />
          </div>

          {/* Admin Switch */}
          <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/30">
            <div>
              <Label className="text-base font-semibold">Admin Role</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Grant administrative privileges to this role
              </p>
            </div>
            <Switch
              checked={formData.is_admin}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, is_admin: checked }))
              }
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
              <div className="text-center py-8 text-sm text-muted-foreground">
                No permissions available.
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                {Object.keys(groupedPermissions).length > 0 ? (
                  Object.entries(groupedPermissions).map(([category, perms]) => (
                    <div
                      key={category}
                      className="border border-border rounded-lg p-4"
                    >
                      <h4 className="font-semibold text-sm mb-3 text-primary">
                        {formatCategoryName(category)}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {perms.map((perm) => {
                          const name = safeRenderPermissionText(perm);
                          const key = perm.id || perm.name;

                          return (
                            <div
                              key={key}
                              className="flex items-center justify-between p-3 border border-border rounded-lg bg-card hover:shadow-sm transition"
                            >
                              <span className="font-medium text-sm">{name}</span>
                              <Switch
                                checked={formData.permissions.includes(name)}
                                onCheckedChange={() =>
                                  handlePermissionToggle(name)
                                }
                                disabled={submitting}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availablePermissions.map((perm) => {
                      const name = safeRenderPermissionText(perm);
                      const key = perm.id || perm.name;

                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between p-3 border border-border rounded-lg bg-card hover:shadow-sm transition"
                        >
                          <span className="font-medium text-sm">{name}</span>
                          <Switch
                            checked={formData.permissions.includes(name)}
                            onCheckedChange={() =>
                              handlePermissionToggle(name)
                            }
                            disabled={submitting}
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
              <Label className="text-sm font-semibold">
                Selected Permissions ({formData.permissions.length})
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.permissions.map((perm, i) => (
                  <Badge
                    key={`selected-${perm}-${i}`}
                    variant="secondary"
                    className="text-xs"
                  >
                    {perm}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
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
                  {isEdit ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{isEdit ? "Update Role" : "Create Role"}</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
      <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
  <AlertDialogContent className="max-w-md text-center">
    <AlertDialogHeader>
      <AlertDialogTitle className="text-xl font-semibold text-destructive">
        Error
      </AlertDialogTitle>
      <AlertDialogDescription className="text-base mt-2">
        {errorDialogMessage}
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter className="flex justify-center mt-4">
      <AlertDialogAction onClick={() => setErrorDialogOpen(false)}>
        OK
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

    </Dialog>
  );
}

export default function Roles() {
  const { toast } = useToast();
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  /* ------------------------------------------------- */
  /*  FETCH & FILTER LOGIC                             */
  /* ------------------------------------------------- */
  useEffect(() => { fetchRoles(); }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRoles(roles);
      return;
    }
    const q = searchQuery.toLowerCase().trim();
    const filtered = roles.filter(r => {
      const name = r.name?.toLowerCase() ?? "";
      const perms = extractPermissionNames(r.permissions ?? []);
      const permMatch = perms.some(p => p.toLowerCase().includes(q));
      return name.includes(q) || permMatch;
    });
    setFilteredRoles(filtered);
  }, [roles, searchQuery]);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await roleService.getAll();
      let data = [];
      if (Array.isArray(res?.data)) data = res.data;
      else if (Array.isArray(res?.data?.data)) data = res.data.data;

      setRoles(data);
      setFilteredRoles(data);
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Failed to Load Roles",
        description: "Please try again later.",
      });
      setRoles([]); setFilteredRoles([]);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------- */
  /*  HANDLERS                                         */
  /* ------------------------------------------------- */
  const handleAddRole = () => {
    setSelectedRole(null);
    setRoleModalOpen(true);
  };

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setRoleModalOpen(true);
  };

  const openDeleteDialog = (role) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!roleToDelete) return;

    try {
      const res = await roleService.delete(roleToDelete.id);
      if (res.success) {
        toast({
          title: "Role Deleted",
          description: `"${roleToDelete.name}" has been permanently removed.`,
        });
        fetchRoles();
      } else {
        toast({
          variant: "destructive",
          title: "Cannot Delete Role",
          description: res.message || "This role may have assigned users.",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
    }
  };

  const handleRoleSuccess = () => {
    fetchRoles();
    // Success toast is shown inside RoleModal (create/update)
  };

  /* ------------------------------------------------- */
  /*  RENDER                                           */
  /* ------------------------------------------------- */
  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Role Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Manage user roles and permissions</p>
        </div>
        <Button onClick={handleAddRole} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Role
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <CardTitle>Existing Roles</CardTitle>
            <Badge variant="outline">
              {filteredRoles.length} {filteredRoles.length === 1 ? "role" : "roles"}
            </Badge>
          </div>

          <div className="w-full sm:w-80">
            <Input
              placeholder="Search roles or permissions..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="text-center py-6">
              {searchQuery ? (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    No roles match "<strong>{searchQuery}</strong>"
                  </p>
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-4">No roles found. Create your first role.</p>
                  <Button variant="outline" onClick={handleAddRole} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Create First Role
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wider pb-2 border-b">
                <div className="col-span-4">Role Name</div>
                <div className="col-span-4">Permissions</div>
                <div className="col-span-4 text-right">Actions</div>
              </div>

              {filteredRoles.map(role => (
                <div
                  key={role.id || role._id}
                  className="flex flex-col md:grid md:grid-cols-12 gap-4 items-start md:items-center py-4 border-b border-border last:border-0 hover:bg-muted/50 rounded-lg px-2 transition-colors"
                >
                  {/* Role Name - FIXED ADMIN BADGE */}
                  <div className="md:col-span-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{role.name}</span>
                      {isAdminRole(role) && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.746 2.379l-4.114 3.525 1.256 5.272c.237.995-.39 1.844-1.256 1.844-.249 0-.498-.045-.736-.128l-4.225-2.427-4.225 2.427c-.238.083-.487.128-.736.128-1.07 0-1.587-1.164-1.256-1.844l1.256-5.272-4.113-3.526c-.89-.834-.418-2.286.746-2.379l5.404-.432 2.082-5.007z" clipRule="evenodd" />
                          </svg>
                          ADMIN
                        </Badge>
                      )}
                    </div>
                    {role.created_at && (
                      <div className="text-xs text-muted-foreground">
                        Created: {new Date(role.created_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Permissions */}
                  <div className="md:col-span-4 mt-2 md:mt-0">
                    <RolePermissionsModal role={role} />
                  </div>

                  {/* Edit & Delete Buttons */}
                  <div className="md:col-span-4 flex gap-2 justify-start md:justify-end mt-2 md:mt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditRole(role)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Edit
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => openDeleteDialog(role)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Create/Edit Modal */}
      <RoleModal
        open={roleModalOpen}
        onOpenChange={setRoleModalOpen}
        role={selectedRole}
        onSuccess={handleRoleSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role <strong>"{roleToDelete?.name}"</strong>?
              <br />
              <span className="text-destructive">This action cannot be undone.</span>
              {roleToDelete?.user_count > 0 && (
                <p className="mt-2 text-sm text-orange-600">
                  Warning: {roleToDelete.user_count} user(s) are assigned to this role.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}