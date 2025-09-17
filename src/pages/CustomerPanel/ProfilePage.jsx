import { useState, useEffect } from "react";
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
  Eye,
  EyeOff,
  Camera,
} from "lucide-react";
import { toast } from "sonner";
import { profileService } from "@/services/profileService";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Profile data from localStorage
  const [profileData, setProfileData] = useState({
    name: "",
    last_name: "",
    email: "",
    phone_number: "",
    profile_photo: "",
  });

  // Store the selected file separately (not in profileData)
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  // User roles and permissions (read-only)
  const [userInfo, setUserInfo] = useState({
    roles: [],
    permissions: [],
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load user data from localStorage on component mount
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setProfileData({
          name: user.name || "",
          last_name: user.last_name || "",
          email: user.email || "",
          phone_number: user.phone_number || "",
          profile_photo: user.profile_photo || "",
        });
        setUserInfo({
          roles: user.roles || [],
          permissions: user.permissions || [],
        });
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        toast.error("Error loading user data");
      }
    }
  }, []);

  // Handle photo selection (only preview, no API call)
  const handlePhotoSelection = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    // Store the file for later upload
    setSelectedPhotoFile(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
    
    toast.success("Photo selected! Click 'Update Profile' to save changes.");
  };

  // Remove photo preview
  const handleRemovePhotoPreview = () => {
    setSelectedPhotoFile(null);
    setPhotoPreview("");
    
    // If there was an existing photo, we'll mark it for removal
    if (profileData.profile_photo) {
      toast.success("Photo will be removed when you click 'Update Profile'");
    }
  };

  const handleProfileUpdate = async () => {
    if (!profileData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!profileData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    setLoading(true);
    try {
      let updateData;

      // Normalize phone_number: blank => null
      const normalizedPhone =
        profileData.phone_number && profileData.phone_number.trim() !== ""
          ? profileData.phone_number
          : null;

      // If there's a selected photo file, use FormData for direct API call
      if (selectedPhotoFile) {
        const formData = new FormData();
        formData.append("name", profileData.name);
        formData.append("last_name", profileData.last_name || "");
        formData.append("email", profileData.email);
        formData.append("phone_number", normalizedPhone ?? "");
        formData.append("profile_photo", selectedPhotoFile);

        const token = localStorage.getItem("token");
        const response = await fetch(`${BASE_URL}/profile/update`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: formData,
        });

        const data = await response.json();
        updateData = response.ok
          ? { success: true, data }
          : {
              success: false,
              error: data.message || "Failed to update profile",
            };
      }
      // If photo was removed
      else if (!photoPreview && !selectedPhotoFile && profileData.profile_photo) {
        updateData = await profileService.updateProfile({
          name: profileData.name,
          last_name: profileData.last_name,
          email: profileData.email,
          phone_number: normalizedPhone,
          remove_photo: true,
        });
      }
      // Regular update without photo changes
      else {
        updateData = await profileService.updateProfile({
          name: profileData.name,
          last_name: profileData.last_name,
          email: profileData.email,
          phone_number: normalizedPhone,
        });
      }

      if (updateData.success && updateData.data.status === "success") {
        const updatedUser = updateData.data.user;
        localStorage.setItem("user", JSON.stringify(updatedUser));

        setProfileData({
          name: updatedUser.name || "",
          last_name: updatedUser.last_name || "",
          email: updatedUser.email || "",
          phone_number: updatedUser.phone_number || "",
          profile_photo: updatedUser.profile_photo || "",
        });

        setUserInfo({
          roles: updatedUser.roles || [],
          permissions: updatedUser.permissions || [],
        });

        setSelectedPhotoFile(null);
        setPhotoPreview("");

        toast.success(
          updateData.data.message || "Profile updated successfully!"
        );
      } else {
        toast.error(updateData.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Updated password update function to use separate API
  const handlePasswordUpdate = async () => {
    if (!passwordForm.currentPassword) {
      toast.error("Current password is required");
      return;
    }

    if (!passwordForm.newPassword) {
      toast.error("New password is required");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    setPasswordLoading(true);
    try {
      // Use the separate password update API
      const result = await profileService.updatePassword({
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
        new_password_confirmation: passwordForm.confirmPassword,
      });

      if (result.success) {
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        toast.success(result.data.message || "Password updated successfully!");
      } else {
        toast.error(result.error || "Failed to update password");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setPasswordLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Determine which image to show in avatar
  const getDisplayImage = () => {
    if (photoPreview) return photoPreview; // Show preview if selected
    return profileData.profile_photo; // Show existing photo
  };

  return (
    <div className="min-h-screen flex">
      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={getDisplayImage()} />
                  <AvatarFallback className="text-lg font-semibold bg-panel text-panel-foreground">
                    {(profileData.name + " " + (profileData.last_name || ""))
                      .split(" ")
                      .filter(n => n)
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0 bg-panel text-panel-foreground hover:bg-panel/90"
                  onClick={() => document.getElementById('profile-photo-input')?.click()}
                  disabled={loading}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <input
                  id="profile-photo-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handlePhotoSelection(file);
                    }
                  }}
                />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground">
                  {profileData.name} {profileData.last_name}
                </h1>
                <p className="text-muted-foreground">{profileData.email}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {userInfo.roles.join(", ")}
                  </span>
                  {profileData.phone_number && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {profileData.phone_number}
                    </span>
                  )}
                </div>
                {(photoPreview || selectedPhotoFile) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-destructive hover:text-destructive"
                    onClick={handleRemovePhotoPreview}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove Selected Photo
                  </Button>
                )}
                {selectedPhotoFile && (
                  <div className="mt-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Photo ready to upload - Click "Update Profile" to save
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 py-8">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
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
                      <Label htmlFor="name">First Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={profileData.last_name}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            last_name: e.target.value,
                          }))
                        }
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone_number">Phone Number</Label>
                      <Input
                        id="phone_number"
                        value={profileData.phone_number}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            phone_number: e.target.value,
                          }))
                        }
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleProfileUpdate}
                    disabled={loading}
                    className="bg-panel text-panel-foreground hover:bg-panel/90"
                  >
                    {loading ? "Updating..." : "Update Profile"}
                  </Button>
                </CardContent>
              </Card>

              {/* User Roles and Permissions (Read-only) */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Your account roles and permissions (read-only)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Roles</Label>
                    <div className="flex flex-wrap gap-2">
                      {userInfo.roles.map((role, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Permissions</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                      {userInfo.permissions.map((permission, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs"
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card> */}
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
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword.current ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm(prev => ({
                            ...prev,
                            currentPassword: e.target.value
                          }))
                        }
                        disabled={passwordLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility('current')}
                      >
                        {showPassword.current ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword.new ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm(prev => ({
                            ...prev,
                            newPassword: e.target.value
                          }))
                        }
                        disabled={passwordLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility('new')}
                      >
                        {showPassword.new ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPassword.confirm ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm(prev => ({
                            ...prev,
                            confirmPassword: e.target.value
                          }))
                        }
                        disabled={passwordLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility('confirm')}
                      >
                        {showPassword.confirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button
                    onClick={handlePasswordUpdate}
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? "Updating..." : "Update Password"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}