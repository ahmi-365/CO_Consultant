import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, UserPlus, Loader2 } from "lucide-react";
import { userApi, getUserInitials } from "@/services/UserService";
import { useToast } from "@/hooks/use-toast";
import { permissionsApi } from "@/services/FilePermission";

export default function UserSearchDialog({ 
  isOpen, 
  onClose, 
  onAddUser, 
  permissionOptions,
  isLoading = false 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [availablePermissions, setAvailablePermissions] = useState([]);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const res = await permissionsApi.getAllPermissions();
        console.log("Fetched all permissions data:", res);

        // Extract permissions array
        if (res && Array.isArray(res)) {
          setAvailablePermissions(res);
        } else if (res && Array.isArray(res.permissions)) {
          setAvailablePermissions(res.permissions);
        } else {
          setAvailablePermissions([]);
        }
      } catch (error) {
        console.error("Error fetching permissions:", error);
      }
    };

    fetchPermissions();
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await userApi.getAllUsers();
      const userList = Array.isArray(data) ? data : data.data || [];
      setUsers(userList);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast({
        title: "Error",
        description: "Failed to load users. Please check your authentication.",
        variant: "destructive",
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const handlePermissionToggle = (permissionValue) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionValue)) {
        return prev.filter(p => p !== permissionValue);
      } else {
        return [...prev, permissionValue];
      }
    });
  };

  const handleAddUser = async () => {
    if (!selectedUser || selectedPermissions.length === 0) {
      toast({
        title: "Error",
        description: "Please select a user and at least one permission",
        variant: "destructive",
      });
      return;
    }

    try {
      // Pass userId and the full permissions array to parent
      await onAddUser(selectedUser.id, selectedPermissions);
      handleClose();
    } catch (error) {
      // Error handling is done in parent component
      console.error('Error in handleAddUser:', error);
    }
  };

  const handleClose = () => {
    if (isLoading) return; // Prevent closing while loading
    
    setSearchTerm("");
    setSelectedUser(null);
    setSelectedPermissions([]);
    setFilteredUsers([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add User Access
          </DialogTitle>
          <DialogDescription>
            Search and select a user, then choose their permissions
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>

          {/* Users List */}
          <div className="flex-1 overflow-y-auto">
            <Label className="text-sm font-medium mb-2 block">Select User</Label>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? "No users found matching your search" : "No users available"}
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedUser?.id === user.id
                        ? 'bg-primary/10 border-primary'
                        : 'bg-card hover:bg-muted/50'
                    } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                    onClick={() => !isLoading && handleUserSelect(user)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-sm">
                        {getUserInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                      {user.role && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {user.role}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Permissions */}
          {selectedUser && (
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Select Permissions for {selectedUser.name}
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2 border rounded-md bg-card">
                {availablePermissions.map((permission) => (
                  <div
                    key={permission}
                    className={`flex items-center space-x-2 p-2 rounded-md border bg-background transition-all ${
                      isLoading ? 'opacity-50 pointer-events-none' : 'hover:bg-muted/50'
                    }`}
                  >
                    <Checkbox
                      id={permission}
                      checked={selectedPermissions.includes(permission)}
                      onCheckedChange={() => !isLoading && handlePermissionToggle(permission)}
                      disabled={isLoading}
                    />
                    <Label
                      htmlFor={permission}
                      className="text-xs font-medium cursor-pointer leading-none flex-1"
                    >
                      {permission}
                    </Label>
                  </div>
                ))}
              </div>
              
              {selectedPermissions.length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {selectedPermissions.length} permission{selectedPermissions.length !== 1 ? 's' : ''} selected
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddUser}
            disabled={!selectedUser || selectedPermissions.length === 0 || isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Access
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}