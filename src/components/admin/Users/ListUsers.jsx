"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/User-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useMemo } from "react";
import { ArrowUpDown, Edit, Eye, Trash } from "lucide-react";

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
import { UserDetailsModal } from "./Userdetails";

export const UserListComponent = ({
  users,
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
  filteredUsers,
  updatingUserId,
  handleUpdateUser,
  currentPage,
  setCurrentPage,
  pageSize = 10,
  setPageSize,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Sorting Config (keep the state here)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        // Toggle asc ↔ desc
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // Helper functions (defined first for use in sorting and rendering)
  const getUserRole = (user) => {
    if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
      return user.roles[0].name;
    }
    return user.user_type || "user";
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


  // 1. Sort the filtered users (must come before pagination)
  const sortedUsers = useMemo(() => {
    let sortable = [...filteredUsers];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        let aValue = "";
        let bValue = "";

        // Custom logic for each column
        switch (sortConfig.key) {
          case "name":
            aValue = a.name?.toLowerCase() || "";
            bValue = b.name?.toLowerCase() || "";
            break;
          case "email":
            aValue = a.email?.toLowerCase() || "";
            bValue = b.email?.toLowerCase() || "";
            break;
          case "role":
            aValue = getUserRole(a)?.toLowerCase() || "";
            bValue = getUserRole(b)?.toLowerCase() || "";
            break;
          case "created_at":
            aValue = new Date(a.created_at);
            bValue = new Date(b.created_at);
            break;
          default:
            break;
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [filteredUsers, sortConfig]); // Depend on filteredUsers and sortConfig


  // 2. Pagination Calculation (must come after sorting)
  const totalItems = sortedUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Ensure currentPage is safe
  const safePage = useMemo(() => {
    // Logic to reset page to 1 if the current page is out of bounds
    // or if the list becomes empty due to filtering/sorting
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
      return totalPages;
    }
    return Math.min(Math.max(1, currentPage), totalPages);
  }, [currentPage, totalPages, setCurrentPage]); // Depend on relevant variables


  // 3. Slice the sorted array for the current page
  const paginatedUsers = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    const end = start + pageSize;
    return sortedUsers.slice(start, end);
  }, [sortedUsers, safePage, pageSize]); // Depend on sortedUsers, safePage, and pageSize



  // Mutation for deleting a user
  const deleteUserMutation = useMutation({
    mutationFn: async (id) => {
      return await userService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "Success", description: "User deleted successfully" });
      // OPTIONAL: After deletion, check if current page is now empty
      // and adjust currentPage if necessary. This is handled implicitly
      // by the safePage logic on the next render.
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


  const handleDeleteUser = (userId) => {
    deleteUserMutation.mutate(userId);
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };


  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <CardTitle>Existing Users </CardTitle>
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
            {/* Table Header - Desktop only */}
            <div className="hidden sm:grid grid-cols-12 gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wider pb-2 border-b">
              <div
                onClick={() => handleSort("name")}
                className="col-span-3 flex items-center gap-1 cursor-pointer hover:text-foreground transition"
              >
                User
                <ArrowUpDown className={`h-3 w-3 ${sortConfig.key === 'name' ? 'opacity-100' : 'opacity-50'}`} />
              </div>
              <div
                onClick={() => handleSort("email")}
                className="col-span-3 flex items-center gap-1 cursor-pointer hover:text-foreground transition"
              >
                Email
                <ArrowUpDown className={`h-3 w-3 ${sortConfig.key === 'email' ? 'opacity-100' : 'opacity-50'}`} />
              </div>

              <div
                onClick={() => handleSort("role")} // Added sort for role
                className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-foreground transition"
              >
                Role & Type
                <ArrowUpDown className={`h-3 w-3 ${sortConfig.key === 'role' ? 'opacity-100' : 'opacity-50'}`} />
              </div>
              <div
                onClick={() => handleSort("created_at")}
                className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-foreground transition"
              >
                Created
                <ArrowUpDown className={`h-3 w-3 ${sortConfig.key === 'created_at' ? 'opacity-100' : 'opacity-50'}`} />
              </div>
              <div className="col-span-2">Actions</div> {/* Changed from 1 to 2 for alignment */}
            </div>
            {/* Table Content */}
            {paginatedUsers.length === 0 ? (

              <div className="text-center py-12">
                <UserIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-sm font-medium text-foreground mb-1">
                  No users found
                </h3>
                {filteredUsers.length > 0 && (
                  <p className="text-xs text-muted-foreground">Try adjusting your page size or current page number.</p>
                )}
              </div>
            ) : (
              paginatedUsers.map((user) => {

                const hasOneDrive = hasOneDriveIntegration(user);
                return (
                  <div
                    key={user.id}
                    className="sm:grid sm:grid-cols-12 gap-4 items-center py-4 border-b border-border last:border-0 
                                hover:bg-gray-50/50 dark:hover:bg-[#0f172a] 
                                rounded-lg px-2 transition-colors"
                  >
                    {/* Mobile View (Card layout) */}
                    <div className="block sm:hidden space-y-2 p-3 border rounded-lg shadow-sm bg-white">
                      {/* Top Row */}
                      <div className="flex items-center gap-3">
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
                        <div>
                          <div className="font-medium text-sm">{user.name}</div>
                          <div className="text-xs text-muted-foreground">
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                      {/* Email */}
                      <div className="text-sm text-muted-foreground break-words">
                        {user.email}
                      </div>
                      {hasOneDrive && (
                        <Badge variant="outline" className="text-xs">
                          OneDrive
                        </Badge>
                      )}
                      {/* Role */}
                      <Badge variant="outline" className="text-xs capitalize">
                        {getUserRole(user)}
                      </Badge>
                      {/* Date */}
                      <div className="text-xs text-muted-foreground">
                        {formatDate(user.created_at)} ({getRelativeTime(user.created_at)})
                      </div>
                      {/* Actions */}
                      <div className="pt-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-40">
                            <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
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
                                  handleUpdateUser({
                                    id: updatedUser.id,
                                    name: updatedUser.name,
                                    email: updatedUser.email,
                                    password: updatedUser.password || undefined,
                                    role: updatedUser.role,
                                  })
                                }
                                trigger={
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start"
                                  >
                                    Edit User
                                  </Button>
                                }
                              />
                            </DropdownMenuItem>
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
                    {/* Desktop View (Grid layout) */}
                    <div className="hidden sm:contents">
                      {/* User */}
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
                          <div className="font-medium text-sm truncate">{user.name}</div>
                          <div className="text-xs text-muted-foreground">

                          </div>
                        </div>
                      </div>
                      {/* Email */}
                      <div className="col-span-3">
                        <div className="text-sm text-muted-foreground truncate">
                          {user.email}
                        </div>
                        {hasOneDrive && (
                          <Badge variant="outline" className="text-xs">
                            OneDrive
                          </Badge>
                        )}
                      </div>
                      {/* Role */}
                      <div className="col-span-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {getUserRole(user)}
                        </Badge>
                      </div>
                      {/* Date */}
                      <div className="col-span-2">
                        <div className="text-sm text-muted-foreground">
                          {formatDate(user.created_at)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getRelativeTime(user.created_at)}
                        </div>
                      </div>
                      <div className="col-span-2 flex justify-end items-center gap-2">
                        {/* View */}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleViewDetails(user)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {/* Edit */}
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
                            handleUpdateUser({
                              id: updatedUser.id,
                              name: updatedUser.name,
                              email: updatedUser.email,
                              password: updatedUser.password || undefined,
                              role: updatedUser.role,
                            })
                          }
                          isLoading={updatingUserId === user.id}
                          trigger={
                            <Button variant="outline" size="icon" title="Edit User">
                              <Edit className="h-4 w-4" />
                            </Button>
                          }
                        />
                        {/* Delete */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              title="Delete User"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete{" "}
                                <strong>{user.name}</strong>? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={deleteUserMutation.isPending}
                              >
                                {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>

        {/* Pagination Footer Container */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t text-sm">
          {/* Rows per page and Total users info (Left Side) */}
          <div className="flex items-center gap-4 mb-3 sm:mb-0">
            {/* Page size dropdown */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Rows per page:</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(val) => {
                  setPageSize(Number(val));
                  setCurrentPage(1); // Reset to page 1 when page size changes
                }}
              >
                <SelectTrigger className="w-20">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Total users info */}
            <div className="text-muted-foreground">
              Total Users:{" "}
              <span className="ml-1 font-medium text-foreground">
                {totalItems}
              </span>
            </div>
          </div>

          {/* Pagination controls (Right Side) */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              Previous
            </Button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {/* Simplified page number display for large lists (optional) */}
              {totalPages <= 7 ? (
                Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Button
                    key={pageNum}
                    size="sm"
                    variant={pageNum === safePage ? "default" : "outline"}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 p-0`}
                  >
                    {pageNum}
                  </Button>
                ))
              ) : (
                // Display current, 1-2 around it, and last page
                <>
                  <Button size="sm" variant={1 === safePage ? "default" : "outline"} onClick={() => setCurrentPage(1)} className={`w-8 h-8 p-0`}>1</Button>
                  {safePage > 3 && <span className="text-muted-foreground px-1">...</span>}
                  {/* Page button before current */}
                  {safePage > 2 && <Button size="sm" variant="outline" onClick={() => setCurrentPage(safePage - 1)} className={`w-8 h-8 p-0`}>{safePage - 1}</Button>}
                  {/* Current page button (only if not 1 or last) */}
                  {safePage !== 1 && safePage !== totalPages && (
                    <Button size="sm" variant="default" onClick={() => setCurrentPage(safePage)} className={`w-8 h-8 p-0`}>{safePage}</Button>
                  )}
                  {/* Page button after current */}
                  {safePage < totalPages - 1 && <Button size="sm" variant="outline" onClick={() => setCurrentPage(safePage + 1)} className={`w-8 h-8 p-0`}>{safePage + 1}</Button>}
                  {safePage < totalPages - 2 && <span className="text-muted-foreground px-1">...</span>}
                  {/* Last page button (only if totalPages > 1) */}
                  {totalPages > 1 && <Button size="sm" variant={totalPages === safePage ? "default" : "outline"} onClick={() => setCurrentPage(totalPages)} className={`w-8 h-8 p-0`}>{totalPages}</Button>}
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={safePage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            >
              Next
            </Button>
          </div>
        </div>


      </Card>


      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUser}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </>
  );
};