import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";

const existingRoles = [
  {
    name: "Editor",
    description: "Can create, edit, and delete files.",
    permissions: "Full Access",
    users: 15,
    color: "bg-blue-500"
  },
  {
    name: "Viewer",
    description: "Can only view files and folders.",
    permissions: "View Only",
    users: 20,
    color: "bg-green-500"
  },
  {
    name: "Uploader",
    description: "Can upload files but not view or edit.",
    permissions: "Upload Only",
    users: 10,
    color: "bg-yellow-500"
  }
];

const permissions = [
  { id: "create", label: "Create Files", enabled: false },
  { id: "edit", label: "Edit Files", enabled: false },
  { id: "delete", label: "Delete Files", enabled: false },
  { id: "view", label: "View Folders", enabled: true },
  { id: "manage", label: "Manage Users", enabled: false },
];

export default function Roles() {
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [rolePermissions, setRolePermissions] = useState(permissions);

  const togglePermission = (id) => {
    setRolePermissions(prev => 
      prev.map(perm => 
        perm.id === id ? { ...perm, enabled: !perm.enabled } : perm
      )
    );
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Role Management</h1>
        <p className="text-muted-foreground mt-1">Manage user roles and permissions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Existing Roles</CardTitle>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add New Role
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wider pb-2 border-b">
                <div>Role Name</div>
                <div>Description</div>
                <div>Permissions</div>
                <div>Users</div>
              </div>
              {existingRoles.map((role, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 items-center py-4 border-b border-border last:border-0 hover:bg-accent/50 rounded-lg px-2">
                  <div className="font-medium text-sm">{role.name}</div>
                  <div className="text-sm text-muted-foreground">{role.description}</div>
                  <div>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs text-white ${role.color}`}
                    >
                      {role.permissions}
                    </Badge>
                  </div>
                  <div className="text-sm font-medium">{role.users}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
            
            <div>
              <Label htmlFor="roleDescription">Description</Label>
              <Textarea 
                id="roleDescription"
                placeholder="Describe the role and its responsibilities"
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label className="text-base font-semibold">Permissions</Label>
              <div className="space-y-4 mt-4">
                {rolePermissions.map((permission) => (
                  <div key={permission.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{permission.label}</div>
                    </div>
                    <Switch 
                      checked={permission.enabled}
                      onCheckedChange={() => togglePermission(permission.id)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <Button className="w-full" size="lg">
              Create Role
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}