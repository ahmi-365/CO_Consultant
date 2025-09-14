import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, X, Users } from "lucide-react";
import { permissionsApi } from "@/services/FileService";
import { useToast } from "@/hooks/use-toast";
import FolderUsersDialog from "./FolderUsersDialog";
import UserSearchDialog from "./UserSearchDialog";



const permissionOptions = [
  { value: 'read', label: 'View Only', description: 'Can view and download' },
  { value: 'create_folder', label: 'Create Folders', description: 'Can create new folders' },
  { value: 'edit', label: 'Edit', description: 'Can modify files and folders' },
  { value: 'upload', label: 'Upload', description: 'Can upload new files' },
  { value: 'delete', label: 'Delete', description: 'Can remove files and folders' },
  { value: 'manage', label: 'Full Control', description: 'Can manage all permissions' },
];

// Mock users - replace with actual user API
const mockUsers = [
  { id: 1, name: "Alice Johnson", email: "alice.johnson@example.com" },
  { id: 2, name: "Bob Smith", email: "bob.smith@example.com" },
  { id: 3, name: "Carol Davis", email: "carol.davis@example.com" },
  { id: 4, name: "David Wilson", email: "david.wilson@example.com" },
];



export default function UserPermissions({ selectedItem, onPermissionChange, openUsersDialog, onOpenUsersDialogChange }) {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUsersDialog, setShowUsersDialog] = useState(false);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const { toast } = useToast();


  useEffect(() => {
    if (selectedItem) {
      loadPermissions();
    }
  }, [selectedItem]);

  // Sync dialog open state with external control (from FileManagement)
  useEffect(() => {
    if (typeof openUsersDialog === 'boolean') {
      setShowUsersDialog(openUsersDialog);
    }
  }, [openUsersDialog]);

  const loadPermissions = async () => {
    if (!selectedItem) return;
    
    setLoading(true);
    try {
      const data = await permissionsApi.getFilePermissions(selectedItem.id);
      setPermissions(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load permissions (showing mock data while API returns 401)",
        variant: "destructive",
      });
      // Fallback mock data for testing only (API remains wired)
      setPermissions([
        {
          id: 1,
          user_id: 1,
          user_name: "Demo User",
          permission: "read",
          granted_at: new Date().toISOString(),
          granted_by: "System"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUserAccess = async (userId , permissions ) => {
    if (!selectedItem) return;

    try {
      // Add multiple permissions for the user
      for (const permission of permissions) {
        await permissionsApi.assignPermission(selectedItem.id, userId, permission);
      }
      
      toast({
        title: "Success",
        description: `User access added with ${permissions.length} permission(s)`,
      });
      
      loadPermissions();
      onPermissionChange?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add user access",
        variant: "destructive",
      });
    }
  };

  const handleRemovePermission = async (userId, permission ) => {
    if (!selectedItem) return;

    try {
      await permissionsApi.removePermission(selectedItem.id, userId, permission);
      
      toast({
        title: "Success",
        description: "Permission removed successfully",
      });
      
      loadPermissions();
      onPermissionChange?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove permission",
        variant: "destructive",
      });
    }
  };

  const getPermissionColor = (permission ) => {
    switch (permission) {
      case 'read': return 'bg-secondary text-secondary-foreground';
      case 'create_folder': return 'bg-primary-light text-primary';
      case 'edit': return 'bg-warning-light text-warning';
      case 'upload': return 'bg-success-light text-success';
      case 'delete': return 'bg-destructive-light text-destructive';
      case 'manage': return 'bg-accent-light text-accent';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (!selectedItem) {
    return (
      <Card className="shadow-card">
        <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            User Permissions
          </div>
          {selectedItem?.type === 'folder' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setShowUsersDialog(true); onOpenUsersDialogChange?.(true); }}
              className="text-primary hover:text-primary/80"
            >
              <Users className="h-4 w-4 mr-2" />
              View All Users
            </Button>
          )}
        </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <p>Select a file or folder to manage permissions</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            User Permissions
          </div>
          {selectedItem?.type === 'folder' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUsersDialog(true)}
              className="text-primary hover:text-primary/80"
            >
              <Users className="h-4 w-4 mr-2" />
              View All Users
            </Button>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Managing access for: <span className="font-medium">{selectedItem.name}</span>
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add User Permission */}
        <div className="space-y-4 p-4 bg-gradient-subtle rounded-lg border">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Quick Actions</h4>
          </div>
          
          <Button 
            onClick={() => setShowAddUserDialog(true)}
            className="w-full bg-gradient-primary hover:bg-gradient-primary/90"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add User Access
          </Button>
        </div>

        {/* Current Permissions */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Current Permissions</h4>
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">Loading permissions...</div>
          ) : permissions.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No permissions assigned</div>
          ) : (
            <div className="space-y-2">
              {permissions.map((permission) => (
                <div key={permission.id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {permission.user_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{permission.user_name}</div>
                      <Badge variant="secondary" className={getPermissionColor(permission.permission)}>
                        {permissionOptions.find(p => p.value === permission.permission)?.label || permission.permission}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePermission(permission.user_id, permission.permission)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

      </CardContent>

      {/* Dialogs */}
      <FolderUsersDialog
        isOpen={showUsersDialog}
        onClose={() => setShowUsersDialog(false)}
        selectedItem={selectedItem}
      />

      <UserSearchDialog
        isOpen={showAddUserDialog}
        onClose={() => setShowAddUserDialog(false)}
        onAddUser={handleAddUserAccess}
      />
    </Card>
  );
}