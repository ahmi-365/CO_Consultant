const BASE_URL = import.meta.env.VITE_API_URL;

export const starService = {
  // Toggle star for a single file
  toggleStar: async (fileId) => {
    try {
      if (!fileId) throw new Error("File ID is required");
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/starred-files/${fileId}/star`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to toggle star");
      const data = await res.json();
      return data; // API should return current status
    } catch (error) {
      console.error("Error toggling star:", error);
      return { success: false, error: error.message };
    }
  },

  // Get all starred files
  getStarredFiles: async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/starred-files`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch starred files");
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching starred files:", error);
      return { success: false, error: error.message };
    }
  },
};