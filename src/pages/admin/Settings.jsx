import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Bell,
  Database,
  Mail,
  Key,
  Users,
  Globe,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const securitySettingsList = [
  { id: "two-factor", label: "Two-Factor Authentication", description: "Require 2FA for all admin accounts" },
  { id: "password-policy", label: "Strong Password Policy", description: "Enforce complex password requirements" },
  { id: "session-timeout", label: "Auto Session Timeout", description: "Automatically log out inactive users" },
  { id: "login-notifications", label: "Login Notifications", description: "Send email alerts for new logins" },
];

const notificationSettingsList = [
  { id: "user-signup", label: "New User Signups", description: "Notify when new users join" },
  { id: "storage-alerts", label: "Storage Alerts", description: "Alerts when storage limits are reached" },
  { id: "system-updates", label: "System Updates", description: "Notifications about system maintenance" },
  { id: "security-events", label: "Security Events", description: "Alerts for suspicious activities" },
];

export default function Settings() {
  const [orgName, setOrgName] = useState("Cloud Storage Inc.");
  const [orgDescription, setOrgDescription] = useState("Professional cloud storage and file management solution");
  const [contactEmail, setContactEmail] = useState("admin@cloudstorage.com");
  const [maxStoragePerUser, setMaxStoragePerUser] = useState("100");
  const [defaultRole, setDefaultRole] = useState("viewer");
  const [allowRegistration, setAllowRegistration] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState("notifications@cloudstorage.com");
  const [securitySettings, setSecuritySettings] = useState({
    "two-factor": true,
    "password-policy": true,
    "session-timeout": false,
    "login-notifications": true,
  });
  const [notifications, setNotifications] = useState({
    "user-signup": true,
    "storage-alerts": true,
    "system-updates": false,
    "security-events": true,
  });
  const { toast } = useToast();

  const toggleSecuritySetting = (id) => {
    setSecuritySettings((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    toast({
      title: "Security Setting Updated",
      description: `${id.replace("-", " ")} has been ${securitySettings[id] ? "disabled" : "enabled"}`,
    });
  };

  const toggleNotificationSetting = (id) => {
    setNotifications((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    toast({
      title: "Notification Setting Updated",
      description: `${id.replace("-", " ")} notifications have been ${notifications[id] ? "disabled" : "enabled"}`,
    });
  };

  const handleSaveOrgSettings = () => {
    toast({
      title: "Organization Settings Saved",
      description: "Your organization settings have been updated successfully.",
    });
  };

  const handleSaveUserSettings = () => {
    toast({
      title: "User Settings Saved",
      description: "User management settings have been updated successfully.",
    });
  };

  const handleRegenerateApiKeys = () => {
    toast({
      title: "API Keys Regenerated",
      description: "New API keys have been generated. Please update your integrations.",
    });
  };

  const handleTestEmailConfig = () => {
    toast({
      title: "Test Email Sent",
      description: "A test email has been sent to verify your email configuration.",
    });
  };

  const handleBackupDatabase = () => {
    toast({
      title: "Database Backup Started",
      description: "Database backup is in progress. You'll be notified when complete.",
    });
  };

  const handleClearCache = () => {
    toast({
      title: "Cache Cleared",
      description: "System cache has been cleared successfully.",
    });
  };

  const handleUpdateSystem = () => {
    toast({
      title: "System Update Initiated",
      description: "System update is starting. This may take a few minutes.",
    });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your organization and system settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Organization + User Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Organization Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="orgDescription">Description</Label>
                <Textarea
                  id="orgDescription"
                  value={orgDescription}
                  onChange={(e) => setOrgDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>

              <Button onClick={handleSaveOrgSettings}>
                Save Organization Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="maxStorage">Max Storage Per User (GB)</Label>
                <Input
                  id="maxStorage"
                  type="number"
                  value={maxStoragePerUser}
                  onChange={(e) => setMaxStoragePerUser(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="defaultRole">Default Role for New Users</Label>
                <Select value={defaultRole} onValueChange={setDefaultRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="uploader">Uploader</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Allow User Registration</div>
                  <div className="text-xs text-muted-foreground">
                    Let new users sign up without invitation
                  </div>
                </div>
                <Switch
                  checked={allowRegistration}
                  onCheckedChange={setAllowRegistration}
                />
              </div>

              <Button onClick={handleSaveUserSettings}>
                Save User Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Security + Notifications + Maintenance */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securitySettingsList.map((setting) => (
                  <div
                    key={setting.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{setting.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {setting.description}
                      </div>
                    </div>
                    <Switch
                      checked={securitySettings[setting.id]}
                      onCheckedChange={() => toggleSecuritySetting(setting.id)}
                    />
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">API Access</span>
                  <Badge variant="secondary">Enabled</Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleRegenerateApiKeys}
                >
                  <Key className="h-4 w-4 mr-2" />
                  Regenerate API Keys
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notificationSettingsList.map((setting) => (
                  <div
                    key={setting.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{setting.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {setting.description}
                      </div>
                    </div>
                    <Switch
                      checked={notifications[setting.id]}
                      onCheckedChange={() => toggleNotificationSetting(setting.id)}
                    />
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <Label htmlFor="notificationEmail">Notification Email</Label>
                <Input
                  id="notificationEmail"
                  type="email"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleTestEmailConfig}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Test Email Configuration
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={handleBackupDatabase}>
                  Backup Database
                </Button>
                <Button variant="outline" onClick={handleClearCache}>
                  Clear Cache
                </Button>
                <Button variant="outline" onClick={handleUpdateSystem}>
                  Update System
                </Button>
                <Button variant="outline" className="text-destructive">
                  Reset Settings
                </Button>
              </div>

              <Separator />

              <div className="text-sm text-muted-foreground">
                <p>
                  <strong>Last Backup:</strong> December 8, 2024 at 3:00 AM
                </p>
                <p>
                  <strong>System Version:</strong> v2.1.4
                </p>
                <p>
                  <strong>Database Size:</strong> 1.2 GB
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
