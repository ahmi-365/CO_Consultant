import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { User, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Profile() {
  // --- form state ---
  const [Name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone_number, setPhoneNumber] = useState("");
  const [profile_photo, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // --- password change states ---
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);

  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  // --- API base ---
  const API_BASE_URL = import.meta.env.VITE_API_URL || "";
  const PROFILE_UPDATE_ENDPOINT = `${API_BASE_URL}/profile/update`; // update API
  const DELETE_ACCOUNT_ENDPOINT = `${API_BASE_URL}/account/delete`; // delete API
  const PASSWORD_CHANGE_ENDPOINT = `${API_BASE_URL}/password/update`; // change password API

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // -------------------------
  // Load profile from localStorage
  // -------------------------
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const data = JSON.parse(storedUser);
        setName(data.name ?? data.Name ?? "");
        setLastName(data.lastName ?? data.last_name ?? "");
        setEmail(data.email ?? "");
        setPhoneNumber(data.phone_number ?? data.phone ?? "");
        if (data.profile_photo) {
          setProfilePhoto(null);
          setProfilePhotoPreview(data.profile_photo);
        }
      }
    } catch (err) {
      console.error("Error loading user from localStorage:", err);
    }
  }, []);

  // -------------------------
  // Photo change handler
  // -------------------------
const handlePhotoChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Add file size validation here
  if (file.size > 2 * 1024 * 1024) {
    toast({
      title: "File too large",
      description: "Image size must be less than 2MB",
      variant: "destructive"
    });
    return; // Stop execution if file is too large
  }

  setProfilePhoto(file);

  const previewUrl = URL.createObjectURL(file);
  if (profilePhotoPreview && profilePhotoPreview.startsWith("blob:")) {
    URL.revokeObjectURL(profilePhotoPreview);
  }
  setProfilePhotoPreview(previewUrl);
};

  // -------------------------
  // Save profile (update API + update localStorage)
  // -------------------------
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", Name);
      formData.append("lastName", lastName);
      formData.append("email", email);
      formData.append("phone_number", phone_number);

      if (profile_photo instanceof File) {
        formData.append("profile_photo", profile_photo);
      }

      const res = await fetch(PROFILE_UPDATE_ENDPOINT, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          Accept: "application/json",
        },
        body: formData,
      });

      const resData = await (res.headers.get("content-type")?.includes("application/json") ? res.json() : res.text());

      if (!res.ok) {
        const message = typeof resData === "object" ? JSON.stringify(resData) : String(resData);
        throw new Error(message || `Status ${res.status}`);
      }
      toast({ title: "Profile updated", description: "Your details were updated successfully." });
      console.log("Profile update response:", resData);

      // update state + localStorage
      const updatedProfile = {
        name: resData.name ?? resData.Name ?? Name,
        lastName: resData.lastName ?? resData.last_name ?? lastName,
        email: resData.email ?? email,
        phone_number: resData.phone_number ?? phone_number,
        profile_photo: resData.profile_photo ?? profilePhotoPreview,
      };

      setName(updatedProfile.name);
      setLastName(updatedProfile.lastName);
      setEmail(updatedProfile.email);
      setPhoneNumber(updatedProfile.phone_number);
      if (updatedProfile.profile_photo) {
        setProfilePhoto(null);
        setProfilePhotoPreview(updatedProfile.profile_photo);
      }

      localStorage.setItem("user", JSON.stringify(updatedProfile));
    } catch (err) {
      console.error("Error saving profile:", err);
      toast({
        title: "Save failed",
        description: err.message || "Could not save profile. See console.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // -------------------------
  // Change password
  // -------------------------
  const handleChangePassword = async () => {
  // Show validation errors only on submit
  setShowPasswordValidation(true);

  if (!oldPassword || !newPassword || !confirmNewPassword) {
    toast({
      title: "Missing fields",
      description: "Please fill all password fields before saving.",
    });
    return;
  }

  if (newPassword !== confirmNewPassword) {
    toast({
      title: "Password mismatch",
      description: "New password and confirm password must be the same.",
    });
    return;
  }

  setIsChangingPassword(true);

  try {
    const res = await fetch(PASSWORD_CHANGE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        current_password: oldPassword,
        new_password: newPassword,
        new_password_confirmation: confirmNewPassword,
      }),
    });

    // Try to parse response safely
    let resData = {};
    try {
      resData = await res.json();
    } catch {
      throw new Error("Invalid response from server.");
    }

    // Handle different error scenarios
    if (!res.ok) {
      let errorMsg = "Password change failed.";

      if (res.status === 400) errorMsg = "Please check your input and try again.";
      else if (res.status === 401) errorMsg = "Old password is incorrect.";
      else if (res.status === 422) errorMsg = resData?.errors?.[0] || "Invalid password format.";
      else if (res.status >= 500) errorMsg = "Server error. Please try again later.";
      else if (resData?.message) errorMsg = resData.message;

      throw new Error(errorMsg);
    }

    toast({
      title: "Success",
      description: "Password updated successfully.",
    });

    // Reset fields and validation state
    setOldPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setShowPasswordValidation(false);
  } catch (err) {
    console.error("Password change error:", err);
    toast({
      title: "Failed to update password",
      description: err.message || "An unexpected error occurred. Please try again.",
    });
  } finally {
    setIsChangingPassword(false);
  }
};


  // -------------------------
  // Delete account
  // -------------------------
  const handleDeleteAccount = async () => {
    if (!confirmPassword) {
      toast({ title: "Enter password", description: "Please type your password to confirm." });
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(DELETE_ACCOUNT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ password: confirmPassword }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData?.message || "Delete failed");

      toast({ title: "Account deleted", description: "Your account was removed." });
      console.log("Delete response:", resData);
      setIsDeleteOpen(false);

      // clear localStorage on delete
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } catch (err) {
      console.error("Delete account error:", err);
      toast({ title: "Delete failed", description: err.message || "See console." });
    } finally {
      setIsDeleting(false);
      setConfirmPassword("");
    }
  };

  // -------------------------
  // JSX
  // -------------------------
  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Profile Photo Section */}
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profilePhotoPreview || ""} />
                  <AvatarFallback className="text-lg">
                    {(Name || "J").charAt(0)}
                    {(lastName || "A").charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <input
                    id="upload-photo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("upload-photo").click()}
                  >
                    Change Photo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    JPG, PNG or GIF. Max 2MB.
                  </p>
                </div>
              </div>

              {/* Name & Last Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="Name">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="Name"
                    value={Name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Optional Phone Number */}
              <div>
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="number"
                  value={phone_number}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Only numbers are allowed
                </p>
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSaveProfile}
                className="w-full px-4 py-2 rounded-lg font-semibold transition-all
        text-white 
        bg-red-500 hover:bg-red-600
        dark:bg-sky-700 dark:hover:bg-sky-600 dark:text-white"
                disabled={!Name || !email || isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Change Password</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Old Password */}
              <div>
                <Label htmlFor="oldPassword">
                  Old Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="oldPassword"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className={showPasswordValidation && !oldPassword ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {showPasswordValidation && !oldPassword && (
                  <p className="text-xs text-red-500 mt-1">Old password is required</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <Label htmlFor="newPassword">
                  New Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={showPasswordValidation && !newPassword ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {showPasswordValidation && !newPassword && (
                  <p className="text-xs text-red-500 mt-1">New password is required</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirmNewPassword">
                  Confirm Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className={showPasswordValidation && !confirmNewPassword ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {showPasswordValidation && !confirmNewPassword && (
                  <p className="text-xs text-red-500 mt-1">Please confirm your password</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleChangePassword}
                className="w-full px-4 py-2 rounded-lg font-semibold transition-all
        text-white 
        bg-red-500 hover:bg-red-600
        dark:bg-sky-700 dark:hover:bg-sky-600 dark:text-white"
                disabled={!oldPassword || !newPassword || !confirmNewPassword || isChangingPassword}
              >
                {isChangingPassword ? "Changing..." : "Change Password"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Avatar className="h-16 w-16 mx-auto mb-3">
                  <AvatarImage src={profilePhotoPreview || ""} />
                  <AvatarFallback>
                    {(Name || "J").charAt(0)}
                    {(lastName || "A").charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold">{Name} {lastName}</h3>
                <p className="text-sm text-muted-foreground">{email}</p>
                <Badge className=" mt-2 px-4 py-2 rounded-lg font-semibold transition-all
    text-white
    bg-red-500 hover:bg-red-600
    dark:bg-sky-700 dark:hover:bg-sky-600">Administrator</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <p className="text-sm text-muted-foreground">
              To confirm, type your password below. This action cannot be undone.
            </p>
          </DialogHeader>

          <div className="space-y-3">
            <Label htmlFor="confirmPassword">Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}