"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/User-service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UserListComponent } from "@/components/admin/Users/ListUsers";
import { UserForm } from "@/components/admin/Users/AddUser";

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all"); // single dropdown only
  const { toast } = useToast();
  const queryClient = useQueryClient();
const [updatingUserId, setUpdatingUserId] = useState(null);

  // Fetch all users
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      try {
        const response = await userService.getAll();

        if (typeof response === "object" && response !== null && "success" in response) {
          return {
            success: response.success,
            data: response.data ?? [],
            message: response.message ?? "",
          };
        }

        return {
          success: true,
          data: Array.isArray(response) ? response : [],
          message: "",
        };
      } catch (err) {
        console.error("API Error:", err);
        throw err;
      }
    },
    refetchOnWindowFocus: false,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  // Normalize users
  const users = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object" && "success" in data) {
      if (!data.success) return [];
      if (Array.isArray(data.data)) return data.data;
      if (Array.isArray(data?.data?.data)) return data.data.data;
    }
    return [];
  }, [data]);

  // Add user
  const handleAddUser = async (userData) => {
    try {
      const result = await userService.create({
        ...userData,
        user_type: "user",
      });

      if (result && result.success !== false) {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        toast({
          title: "Success",
          description: "User created successfully",
        });
        return { success: true };
      } else {
        return {
          success: false,
          message: result?.message || "Failed to create user",
          errors: result?.errors || {},
        };
      }
    } catch (error) {
      console.error("Create user error:", error);

      if (error?.response?.data) {
        const errorData = error.response.data;
        return {
          success: false,
          message: errorData.message || "Failed to create user",
          errors: errorData.errors || {},
        };
      }

      return {
        success: false,
        message: error?.message || "Failed to create user",
      };
    }
  };



const handleUpdateUser = async (userData) => {
  if (!userData.id) {
    return { success: false, message: "User ID is required" };
  }
  
  // Set loading state
  setUpdatingUserId(userData.id);
  
  try {
    const result = await userService.update(userData.id, userData);
    
    if (result && result.success !== false) {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ 
        title: "Success", 
        description: "User updated successfully" 
      });
      return { success: true };
    } else {
      return {
        success: false,
        message: result?.message || "Failed to update user",
        errors: result?.errors || {},
      };
    }
  } catch (error) {
    console.error("Update user error:", error);
    
    if (error?.response?.data) {
      return {
        success: false,
        message: error.response.data.message || "Failed to update user",
        errors: error.response.data.errors || {},
      };
    }
    
    return {
      success: false,
      message: error?.message || "Failed to update user",
    };
  } finally {
    // Clear loading state
    setUpdatingUserId(null);
  }
};

  // Helpers
  const getUserRole = (user) => {
    if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
      return user.roles[0].name;
    }
    return user.user_type || "user";
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];

    return users.filter((user) => {
      if (!user.name || !user.email || !user.id) return false;

      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toString().includes(searchTerm);

      const userRole = getUserRole(user).toLowerCase();
      const matchesRole = roleFilter === "all" || userRole === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  // Loading
  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading users...</p>
      </div>
    );
  }

  // Error
  if (isError) {
    return (
      <div className="p-4 sm:p-6">
        <Card>
          <CardContent className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-500 mb-2">⚠️</div>
              <h3 className="font-semibold mb-2">Failed to load users</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {error instanceof Error ? error.message : "An unexpected error occurred"}
              </p>
              <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["users"] })}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Page
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage team members and their permissions • {users.length} total users
          </p>
        </div>

        <div className="md:self-end">
          <UserForm
            onSubmit={handleAddUser}
            isLoading={false}
            initialData={null}
            mode="add"
          />
        </div>
      </div>

      {/* User List */}
      <UserListComponent
        users={users}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        filteredUsers={filteredUsers}
        handleUpdateUser={handleUpdateUser} 
        updatingUserId={updatingUserId}
      />
    </div>
  );
};

export default Users;
