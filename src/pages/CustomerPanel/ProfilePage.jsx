import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Settings,
  HardDrive,
  Home,
  Users,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    avatar: "",
  });

  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    autoSync: true,
    shareByDefault: false,
  });

  const handleProfileUpdate = () => {
    toast.success("Profile updated successfully!");
  };

  const handleSettingsUpdate = () => {
    toast.success("Settings updated successfully!");
  };

  return (
    <div className="min-h-screen  flex">
   
      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profileData.avatar} />
                <AvatarFallback className="text-lg font-semibold bg-panel text-panel-foreground">
                  {profileData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {profileData.name}
                </h1>
                <p className="text-muted-foreground">{profileData.email}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profileData.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <HardDrive className="h-4 w-4" />
                    2.5 GB used of 15 GB
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 py-8">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal information and profile details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleProfileUpdate}
                    className="bg-panel text-panel-foreground hover:bg-panel/90"
                  >
                    Update Profile
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Storage Usage</CardTitle>
                  <CardDescription>
                    Monitor your CloudVault storage usage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Used Storage
                      </span>
                      <span className="text-sm font-medium">
                        2.5 GB of 15 GB
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-panel h-2 rounded-full"
                        style={{ width: "16.7%" }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium">Documents</div>
                        <div className="text-muted-foreground">1.2 GB</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">Images</div>
                        <div className="text-muted-foreground">800 MB</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">Videos</div>
                        <div className="text-muted-foreground">500 MB</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>
                    Customize your CloudVault experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about file sharing and updates
                      </p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={settings.notifications}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          notifications: checked,
                        }))
                      }
                      className="data-[state=checked]:bg-panel"
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="darkMode">Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Switch to dark theme
                      </p>
                    </div>
                    <Switch
                      id="darkMode"
                      checked={settings.darkMode}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({ ...prev, darkMode: checked }))
                      }
                      className="data-[state=checked]:bg-panel"
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoSync">Auto Sync</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically sync files across devices
                      </p>
                    </div>
                    <Switch
                      id="autoSync"
                      checked={settings.autoSync}
                      className="data-[state=checked]:bg-panel"
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({ ...prev, autoSync: checked }))
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="shareByDefault">Share by Default</Label>
                      <p className="text-sm text-muted-foreground">
                        Make new folders shared by default
                      </p>
                    </div>
                    <Switch
                      id="shareByDefault"
                      checked={settings.shareByDefault}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          shareByDefault: checked,
                        }))
                      }
                    />
                  </div>
                  <Button className="bg-panel" onClick={handleSettingsUpdate}>
                    Save Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your account security and access
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  <Button>Update Password</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        Not enabled
                      </p>
                    </div>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
