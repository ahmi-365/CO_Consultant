import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, UserPlus, Check } from "lucide-react";



// Mock users - replace with actual user API
const mockUsers = [
  { id: 1, name: "Alice Johnson", email: "alice.johnson@example.com", role: "Manager" },
  { id: 2, name: "Bob Smith", email: "bob.smith@example.com", role: "Developer" },
  { id: 3, name: "Carol Davis", email: "carol.davis@example.com", role: "Designer" },
  { id: 4, name: "David Wilson", email: "david.wilson@example.com", role: "Analyst" },
  { id: 5, name: "Emma Brown", email: "emma.brown@example.com", role: "Tester" },
  { id: 6, name: "Frank Miller", email: "frank.miller@example.com", role: "Admin" },
];

const permissionOptions = [
  { value: 'read', label: 'View Only', description: 'Can view and download', color: 'bg-secondary' },
  { value: 'create_folder', label: 'Create Folders', description: 'Can create new folders', color: 'bg-primary/20 text-primary' },
  { value: 'edit', label: 'Edit', description: 'Can modify files and folders', color: 'bg-warning/20 text-warning' },
  { value: 'upload', label: 'Upload', description: 'Can upload new files', color: 'bg-success/20 text-success' },
  { value: 'delete', label: 'Delete', description: 'Can remove files and folders', color: 'bg-destructive/20 text-destructive' },
  { value: 'manage', label: 'Full Control', description: 'Can manage all permissions', color: 'bg-accent/20 text-accent' },
];

export default function UserSearchDialog({ isOpen, onClose, onAddUser }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState(['read']);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setSelectedUser(null);
      setSelectedPermissions(['read']);
    }
  }, [isOpen]);

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePermissionToggle = (permission ) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permission)) {
        return prev.filter(p => p !== permission);
      } else {
        return [...prev, permission];
      }
    });
  };

  const handleAddUser = () => {
    if (selectedUser && selectedPermissions.length > 0) {
      onAddUser(selectedUser.id, selectedPermissions);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add User Access
          </DialogTitle>
          <DialogDescription>
            Search for users and assign permissions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Search */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Search Users</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search by name or email..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* User Results */}
            {searchTerm && (
              <div className="max-h-48 overflow-y-auto border rounded-lg">
                {filteredUsers.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No users found matching "{searchTerm}"
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-smooth hover:bg-accent/50 ${
                          selectedUser?.id === user.id ? 'bg-accent text-accent-foreground' : ''
                        }`}
                        onClick={() => setSelectedUser(user)}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{user.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                        </div>
                        {user.role && (
                          <Badge variant="outline" className="text-xs">
                            {user.role}
                          </Badge>
                        )}
                        {selectedUser?.id === user.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected User */}
          {selectedUser && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Selected User</label>
              <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg border">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {selectedUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">{selectedUser.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
                </div>
                {selectedUser.role && (
                  <Badge variant="secondary">{selectedUser.role}</Badge>
                )}
              </div>
            </div>
          )}

          {/* Permission Selection */}
          {selectedUser && (
            <div className="space-y-3">
              <label className="text-sm font-medium">
                Permissions ({selectedPermissions.length} selected)
              </label>
              <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto">
                {permissionOptions.map((option) => (
                  <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-smooth">
                    <Checkbox
                      id={option.value}
                      checked={selectedPermissions.includes(option.value)}
                      onCheckedChange={() => handlePermissionToggle(option.value)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor={option.value}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {option.label}
                        </label>
                        <Badge variant="secondary" className={`text-xs ${option.color}`}>
                          {option.value}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddUser}
              disabled={!selectedUser || selectedPermissions.length === 0}
              className="bg-gradient-primary"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add User Access
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}