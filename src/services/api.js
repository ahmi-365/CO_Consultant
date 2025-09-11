// src/services/api.js

export const apiService = {
  // ---------- Files ----------
  getFiles: async (folderId) => {
    const res = await fetch(`/api/files?folderId=${folderId}`);
    if (!res.ok) throw new Error("Failed to fetch files");
    const data = await res.json();
    return { success: true, data };
  },

  uploadFile: async (file, folderId) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folderId", folderId);

    const res = await fetch("/api/files/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to upload file");
    const data = await res.json();
    return { success: true, data };
  },

  deleteFile: async (fileId) => {
    const res = await fetch(`/api/files/${fileId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete file");
    return { success: true };
  },

  starFile: async (fileId) => {
    const res = await fetch(`/api/files/${fileId}/star`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to star file");
    return { success: true };
  },

  downloadFile: async (fileId) => {
    const res = await fetch(`/api/files/${fileId}/download`);
    if (!res.ok) throw new Error("Failed to download file");
    return { success: true };
  },

  moveToTrash: async (fileId) => {
    const res = await fetch(`/api/files/${fileId}/trash`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to move file to trash");
    return { success: true };
  },

  shareFile: async (fileId, email) => {
    const res = await fetch(`/api/files/${fileId}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error("Failed to share file");
    return { success: true };
  },

  moveFile: async (fileId, folderId) => {
    const res = await fetch(`/api/files/${fileId}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderId }),
    });
    if (!res.ok) throw new Error("Failed to move file");
    return { success: true };
  },

  // ---------- Folders ----------
  getFolders: async (parentId = "") => {
    const res = await fetch(`/api/folders?parentId=${parentId}`);
    if (!res.ok) throw new Error("Failed to fetch folders");
    const data = await res.json();
    return { success: true, data };
  },

  createFolder: async (name, parentId) => {
    const res = await fetch(`/api/folders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, parentId }),
    });
    if (!res.ok) throw new Error("Failed to create folder");
    const data = await res.json();
    return { success: true, data };
  },

  deleteFolder: async (folderId) => {
    const res = await fetch(`/api/folders/${folderId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete folder");
    return { success: true };
  },
};
export const FileItem = {};
export const FolderItem = {};