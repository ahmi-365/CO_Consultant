import { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Users, Crown, Shield, Eye } from "lucide-react";
import { permissionsApi } from "@/services/FileService";
import { useToast } from "@/hooks/use-toast";


const permissionConfig = {
  read: { label: 'Viewer', icon: Eye, color: 'bg-secondary text-secondary-foreground' },
  create_folder: { label: 'Creator', icon: Users, color: 'bg-primary/20 text-primary' },
  edit: { label: 'Editor', icon: Shield, color: 'bg-warning/20 text-warning' },
  upload: { label: 'Uploader', icon: Users, color: 'bg-success/20 text-success' },
  delete: { label: 'Moderator', icon: Shield, color: 'bg-destructive/20 text-destructive' },
  manage: { label: 'Admin', icon: Crown, color: 'bg-accent/20 text-accent' },
};

export default function FolderUsersDialog({ isOpen, onClose, selectedItem }) {
  const [permissions, setPermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && selectedItem) {
      loadFolderUsers();
    }
  }, [isOpen, selectedItem]);

  const loadFolderUsers = async () => {
    if (!selectedItem) return;
    
    setLoading(true);
    try {
      const data = await permissionsApi.getFilePermissions(selectedItem.id);
      setPermissions(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load folder users",
        variant: "destructive",
      });
      // Fallback mock data
      setPermissions([
        {
          id: 1,
          user_id: 1,
          user_name: "Alice Johnson",
          permission: "manage",
          granted_at: new Date().toISOString(),
          granted_by: "System"
        },
        {
          id: 2,
          user_id: 2,
          user_name: "Bob Smith",
          permission: "edit",
          granted_at: new Date().toISOString(),
          granted_by: "Admin"
        },
        {
          id: 3,
          user_id: 3,
          user_name: "Carol Davis",
          permission: "read",
          granted_at: new Date().toISOString(),
          granted_by: "Admin"
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPermissions = permissions.filter(permission =>
    permission.user_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
    const existingUser = acc.find(item => item.user_id === permission.user_id);
    if (existingUser) {
      existingUser.permissions.push(permission.permission);
    } else {
      acc.push({
        user_id: permission.user_id,
        user_name: permission.user_name,
        permissions: [permission.permission],
        granted_at: permission.granted_at,
        granted_by: permission.granted_by
      });
    }
    return acc;
  }, [] );

  const getHighestPermission = (permissions) => {
    const hierarchy = ['read', 'create_folder', 'upload', 'edit', 'delete', 'manage'];
    for (let i = hierarchy.length - 1; i >= 0; i--) {
      if (permissions.includes(hierarchy[i])) {
        return hierarchy[i];
      }
    }
    return 'read';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Folder Users
          </DialogTitle>
          <DialogDescription>
            Users with access to: <span className="font-medium">{selectedItem?.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search users..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Users List */}
          <div className="max-h-96 overflow-y-auto space-y-3">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading users...
              </div>
            ) : groupedPermissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? "No users found matching your search" : "No users have access to this folder"}
              </div>
            ) : (
              groupedPermissions.map((user) => {
                const highestPermission = getHighestPermission(user.permissions);
                const config = permissionConfig[highestPermission ];
                const Icon = config.icon;
                
                return (
                  <div key={user.user_id} className="flex items-center justify-between p-4 bg-card rounded-lg border hover:shadow-md transition-smooth">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="text-sm font-medium">
                          {user.user_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-foreground">{user.user_name}</div>
                        <div className="text-xs text-muted-foreground">
                          Added {new Date(user.granted_at).toLocaleDateString()} by {user.granted_by}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Primary permission badge */}
                      <Badge variant="secondary" className={`${config.color} flex items-center gap-1`}>
                        <Icon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                      
                      {/* Additional permissions count */}
                      {user.permissions.length > 1 && (
                        <Badge variant="outline" className="text-xs">
                          +{user.permissions.length - 1} more
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-lg font-semibold text-foreground">{groupedPermissions.length}</div>
              <div className="text-xs text-muted-foreground">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-foreground">
                {groupedPermissions.filter(u => getHighestPermission(u.permissions) === 'manage').length}
              </div>
              <div className="text-xs text-muted-foreground">Admins</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-foreground">
                {groupedPermissions.filter(u => getHighestPermission(u.permissions) === 'read').length}
              </div>
              <div className="text-xs text-muted-foreground">Viewers</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}