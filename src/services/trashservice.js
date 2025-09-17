const BASE_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('token'); 

export const trashService = {
  // Get all trashed files
  getTrashedFiles: async () => {
    try {
      const res = await fetch(`${BASE_URL}/onedrive/trashed`);
      if (!res.ok) throw new Error('Failed to fetch trashed files');
      return await res.json();
    } catch (error) {
      console.error('Failed to get trashed files:', error);
      throw error;
    }
  },

  // Move single file to trash
  moveToTrash: async (fileId) => {
    try {
      if (!fileId) throw new Error('File ID is required');
      const res = await fetch(`${BASE_URL}/onedrive/trash/${fileId}`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to move file to trash');
      return await res.json();
    } catch (error) {
      console.error('Failed to move file to trash:', error);
      return { success: false, error: error.message };
    }
  },
bulkMoveToTrash: async (fileIds) => {
  try {
    const token = localStorage.getItem("token");

    if (!Array.isArray(fileIds) || fileIds.length === 0)
      throw new Error("File IDs array is required");

    const res = await fetch(`${BASE_URL}/onedrive/bulk-trash`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ file_ids: fileIds }) // correct key
    });

    const data = await res.json();

    // backend sometimes returns nested original object
    const message =
      (data.original && data.original.message) || data.message || "Operation completed";

    // check status
    if (data.status && data.status.toLowerCase() === "ok") {
      return { success: true, message };
    } else {
      return { success: false, error: message };
    }
  } catch (error) {
    return { success: false, error: error.message || "Network error" };
  }
},


  // Restore single file from trash
  restoreFile: async (fileId) => {
    try {
      if (!fileId) throw new Error('File ID is required');
      const res = await fetch(`${BASE_URL}/onedrive/restore/${fileId}`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to restore file');
      return await res.json();
    } catch (error) {
      console.error('Failed to restore file:', error);
      return { success: false, error: error.message };
    }
  },

  // Bulk restore files from trash
  bulkRestoreFiles: async (fileIds) => {
    try {
      if (!Array.isArray(fileIds) || fileIds.length === 0) throw new Error('File IDs array is required');
      const res = await fetch(`${BASE_URL}/onedrive/bulk-restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileIds })
      });
      if (!res.ok) throw new Error('Failed to bulk restore files');
      return await res.json();
    } catch (error) {
      console.error('Failed to bulk restore files:', error);
      return { success: false, error: error.message };
    }
  },

  // Permanently delete single file
  permanentDelete: async (fileId) => {
    try {
      if (!fileId) throw new Error('File ID is required');
      const res = await fetch(`${BASE_URL}/onedrive/delete/${fileId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to permanently delete file');
      return await res.json();
    } catch (error) {
      console.error('Failed to permanently delete file:', error);
      return { success: false, error: error.message };
    }
  }
};
