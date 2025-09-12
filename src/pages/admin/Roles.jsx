import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, MoreHorizontal } from "lucide-react";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { roleService } from "@/services/role-service";

// ✅ Default Permissions
const defaultPermissions = [
  { id: "users.list", label: "Users List", enabled: false },
  { id: "users.create", label: "View Users", enabled: false },
  { id: "users.update", label: "Create Users", enabled: false },
  { id: "users.delete", label: "Update Users", enabled: false },
  { id: "files.manage", label: "Delete Users", enabled: false },
  { id: "roles.list", label: "List File", enabled: false },
  { id: "roles.create", label: "Upload Files", enabled: false },
  { id: "roles.update", label: "Update Files", enabled: false },
  { id: "roles.delete", label: "Delete Files", enabled: false },
  { id: "settings.update", label: "Manage Roles", enabled: false },
  { id: "dashboard.access", label: "Manage Permissions", enabled: false },
];

// ✅ Modal for viewing permissions
function RolePermissionsModal({ role }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="text-xs">
        View Permissions
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Permissions for {role.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-wrap gap-2 mt-4">
            {role.permissions && role.permissions.length > 0 ? (
              role.permissions.map((p) => (
                <Badge key={p.id || p} variant="destructive" className="px-3 py-1 text-xs">
                  {typeof p === "string" ? p : p.name || p.id}
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

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create new role states
  const [roleName, setRoleName] = useState("");
  const [rolePermissions, setRolePermissions] = useState(defaultPermissions);
  const [submitting, setSubmitting] = useState(false);

  // Edit role states
  const [editOpen, setEditOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  // Fetch roles
  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      try {
        const res = await roleService.getAll();
        if (res?.success && Array.isArray(res.data?.data)) setRoles(res.data.data);
        else if (res?.status === "success" && Array.isArray(res.data)) setRoles(res.data);
        else if (Array.isArray(res)) setRoles(res);
        else setRoles([]);
      } catch (error) {
        console.error(error);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  // Toggle permission for Create Role
  const togglePermission = (id) => {
    setRolePermissions((prev) =>
      prev.map((perm) => (perm.id === id ? { ...perm, enabled: !perm.enabled } : perm))
    );
  };

  // Create Role
  const handleCreateRole = async () => {
    if (!roleName.trim()) return alert("Role name is required");
    setSubmitting(true);

    const payload = {
      name: roleName,
      permissions: rolePermissions.filter((p) => p.enabled).map((p) => p.id),
    };

    try {
      const res = await roleService.create(payload);
      if (res?.status === "success" || res?.success) {
        alert("✅ Role created successfully");
        const newRolesRes = await roleService.getAll();
        if (newRolesRes?.success && Array.isArray(newRolesRes.data?.data)) setRoles(newRolesRes.data.data);
        else if (newRolesRes?.status === "success" && Array.isArray(newRolesRes.data)) setRoles(newRolesRes.data);
        else if (Array.isArray(newRolesRes)) setRoles(newRolesRes);

        setRoleName("");
        setRolePermissions(defaultPermissions.map((p) => ({ ...p, enabled: false })));
      } else {
        alert(`❌ ${res.message || "Something went wrong"}`);
      }
    } catch (error) {
      console.error(error);
      alert("❌ Failed to create role");
    } finally {
      setSubmitting(false);
    }
  };

  // Open edit drawer
  const handleEditRole = (role) => {
    // Map default permissions and check if each permission exists in role.permissions
    const rolePermIds = role.permissions?.map((p) => (typeof p === "string" ? p : p.id)) || [];
    setEditingRole({
      ...role,
      permissions: defaultPermissions.map((p) => ({
        ...p,
        enabled: rolePermIds.includes(p.id),
      })),
    });
    setEditOpen(true);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Role Management</h1>
        <p className="text-muted-foreground mt-1">Manage user roles and permissions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Existing Roles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Existing Roles</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading roles...</p>
            ) : roles.length === 0 ? (
              <p className="text-sm text-muted-foreground">No roles found. Create one below.</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wider pb-2 border-b">
                  <div>Role Name</div>
                  <div>Permissions</div>
                  <div className="text-right">Actions</div>
                </div>

                {roles.map((role) => (
                  <div
                    key={role.id || role._id}
                    className="grid grid-cols-3 gap-4 items-center py-4 border-b border-border last:border-0 hover:bg-gray-200 rounded-lg px-2"
                  >
                    <div className="font-medium text-sm">{role.name}</div>
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
                          <DropdownMenuItem onClick={() => handleEditRole(role)}>Edit Role</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Role */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="roleName">Role Name</Label>
              <Input
                id="roleName"
                placeholder="e.g., Project Manager"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
              />
            </div>

            {/* Permissions */}
            <div>
              <Label className="text-base font-semibold">Permissions</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {rolePermissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg bg-card hover:shadow-sm transition"
                  >
                    <span className="font-medium text-sm">{permission.label}</span>
                    <Switch
                      checked={permission.enabled}
                      onCheckedChange={() => togglePermission(permission.id)}
                      className="h-5 w-10"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Button className="w-full" size="lg" disabled={submitting} onClick={handleCreateRole}>
              {submitting ? "Creating..." : "Create Role"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Edit Drawer */}
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[500px] flex flex-col h-full">
          <SheetHeader>
            <SheetTitle>Edit Role</SheetTitle>
          </SheetHeader>

          {editingRole && (
            <div className="flex-1 overflow-y-auto mt-4 space-y-4 px-2">
              {/* Role Name */}
              <div>
                <Label>Role Name</Label>
                <Input
                  value={editingRole.name}
                  onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                />
              </div>

              {/* Permissions */}
              <div>
                <Label className="text-base font-semibold">Permissions</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {editingRole.permissions?.map((permission, index) => (
                    <div
                      key={permission.id || index}
                      className="flex items-center justify-between p-2 border border-border rounded-lg bg-card hover:shadow-sm transition"
                    >
                      <span className="font-medium text-sm">
                        {permission.label || permission.name || permission.id}
                      </span>
                      <Switch
                        checked={permission.enabled ?? false}
                        onCheckedChange={(val) => {
                          const updatedPermissions = editingRole.permissions.map((p) =>
                            p.id === permission.id ? { ...p, enabled: val } : p
                          );
                          setEditingRole({ ...editingRole, permissions: updatedPermissions });
                        }}
                        className="h-5 w-10"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Save Changes */}
          <div className="p-4 border-t border-border bg-card sticky bottom-0">
            <Button
              className="w-full"
              onClick={async () => {
                try {
                  const payload = {
                    name: editingRole.name,
                    permissions: editingRole.permissions
                      .filter((p) => p.enabled)
                      .map((p) => p.id),
                  };
                  const res = await roleService.update(editingRole.id, payload);

                  if (res?.success || res?.status === "success") {
                    alert("✅ Role updated successfully");
                    const newRolesRes = await roleService.getAll();
                    if (newRolesRes?.success && Array.isArray(newRolesRes.data?.data))
                      setRoles(newRolesRes.data.data);
                    else if (newRolesRes?.status === "success" && Array.isArray(newRolesRes.data))
                      setRoles(newRolesRes.data);
                    else if (Array.isArray(newRolesRes)) setRoles(newRolesRes);

                    setEditOpen(false);
                  } else {
                    alert("❌ Failed to update role");
                  }
                } catch (err) {
                  console.error(err);
                  alert("❌ Error updating role");
                }
              }}
            >
              Save Changes
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
