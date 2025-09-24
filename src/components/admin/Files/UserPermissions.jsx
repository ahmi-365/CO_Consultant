import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, UserPlus, X, Users, Info, Crown, Eye, Upload, Edit, Trash, FolderPlus, Loader2 } from "lucide-react";
import { permissionsApi } from "@/services/FileService";
import { useToast } from "@/hooks/use-toast";
import FolderUsersDialog from "./FolderUsersDialog";
import UserSearchDialog from "./UserSearchDialog";

// Define permission options based on your backend enums
const PERMISSION_OPTIONS = [
  {
    value: 'owner',
    label: 'Owner',
    description: 'Full control over the file/folder',
    icon: Crown,
    color: 'bg-red-100 text-red-800 border-red-200'
  },
  {
    value: 'view',
    label: 'View',
    description: 'Can view and download the file',
    icon: Eye,
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    value: 'upload',
    label: 'Upload',
    Description: 'Can upload files to the folder',
    icon: Upload,
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  {
    value: 'edit',
    label: 'Edit',
    description: 'Can modify the file content',
    icon: Edit,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  {
    value: 'delete',
    label: 'Delete',
    description: 'Can delete files and folders',
    icon: Trash,
    color: 'bg-red-100 text-red-800 border-red-200'
  },
  {
    value: 'create_folder',
    label: 'Create Folder',
    description: 'Can create new folders',
    icon: FolderPlus,
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  }
];

// Helper function to get permission details
const getPermissionDetails = (permissionValue) => {
  return PERMISSION_OPTIONS.find(p => p.value === permissionValue) || {
    value: permissionValue,
    label: permissionValue,
    description: 'Unknown permission',
    icon: Info,
    color: 'bg-gray-100 text-gray-800 border-gray-200'
  };
};

// Helper function to get permission color class
const getPermissionColor = (permissionValue) => {
  const permission = getPermissionDetails(permissionValue);
  return permission.color;
};

export default function UserPermissions({ selectedItem, onPermissionChange, openUsersDialog, onClose }) {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingUser, setAddingUser] = useState(false); // ye "Add User Access" button ke liye hai

  const [showUsersDialog, setShowUsersDialog] = useState(false);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [showUserDetailsDialog, setShowUserDetailsDialog] = useState(false);
  const { toast } = useToast();

  // Universal safe function to get user initials from any data structure
  const getSafeUserInitials = (userData) => {
    if (!userData) return 'U';

    try {
      // Try multiple possible name fields
      let name = null;
      if (typeof userData === 'string') {
        name = userData;
      } else if (userData && typeof userData === 'object') {
        // Try different possible name properties
        name = userData.user_name ||
          (userData.user && userData.user.name) ||
          userData.name ||
          null;
      }

      // If we have a valid name string, process it
      if (name && typeof name === 'string' && name.trim().length > 0) {
        const cleanName = name.trim();
        const nameParts = cleanName.includes(' ') ? cleanName.split(' ') : [cleanName];
        return nameParts
          .filter(part => part && part.length > 0)
          .map(part => part.charAt(0))
          .join('')
          .toUpperCase()
          .substring(0, 2); // Limit to 2 characters
      }

      // Fallback to email
      let email = null;
      if (userData && typeof userData === 'object') {
        email = userData.user_email ||
          (userData.user && userData.user.email) ||
          userData.email ||
          null;
      }

      if (email && typeof email === 'string' && email.trim().length > 0) {
        return email.charAt(0).toUpperCase();
      }

    } catch (error) {
      console.warn('Error generating user initials:', error);
    }

    return 'U';
  };

  // Safe function to get user name
  const getSafeUserName = (userData) => {
    if (!userData) return 'Unknown User';

    try {
      if (typeof userData === 'string') return userData;

      if (userData && typeof userData === 'object') {
        const name = userData.user_name ||
          (userData.user && userData.user.name) ||
          userData.name ||
          null;

        if (name && typeof name === 'string' && name.trim()) {
          return name.trim();
        }
      }
    } catch (error) {
      console.warn('Error getting user name:', error);
    }

    return 'Unknown User';
  };

  // Safe function to get user email
  const getSafeUserEmail = (userData) => {
    if (!userData) return 'No email';

    try {
      if (userData && typeof userData === 'object') {
        const email = userData.user_email ||
          (userData.user && userData.user.email) ||
          userData.email ||
          null;

        if (email && typeof email === 'string' && email.trim()) {
          return email.trim();
        }
      }
    } catch (error) {
      console.warn('Error getting user email:', error);
    }

    return 'No email';
  };

  useEffect(() => {
    if (selectedItem) {
      loadPermissions();
      console.log("Selected item changed, loading permissions:", selectedItem);
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
      console.log('Loading permissions for file ID:', selectedItem.id);

      // Try the direct API call to debug the endpoint
      const token = localStorage.getItem('token');
      const response = await fetch(`https://co-consultant.majesticsofts.com/api/files/permissions/list/${selectedItem.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('API Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Raw permissions data:', data);

      // Handle different possible response formats
      let permissionsArray = [];

      if (data && typeof data === 'object') {
        // Check if it's the format you showed: {status: "success", file: {...}, permissions: [...]}
        if (data.status === 'success' && data.permissions && Array.isArray(data.permissions)) {
          permissionsArray = data.permissions;
        }
        // Check if permissions are directly in data
        else if (data.permissions && Array.isArray(data.permissions)) {
          permissionsArray = data.permissions;
        }
        // Check if data itself is the permissions array
        else if (Array.isArray(data)) {
          permissionsArray = data;
        }
        // Check if it's wrapped in a data property
        else if (data.data && Array.isArray(data.data)) {
          permissionsArray = data.data;
        }
      } else if (Array.isArray(data)) {
        permissionsArray = data;
      }

      console.log('Final processed permissions:', permissionsArray);
      setPermissions(permissionsArray);
    } catch (error) {
      console.error('Failed to load permissions:', error);
      toast({
        title: "Error",
        description: `Failed to load permissions: ${error.message}`,
        variant: "destructive",
      });
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced handleAddUserAccess with proper loading state
// This is a direct modification of your existing function
const handleAddUserAccess = async (userId, permissions) => {
  if (!selectedItem) return;

  setAddingUser(true);
  console.log("Starting to add user access - loading state:", true);

  try {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Check if permissions array is not empty
    if (permissions.length > 0) {
      const permission = permissions[0]; // Get only the first permission
      console.log(`Assigning single permission: ${permission}`);

      const token = localStorage.getItem("token");

      const response = await fetch(
        "https://co-consultant.majesticsofts.com/api/files/permissions/assign",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            file_id: parseInt(selectedItem.id),
            user_id: userId,
            permission: permission, // Send only the single permission
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to assign ${permission}`);
      }

      toast({
        title: "Success",
        description: `User access with '${permission}' permission added successfully! 🎉`,
      });
    } else {
      toast({
        title: "Info",
        description: "No permissions selected to add.",
        variant: "default",
      });
    }

    await loadPermissions();
    onPermissionChange?.();
    setShowAddUserDialog(false);

  } catch (error) {
    console.error("Add user access error:", error);
    toast({
      title: "Error",
      description: `Failed to add user access: ${error.message}`,
      variant: "destructive",
    });
  } finally {
    console.log("Finished adding user access - loading state:", false);
    setAddingUser(false);
  }
};

  const handleRemovePermission = async (userId, permission) => {
    if (!selectedItem) return;

    try {
      // Use direct fetch call for consistency
      const token = localStorage.getItem('token');
      const response = await fetch('https://co-consultant.majesticsofts.com/api/files/permissions/remove', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          file_id: parseInt(selectedItem.id),
          user_id: userId,
          permission: permission
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to remove permission');
      }

      toast({
        title: "Success",
        description: "Permission removed successfully",
      });

      loadPermissions();
      onPermissionChange?.();
    } catch (error) {
      console.error('Remove permission error:', error);
      toast({
        title: "Error",
        description: `Failed to remove permission: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleRemoveAllUserPermissions = async (userId, userPermissions) => {
    if (!selectedItem) return;

    setRemovingAll(true); // Start loading
    try {
      for (const permission of userPermissions) {
        const token = localStorage.getItem('token');
        const response = await fetch('https://co-consultant.majesticsofts.com/api/files/permissions/remove', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            file_id: parseInt(selectedItem.id),
            user_id: userId,
            permission: permission.permission
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to remove ${permission.permission} permission`);
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      toast({
        title: "Success",
        description: "All user permissions removed successfully",
      });

      loadPermissions();
      onPermissionChange?.();
    } catch (error) {
      console.error('Remove user permissions error:', error);
      toast({
        title: "Error",
        description: `Failed to remove user permissions: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setRemovingAll(false); // Stop loading
    }
  };


  const handleUserClick = (userGroup) => {
    setSelectedUserDetails(userGroup);
    setShowUserDetailsDialog(true);
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
            className="w-full bg-panel hover:bg-panel/60 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={addingUser}
          >
            {addingUser ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                <span className="animate-pulse">Processing...</span>
              </div>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User Access
              </>
            )}
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
              {(() => {
                try {
                  // Group permissions by user_id with safe data handling
                  const groupedPermissions = permissions.reduce((acc, permission) => {
                    if (!permission || !permission.user_id) return acc;

                    const userId = permission.user_id;
                    if (!acc[userId]) {
                      acc[userId] = {
                        user: permission.user || {},
                        user_id: userId,
                        user_name: getSafeUserName(permission),
                        user_email: getSafeUserEmail(permission),
                        permissions: [],
                        created_at: permission.created_at
                      };
                    }
                    acc[userId].permissions.push(permission);
                    return acc;
                  }, {});

                  return Object.values(groupedPermissions).map((userGroup) => (
                    <div
                      key={userGroup.user_id}
                      className="flex items-center justify-between p-3 bg-card rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleUserClick(userGroup)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getSafeUserInitials(userGroup)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{userGroup.user_email}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {userGroup.permissions && userGroup.permissions.slice(0, 3).map((permission, index) => {
                              const permissionDetails = getPermissionDetails(permission.permission);
                              const IconComponent = permissionDetails.icon;

                              return (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className={`text-xs ${permissionDetails.color}`}
                                >
                                  <IconComponent className="h-3 w-3 mr-1" />
                                  {permissionDetails.label}
                                </Badge>
                              );
                            })}
                            {userGroup.permissions && userGroup.permissions.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{userGroup.permissions.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUserClick(userGroup);
                          }}
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ));
                } catch (error) {
                  console.error('Error rendering permissions:', error);
                  return (
                    <div className="text-center py-4 text-destructive">
                      Error displaying permissions
                    </div>
                  );
                }
              })()}
            </div>
          )}
        </div>
      </CardContent>

      {/* User Details Dialog */}
      <Dialog open={showUserDetailsDialog} onOpenChange={setShowUserDetailsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Details & Permissions</DialogTitle>
          </DialogHeader>
          {selectedUserDetails && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-lg">
                    {getSafeUserInitials(selectedUserDetails)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{getSafeUserName(selectedUserDetails)}</div>
                  <div className="text-sm text-muted-foreground">{getSafeUserEmail(selectedUserDetails)}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">
                  Permissions ({selectedUserDetails.permissions?.length || 0}):
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedUserDetails.permissions?.map((permission, index) => {
                    const permissionDetails = getPermissionDetails(permission.permission);
                    const IconComponent = permissionDetails.icon;

                    return (
                      <div key={index} className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={`${permissionDetails.color} flex items-center gap-1`}
                        >
                          <IconComponent className="h-3 w-3" />
                          {permissionDetails.label}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            handleRemovePermission(permission.user_id, permission.permission);
                            // Update the dialog data
                            setSelectedUserDetails(prev => ({
                              ...prev,
                              permissions: prev.permissions ? prev.permissions.filter(p => p.id !== permission.id) : []
                            }));
                          }}
                          className="text-destructive hover:text-destructive h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  }) || []}
                </div>
              </div>

              {selectedUserDetails.user?.id && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">User ID:</div>
                  <div className="text-sm text-muted-foreground">{selectedUserDetails.user?.id || selectedUserDetails.user_id}</div>
                </div>
              )}

              {selectedUserDetails.created_at && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Access Granted:</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(selectedUserDetails.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowUserDetailsDialog(false)}
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowUserDetailsDialog(false);
                    handleRemoveAllUserPermissions(selectedUserDetails.user_id, selectedUserDetails.permissions || []);
                  }}
                >
                  Remove All Access
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Other Dialogs */}
      <FolderUsersDialog
        isOpen={showUsersDialog}
        onClose={() => setShowUsersDialog(false)}
        selectedItem={selectedItem}
      />

      <UserSearchDialog
        isOpen={showAddUserDialog}
        onClose={() => {
          if (!addingUser) { // Only allow close if not loading
            setShowAddUserDialog(false);
          }
        }}
        onAddUser={handleAddUserAccess}
        permissionOptions={PERMISSION_OPTIONS}
        isLoading={addingUser} // 👈 YE IMPORTANT HAI! Pass the loading state to UserSearchDialog
      />
    </Card>
  );
}