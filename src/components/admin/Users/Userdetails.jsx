"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Calendar, Shield, Key, Clock } from "lucide-react"

/**
 * Safe date formatter
 */
function formatDate(dateString) {
  if (!dateString) return "N/A"
  try {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return "Invalid date"
  }
}

/**
 * @typedef {Object} UserType
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {string|null} email_verified_at
 * @property {"admin"|"manager"|"user"|string} user_type
 * @property {Array<{
 *   id: number,
 *   name: string,
 *   guard_name: string,
 *   created_at: string
 * }>} roles
 * @property {string|null=} onedrive_token
 * @property {string|null=} onedrive_token_expires_at
 * @property {string|null=} onedrive_refresh_token
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} UserDetailsModalProps
 * @property {UserType|null} user
 * @property {boolean} isOpen
 * @property {() => void} onClose
 */

/**
 * @param {UserDetailsModalProps} props
 */
export function UserDetailsModal({ user, isOpen, onClose }) {
  if (!user) return null

  const getStatusBadge = () => {
    if (user.email_verified_at) {
      return (
        <Badge variant="default" className="bg-green-500">
          Active
        </Badge>
      )
    }
    return <Badge variant="secondary">Pending Verification</Badge>
  }

  const getUserTypeBadge = () => {
    if (!user.user_type || typeof user.user_type !== "string") {
      return <Badge variant="secondary">Unknown</Badge>
    }

    const colors = {
      admin: "bg-red-500",
      manager: "bg-blue-500",
      user: "bg-gray-500",
    }

    const color = colors[user.user_type] || "bg-gray-400"

    return (
      <Badge variant="default" className={color}>
        {user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1)}
      </Badge>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <p className="text-sm font-medium">{user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">User ID</label>
                  <p className="text-sm font-medium">#{user.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge()}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">User Type</label>
                  <div className="mt-1">{getUserTypeBadge()}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email Verified</label>
                  <p className="text-sm font-medium">
                    {user.email_verified_at ? formatDate(user.email_verified_at) : "Not verified"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Roles & Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Roles & Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.roles && user.roles.length > 0 ? (
                <div className="space-y-3">
                  {user.roles.map((role) => (
                    <div key={role.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{role.name}</Badge>
                        <span className="text-xs text-muted-foreground">ID: {role.id}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Guard:</span> {role.guard_name}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Assigned:</span> {formatDate(role.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No roles assigned</p>
              )}
            </CardContent>
          </Card>

          {/* OneDrive Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Key className="h-4 w-4" />
                OneDrive Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Token Status</label>
                  <p className="text-sm font-medium">
                    {user.onedrive_token ? (
                      <Badge variant="default" className="bg-green-500">
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Not Connected</Badge>
                    )}
                  </p>
                </div>
                {user.onedrive_token_expires_at && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Token Expires</label>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {formatDate(user.onedrive_token_expires_at)}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Refresh Token</label>
                  <p className="text-sm font-medium">
                    {user.onedrive_refresh_token ? "Available" : "Not available"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Account Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="text-sm font-medium">{formatDate(user.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p className="text-sm font-medium">{formatDate(user.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
