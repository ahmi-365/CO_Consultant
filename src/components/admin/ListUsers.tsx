"use client";

import type React from "react";
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
import type { User } from "@/Types/UserTypes";
import { UserForm } from "./AddUser";

interface UserListProps {
  users: User[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
  userTypeFilter: string;
  setUserTypeFilter: (type: string) => void;
  filteredUsers: User[];
}

export const UserListComponent: React.FC<UserListProps> = ({
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

  // Mutation for deleting a user
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      return await userService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "Success", description: "User deleted successfully" });
    },
    onError: (error: any) => {
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
  const handleUpdateUser = async (id: number, data: any) => {
    const res = await userService.update(id, data);
    if (res.success) {
      toast({
        title: "User Updated",
        description: `${data.name} updated successfully`,
      });
      fetchUsers(); // list refresh karo
    } else {
      toast({
        title: "❌ Update Failed",
        description: res.message,
        variant: "destructive",
      });
    }
  };

  // Helper function to get user's primary role
  const getUserRole = (user: User): string => {
    if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
      return user.roles[0].name;
    }
    return user.user_type || "user";
  };

  // Helper function to get user status
  const getUserStatus = (
    user: User
  ): {
    status: string;
    color: "default" | "secondary" | "destructive" | "outline";
  } => {
    if (user.email_verified_at) {
      return { status: "Active", color: "default" };
    }
    return { status: "Pending", color: "secondary" };
  };

  // Helper function to check if user has OneDrive integration
  const hasOneDriveIntegration = (user: User): boolean => {
    return !!(user.onedrive_token && user.onedrive_refresh_token);
  };

  // Get unique roles from all users for filter dropdown
  const getUniqueRoles = (): string[] => {
    if (!Array.isArray(users)) {
      return [];
    }

    const roles = new Set<string>();
    users.forEach((user) => {
      if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
        user.roles.forEach((role) => roles.add(role.name));
      } else if (user.user_type) {
        roles.add(user.user_type);
      }
    });
    return Array.from(roles).sort();
  };

  // Get unique user types for filter dropdown
  const getUniqueUserTypes = (): string[] => {
    if (!Array.isArray(users)) {
      return [];
    }

    const userTypes = new Set<string>();
    users.forEach((user) => {
      if (user.user_type) {
        userTypes.add(user.user_type);
      }
    });
    return Array.from(userTypes).sort();
  };

  const handleDeleteUser = (userId: number) => {
    deleteUserMutation.mutate(userId);
  };

  // Enhanced date formatting
  const formatDate = (dateString: string) => {
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

  // Format relative time
  const getRelativeTime = (dateString: string) => {
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
              <p className="text-sm text-muted-foreground">
                {searchTerm ||
                statusFilter !== "all" ||
                roleFilter !== "all" ||
                userTypeFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first user"}
              </p>
            </div>
          ) : (
            filteredUsers.map((user: User) => {
              const userStatus = getUserStatus(user);
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
                            .map((n: string) => n[0])
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
                        <DropdownMenuItem
                          onClick={() => {
                            toast({
                              title: "View Details",
                              description: `Viewing details for ${user.name}`,
                            });
                          }}
                        >
                          View Details
                        </DropdownMenuItem>
                        <UserForm
                          mode="edit"
                          initialData={{
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            password: "", // edit me empty rakho
                            role: user.roles?.[0]?.name || "user",
                          }}
                          onSubmit={(updatedUser) =>
                            handleUpdateUser(updatedUser.id, {
                              name: updatedUser.name,
                              email: updatedUser.email,
                              password: updatedUser.password || undefined, // sirf tab bhejo jab update karni ho
                              role: updatedUser.role,
                              // user_type: updatedUser.user_type,
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
  );
};
function fetchUsers() {
  throw new Error("Function not implemented.");
}
