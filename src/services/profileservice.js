const BASE_URL = import.meta.env.VITE_API_URL;

export const profileService = {
  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/profile/update`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(profileData),
      });

      const data = await res.json();

      if (res.ok) {
        return { success: true, data };
      } else {
        return {
          success: false,
          error: data.message || "Failed to update profile",
        };
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      return { success: false, error: error.message || "Network error" };
    }
  },

  // Get user's storage usage
  getStorageUsage: async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/onedrive/storage-usage`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();

      if (res.ok) {
        return { success: true, data };
      } else {
        return {
          success: false,
          error: data.message || "Failed to fetch storage usage",
        };
      }
    } catch (error) {
      console.error("Error fetching storage usage:", error);
      return { success: false, error: error.message || "Network error" };
    }
  },

  // ✅ Update user password
  updatePassword: async (passwordData) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/password/update`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(passwordData),
      });

      const data = await res.json();

      if (res.ok) {
        return { success: true, data };
      } else {
        return {
          success: false,
          error: data.message || "Failed to update password",
        };
      }
    } catch (error) {
      console.error("Error updating password:", error);
      return { success: false, error: error.message || "Network error" };
    }
  },
};
