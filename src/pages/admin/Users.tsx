"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { userService } from "@/services/User-service"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { User, ApiResponse } from "@/Types/UserTypes"
import { UserListComponent } from "@/components/admin/ListUsers"
import { UserForm } from "@/components/admin/AddUser"

const Users: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [userTypeFilter, setUserTypeFilter] = useState("all")
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data, isLoading, isError, error } = useQuery<ApiResponse | User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      try {
        const response = await userService.getAll()
        // Ensure 'data' property is always present
        if (typeof response === "object" && response !== null && "success" in response) {
          return {
            success: response.success,
            data: response.data ?? [],
            message: response.message ?? "",
          }
        }
        // fallback: treat as array of users
        return {
          success: true,
          data: Array.isArray(response) ? response : [],
          message: "",
        }
      } catch (err: any) {
        console.error("API Error:", err)
        throw err
      }
    },
    refetchOnWindowFocus: false,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  })

  const users = useMemo(() => {
    if (Array.isArray(data)) return data
    if (data && typeof data === "object" && "success" in data) {
      if (!data.success) return []
      if (Array.isArray(data.data)) return data.data
      if (Array.isArray((data as any).data?.data)) return (data as any).data.data
    }
    return []
  }, [data])

  // 🔹 Create User Mutation
  const createUserMutation = useMutation({
    mutationFn: async (newUser: { name: string; email: string; password: string; role: string; user_type: string }) => {
      return await userService.create(newUser)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast({ title: "Success", description: "User created successfully" })
    },
    onError: (error: any) => {
      console.error("Create user error:", error)
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to create user"
      toast({ title: "Error", description: errorMessage, variant: "destructive" })
    },
  })

  // 🔹 Update User Mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: any & { id: number }) => {
      return await userService.update(data.id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast({ title: "Success", description: "User updated successfully" })
    },
    onError: (error: any) => {
      console.error("Update user error:", error)
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to update user"
      toast({ title: "Error", description: errorMessage, variant: "destructive" })
    },
  })

  const handleAddUser = (userData: { name: string; email: string; password: string; role: string }) => {
    createUserMutation.mutate({
      ...userData,
      user_type: "user", // default
    })
  }

  const handleUpdateUser = (userData: any & { id?: number }) => {
    if (userData.id) {
      updateUserMutation.mutate(userData)
    }
  }

  const getUserStatus = (
    user: User,
  ): { status: string; color: "default" | "secondary" | "destructive" | "outline" } => {
    if (user.email_verified_at) return { status: "Active", color: "default" }
    return { status: "Pending", color: "secondary" }
  }

  const getUserRole = (user: User): string => {
    if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
      return user.roles[0].name
    }
    return user.user_type || "user"
  }

  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return []
    return users.filter((user: User) => {
      if (!user.name || !user.email || !user.id) return false

      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toString().includes(searchTerm)

      const userStatus = getUserStatus(user).status.toLowerCase()
      const matchesStatus = statusFilter === "all" || userStatus === statusFilter

      const userRole = getUserRole(user).toLowerCase()
      const matchesRole = roleFilter === "all" || userRole === roleFilter

      const matchesUserType = userTypeFilter === "all" || user.user_type === userTypeFilter

      return matchesSearch && matchesStatus && matchesRole && matchesUserType
    })
  }, [users, searchTerm, statusFilter, roleFilter, userTypeFilter])

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading users...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-500 mb-2">⚠️</div>
              <h3 className="font-semibold mb-2">Failed to load users</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {error instanceof Error ? error.message : "An unexpected error occurred"}
              </p>
              <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["users"] })}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage team members and their permissions • {users.length} total users
          </p>
        </div>

        {/* 🔹 Yahan sirf UserForm ka Add wala button */}
        <UserForm onSubmit={handleAddUser} isLoading={createUserMutation.isPending} />
      </div>

      <UserListComponent
        users={users}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        userTypeFilter={userTypeFilter}
        setUserTypeFilter={setUserTypeFilter}
        filteredUsers={filteredUsers}
      />
    </div>
  )
}

export default Users
