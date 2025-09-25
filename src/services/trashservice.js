const BASE_URL = import.meta.env.VITE_API_URL;
export const trashService = {
  getTrashedFiles: async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    try {
      const res = await fetch(`${BASE_URL}/onedrive/trashed`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch trashed files");
      return await res.json();
    } catch (error) {
      console.error("Failed to get trashed files:", error);
      throw error;
    }
  },

async moveToTrash(fileId) {
  const res = await fetch(`${BASE_URL}/onedrive/trash/${fileId}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  console.log("📦 MoveToTrash raw response:", data);

  // Laravel response unwrap
  const normalized = data.original || data;

  const response = {
    success: normalized.status === "success" || normalized.status === "ok",
    message: normalized.message || "Action completed",
    data: normalized,
  };

  console.log("📦 Normalized Trash Response:", response);
  return response;
}

,

  bulkMoveToTrash: async (fileIds) => {
    const token = localStorage.getItem("token");
    if (!Array.isArray(fileIds) || fileIds.length === 0)
      throw new Error("File IDs array is required");

    try {
      const res = await fetch(`${BASE_URL}/onedrive/bulk-trash`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ file_ids: fileIds }),
      });
      const data = await res.json();
      const message =
        (data.original && data.original.message) || data.message || "Operation completed";
      if (data.status && data.status.toLowerCase() === "ok") {
        return { success: true, message };
      } else {
        return { success: false, error: message };
      }
    } catch (error) {
      return { success: false, error: error.message || "Network error" };
    }
  },



  bulkRestoreFiles: async (fileIds) => {
    const token = localStorage.getItem("token");
    if (!Array.isArray(fileIds) || fileIds.length === 0)
      throw new Error("File IDs array is required");

    try {
      const res = await fetch(`${BASE_URL}/onedrive/bulk-restore`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ file_ids: fileIds }),
      });
      if (!res.ok) throw new Error("Failed to bulk restore files");
      return await res.json();
    } catch (error) {
      console.error("Failed to bulk restore files:", error);
      return { success: false, error: error.message };
    }
  },


  bulkPermanentDelete: async (fileIds) => {
    const token = localStorage.getItem("token");
    if (!Array.isArray(fileIds) || fileIds.length === 0)
      throw new Error("File IDs array is required");

    try {
      const res = await fetch(`${BASE_URL}/onedrive/bulk-delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ file_ids: fileIds }),
      });
      if (!res.ok) throw new Error("Failed to bulk delete files");
      return await res.json();
    } catch (error) {
      console.error("Failed to bulk delete files:", error);
      return { success: false, error: error.message };
    }
  },
};