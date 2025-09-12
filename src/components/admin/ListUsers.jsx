"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/User-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, User as UserIcon, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { UserForm } from "./AddUser";
import { UserDetailsModal } from "./Userdetails"; // ✅ import modal

export const UserListComponent = ({
  users,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  roleFilter,
  setRoleFilter,
  userTypeFilter,
  setUserTypeFilter,
  filteredUsers,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Mutation for deleting a user
  const deleteUserMutation = useMutation({
    mutationFn: async (id) => {
      return await userService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "Success", description: "User deleted successfully" });
    },
    onError: (error) => {
      console.error("Delete user error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete user";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleUpdateUser = async (id, data) => {
    const res = await userService.update(id, data);
    if (res.success) {
      toast({
        title: "User Updated",
        description: `${data.name} updated successfully`,
      });
      fetchUsers();
    } else {
      toast({
        title: "❌ Update Failed",
        description: res.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = (userId) => {
    deleteUserMutation.mutate(userId);
  };

  // ✅ yeh function modal open karega
  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  // Helper functions (same as pehle)
  const getUserRole = (user) => {
    if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
      return user.roles[0].name;
    }
    return user.user_type || "user";
  };

  const getUserStatus = (user) => {
    if (user.email_verified_at) {
      return { status: "Active", color: "default" };
    }
    return { status: "Pending", color: "secondary" };
  };

  const hasOneDriveIntegration = (user) => {
    return !!(user.onedrive_token && user.onedrive_refresh_token);
  };

  const getUniqueRoles = () => {
    if (!Array.isArray(users)) {
      return [];
    }
    const roles = new Set();
    users.forEach((user) => {
      if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
        user.roles.forEach((role) => roles.add(role.name));
      } else if (user.user_type) {
        roles.add(user.user_type);
      }
    });
    return Array.from(roles).sort();
  };

  const getUniqueUserTypes = () => {
    if (!Array.isArray(users)) {
      return [];
    }
    const userTypes = new Set();
    users.forEach((user) => {
      if (user.user_type) {
        userTypes.add(user.user_type);
      }
    });
    return Array.from(userTypes).sort();
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid Date";
    }
  };

  const getRelativeTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Unknown";
      }

      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return "Just now";
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400)
        return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 2592000)
        return `${Math.floor(diffInSeconds / 86400)}d ago`;

      return formatDate(dateString);
    } catch (error) {
      console.error("Relative time error:", error);
      return "Unknown";
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <CardTitle>All Users ({filteredUsers.length})</CardTitle>
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  className="pl-9 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {getUniqueUserTypes().map((type) => (
                    <SelectItem key={type} value={type} className="capitalize">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {getUniqueRoles().map((role) => (
                    <SelectItem key={role} value={role} className="capitalize">
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wider pb-2 border-b">
              <div className="col-span-3">User</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2">Role & Type</div>
              <div className="col-span-2">Created</div>
              <div className="col-span-1">Actions</div>
            </div>

            {/* Table Content */}
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <UserIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-sm font-medium text-foreground mb-1">
                  No users found
                </h3>
              </div>
            ) : (
              filteredUsers.map((user) => {
                const hasOneDrive = hasOneDriveIntegration(user);

                return (
                  <div
                    key={user.id}
                    className="grid grid-cols-12 gap-4 items-center py-4 border-b border-border last:border-0 hover:bg-gray-50/50 rounded-lg px-2 transition-colors"
                  >
                    {/* User Info */}
                    <div className="col-span-3 flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {user.name &&
                            user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">
                          {user.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: {user.id}
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="col-span-3">
                      <div className="text-sm text-muted-foreground truncate">
                        {user.email}
                      </div>
                      {hasOneDrive && (
                        <div className="flex items-center mt-1">
                          <Badge variant="outline" className="text-xs">
                            OneDrive
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Role & Type */}
                    <div className="col-span-2 space-y-1">
                      <Badge variant="outline" className="text-xs capitalize">
                        {getUserRole(user)}
                      </Badge>
                    </div>

                    {/* Created Date */}
                    <div className="col-span-2">
                      <div className="text-sm text-muted-foreground">
                        {formatDate(user.created_at)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getRelativeTime(user.created_at)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                            View Details
                          </DropdownMenuItem>

                          <UserForm
                            mode="edit"
                            initialData={{
                              id: user.id,
                              name: user.name,
                              email: user.email,
                              password: "",
                              role: user.roles?.[0]?.name || "user",
                            }}
                            onSubmit={(updatedUser) =>
                              handleUpdateUser(updatedUser.id, {
                                name: updatedUser.name,
                                email: updatedUser.email,
                                password: updatedUser.password || undefined,
                                role: updatedUser.role,
                              })
                            }
                          />

                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={(e) => e.preventDefault()}
                              >
                                Delete User
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete{" "}
                                  <strong>{user.name}</strong>? This action cannot
                                  be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleDeleteUser(user.id)}
                                  disabled={deleteUserMutation.isPending}
                                >
                                  {deleteUserMutation.isPending
                                    ? "Deleting..."
                                    : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* ✅ User Details Modal */}
      <UserDetailsModal
        user={selectedUser}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </>
  );
};

function fetchUsers() {
  throw new Error("Function not implemented.");
}
