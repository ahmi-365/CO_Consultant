import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, UserPlus, X } from "lucide-react";
import {   permissionsApi } from "@/services/FileService";
import { useToast } from "@/hooks/use-toast";



const permissionOptions = [
  { value: 'read', label: 'View Only', description: 'Can view and download' },
  { value: 'create_folder', label: 'Create Folders', description: 'Can create new folders' },
  { value: 'edit', label: 'Edit', description: 'Can modify files and folders' },
  { value: 'upload', label: 'Upload', description: 'Can upload new files' },
  { value: 'delete', label: 'Delete', description: 'Can remove files and folders' },
  { value: 'manage', label: 'Full Control', description: 'Can manage all permissions' },
];

// Mock users - replace with actual user API
const mockUsers= [
  { id: 1, name: "Alice Johnson", email: "alice.johnson@example.com" },
  { id: 2, name: "Bob Smith", email: "bob.smith@example.com" },
  { id: 3, name: "Carol Davis", email: "carol.davis@example.com" },
  { id: 4, name: "David Wilson", email: "david.wilson@example.com" },
];

export default function UserPermissions({ selectedItem, onPermissionChange }) {
  const [permissions, setPermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedPermission, setSelectedPermission] = useState("read");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load permissions when selected item changes
  useEffect(() => {
    if (selectedItem) {
      loadPermissions();
    }
  }, [selectedItem]);

  const loadPermissions = async () => {
    if (!selectedItem) return;
    
    setLoading(true);
    try {
      const data = await permissionsApi.getFilePermissions(selectedItem.id);
      setPermissions(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load permissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPermission = async () => {
    if (!selectedItem || !selectedUser || !selectedPermission) return;

    try {
      await permissionsApi.assignPermission(
        selectedItem.id, 
        parseInt(selectedUser), 
        selectedPermission
      );
      
      toast({
        title: "Success",
        description: "Permission added successfully",
      });
      
      setSelectedUser("");
      setSelectedPermission("read");
      loadPermissions();
      onPermissionChange?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add permission",
        variant: "destructive",
      });
    }
  };

  const handleRemovePermission = async (userId, permission) => {
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

  const getPermissionColor = (permission) => {
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            User Permissions
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          User Permissions
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Managing access for: <span className="font-medium">{selectedItem.name}</span>
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add User Permission */}
        <div className="space-y-4 p-4 bg-gradient-subtle rounded-lg border">
          <h4 className="font-medium text-sm">Add User Access</h4>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Select User</label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a user" />
                </SelectTrigger>
                <SelectContent>
                  {filteredUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Permission Level</label>
              <Select value={selectedPermission} onValueChange={setSelectedPermission}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {permissionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleAddPermission} 
              className="w-full"
              disabled={!selectedUser || !selectedPermission}
              variant="upload"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Permission
            </Button>
          </div>
        </div>

        {/* Current Permissions */}
     

        {/* Search Users */}
        <div>
          <label className="text-xs font-medium text-muted-foreground">Search Users</label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search by name or email" 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}