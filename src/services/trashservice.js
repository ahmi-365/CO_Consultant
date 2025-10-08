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

  // Move single file to trash
  async moveToTrash(fileId) {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    try {
      const res = await fetch(`${BASE_URL}/onedrive/trash/${fileId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to move file to trash");
      
      const data = await res.json();

      // Laravel response unwrap
      const normalized = data.original || data;

      return {
        success: normalized.status === "success" || normalized.status === "ok",
        message: normalized.message || "File moved to trash successfully",
        data: normalized,
        original: data,
      };
    } catch (error) {
      console.error("Failed to move file to trash:", error);
      return { success: false, error: error.message };
    }
  },

  // Restore single file from trash
  restoreFile: async (fileId) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    try {
      const res = await fetch(`${BASE_URL}/onedrive/restore/${fileId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to restore file");
      
      const data = await res.json();
      console.log("🔄 RestoreFile raw response:", data);

      // Handle different response structures
      const normalized = data.original || data;
      
      return {
        status: normalized.status === "ok" || normalized.status === "success" ? "success" : "error",
        message: normalized.message || "File restored successfully",
        original: data,
      };
    } catch (error) {
      console.error("Failed to restore file:", error);
      return { 
        status: "error", 
        message: error.message,
        original: { message: error.message }
      };
    }
  },

  // Permanently delete single file
  permanentDelete: async (fileId) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    try {
      const res = await fetch(`${BASE_URL}/onedrive/delete/${fileId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to permanently delete file");
      
      const data = await res.json();
      console.log("🗑️ PermanentDelete raw response:", data);

      const normalized = data.original || data;
      
      return {
        success: normalized.status === "success" || normalized.status === "ok",
        message: normalized.message || "File permanently deleted",
        data: normalized,
      };
    } catch (error) {
      console.error("Failed to permanently delete file:", error);
      return { success: false, error: error.message };
    }
  },

  // Bulk move to trash
  bulkMoveToTrash: async (fileIds) => {
    const token = localStorage.getItem("token");
    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      throw new Error("File IDs array is required");
    }

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

      if (!res.ok) throw new Error("Failed to bulk move to trash");
      
      const data = await res.json();
      const normalized = data.original || data;
      const message = normalized.message || "Files moved to trash successfully";
      
      return {
        success: normalized.status === "ok" || normalized.status === "success",
        message,
        original: data,
      };
    } catch (error) {
      console.error("Failed to bulk move to trash:", error);
      return { success: false, error: error.message };
    }
  },

  // Bulk restore files
  bulkRestoreFiles: async (fileIds) => {
    const token = localStorage.getItem("token");
    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      throw new Error("File IDs array is required");
    }

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
      
      const data = await res.json();
      console.log("🔄 BulkRestore raw response:", data);
      
      const normalized = data.original || data;
      
      return {
        success: normalized.status === "success" || normalized.status === "ok",
        message: normalized.message || "Files restored successfully",
        original: data,
      };
    } catch (error) {
      console.error("Failed to bulk restore files:", error);
      return { 
        success: false, 
        error: error.message,
        original: { message: error.message }
      };
    }
  },

  // Bulk permanent delete
  bulkPermanentDelete: async (fileIds) => {
    const token = localStorage.getItem("token");
    
    // Handle both single ID and array of IDs
    const idsArray = Array.isArray(fileIds) ? fileIds : [fileIds];
    
    if (idsArray.length === 0) {
      throw new Error("File IDs array is required");
    }

    try {
      const res = await fetch(`${BASE_URL}/onedrive/bulk-delete`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ file_ids: idsArray }),
      });

      if (!res.ok) throw new Error("Failed to bulk delete files");
      
      const data = await res.json();
      console.log("🗑️ BulkDelete raw response:", data);
      
      const normalized = data.original || data;
      
      return {
        success: normalized.status === "success" || normalized.status === "ok",
        message: normalized.message || "Files permanently deleted",
        original: data,
      };
    } catch (error) {
      console.error("Failed to bulk delete files:", error);
      return { 
        success: false, 
        error: error.message,
        original: { message: error.message }
      };
    }
  },
};