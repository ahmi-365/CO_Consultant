const BASE_URL = 'https://co-consultant.majesticsofts.com/api'; // Replace with your actual backend URL

// Simple encryption for cache data
const encryptData = (data) => {
  const jsonString = JSON.stringify(data);
  return btoa(encodeURIComponent(jsonString));
};

const decryptData = (encrypted) => {
  try {
    const jsonString = decodeURIComponent(atob(encrypted));
    return JSON.parse(jsonString);
  } catch (error) {
    return null;
  }
};

// Enhanced file cache for performance optimization with encryption
class FileCache {
  constructor() {
    this.cache = new Map();
    this.CACHE_KEY = 'fmc_t';
    this.CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours for file lists
    this.FOLDER_CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days for folder structure
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.CACHE_KEY);
      if (stored) {
        const decryptedData = decryptData(stored);
        if (decryptedData) {
          const { data, timestamp } = decryptedData;
          // Check if cache is still valid
          if (Date.now() - timestamp < this.CACHE_EXPIRY) {
            this.cache = new Map(data.map(([key, value]) => {
              // Check individual item expiry for folders vs files
              const itemExpiry = key.includes('folder_') ? this.FOLDER_CACHE_EXPIRY : this.CACHE_EXPIRY;
              if (value.timestamp && Date.now() - value.timestamp < itemExpiry) {
                return [key, value];
              }
              return null;
            }).filter(Boolean));
          } else {
            localStorage.removeItem(this.CACHE_KEY);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
    }
  }

  saveToStorage() {
    try {
      const data = {
        data: Array.from(this.cache.entries()),
        timestamp: Date.now()
      };
      const encrypted = encryptData(data);
      localStorage.setItem(this.CACHE_KEY, encrypted);
    } catch (error) {
      console.warn('Failed to save cache to storage:', error);
    }
  }

  get(key) {
    const cached = this.cache.get(key);
    return cached ? cached.data : undefined;
  }

  set(key, value) {
    // Add timestamp to cached items
    const cachedValue = {
      data: value,
      timestamp: Date.now()
    };
    this.cache.set(key, cachedValue);
    this.saveToStorage();
  }

  delete(key) {
    this.cache.delete(key);
    this.saveToStorage();
  }

  clear() {
    this.cache.clear();
    localStorage.removeItem(this.CACHE_KEY);
  }

  has(key) {
    return this.cache.has(key);
  }
}

const fileCache = new FileCache();

// File Management API
export const fileApi = {
  // List files and folders with enhanced caching
  async listFiles(parent_id) {
    const cacheKey = `files_${parent_id || 'root'}`;
    
    // Check cache first for instant access
    const cached = fileCache.get(cacheKey);
    if (cached) {
      console.log('🚀 Loading from cache:', cacheKey);
      return cached;
    }

    const url = parent_id 
      ? `${BASE_URL}/onedrive/list?parent_id=${parent_id}`
      : `${BASE_URL}/onedrive/list`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch files');
    }
    
    const data = await response.json();
    const safeData = Array.isArray(data) 
      ? data 
      : Array.isArray(data?.data) 
        ? data.data 
        : [];

    // Cache the complete file list for instant access
    fileCache.set(cacheKey, safeData);
    
    // Cache folder hierarchy for navigation (longer expiry)
    const folderNamesKey = `folder_names_${parent_id || 'root'}`;
    const folderNames = safeData
      .filter((item) => item?.type === 'folder')
      .map((item) => ({ id: item.id, name: item.name }));
    fileCache.set(folderNamesKey, folderNames);
    
    console.log('💾 Cached files for instant access:', cacheKey);
    return safeData;
  },

  // Create folder
  async createFolder(name, parent_id) {
    const response = await fetch(`${BASE_URL}/onedrive/folders/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, parent_id }),
    });

    if (!response.ok) {
      throw new Error('Failed to create folder');
    }

    const result = await response.json();
    
    // Invalidate cache for parent folder and related caches
    const cacheKey = `files_${parent_id || 'root'}`;
    const folderNamesKey = `folder_names_${parent_id || 'root'}`;
    fileCache.delete(cacheKey);
    fileCache.delete(folderNamesKey);
    
    return result.data;
  },

  // Upload file
  async uploadFile(file, parent_id) {
    const formData = new FormData();
    formData.append('file', file);
    if (parent_id) {
      formData.append('parent_id', parent_id.toString());
    }

    const response = await fetch(`${BASE_URL}/onedrive/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }

    const result = await response.json();
    
    // Invalidate cache for parent folder and related caches
    const cacheKey = `files_${parent_id || 'root'}`;
    const folderNamesKey = `folder_names_${parent_id || 'root'}`;
    fileCache.delete(cacheKey);
    fileCache.delete(folderNamesKey);
    
    return result.data;
  },

  // Delete item
  async deleteItem(id) {
    const response = await fetch(`${BASE_URL}/onedrive/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete item');
    }

    // Clear entire cache since we don't know the parent
    fileCache.clear();
  },

  // Move item - enhanced implementation matching API documentation
async moveItem(id, new_parent_id) {
  const token = localStorage.getItem('token');
  const url = `https://co-consultant.majesticsofts.com/api/onedrive/move/${id}`;

  console.log("📦 moveItem called with:", { id, new_parent_id });
  console.log("🌍 URL:", url);
  console.log("🔑 Token exists:", !!token);

  if (!token) {
    throw new Error("No auth token found — please login again");
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',                     // <-- Ensure CORS mode is set
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        new_parent_id: new_parent_id ? parseInt(new_parent_id) : null,
      }),
    }).catch((err) => {
      console.error("🌐 Network request failed before reaching server:", err);
      throw new Error("Network request failed (likely CORS or DNS issue)");
    });

    if (!response) {
      throw new Error("No response received — likely blocked by CORS");
    }

    console.log("📥 Move response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ Server responded with error:", errorData);
      throw new Error(errorData.message || `Move failed with status ${response.status}`);
    }

    const result = await response.json().catch(() => null);
    console.log("✅ Move successful:", result);

    fileCache.clear();
    return result?.data || result;

  } catch (err) {
    console.error("🚨 moveItem failed:", err.message, err);
    throw err;
  }
}
,

  // Rename item
  async renameItem(id, newName) {
    const response = await fetch(`${BASE_URL}/onedrive/rename/${id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newName }),
    });

    if (!response.ok) {
      throw new Error('Failed to rename item');
    }

    // Clear cache to refresh data
    fileCache.clear();
  },

  // Get download URL
  async getDownloadUrl(id) {
    const response = await fetch(`${BASE_URL}/onedrive/file/${id}/download-url`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get download URL');
    }

    const result = await response.json();
    return result.url;
  },

  // Download file directly using backend download_url
  async downloadFile(id, filename) {
    try {
      // Get the file with download_url from backend
      const filesData = getCachedFiles(null) || [];
      let fileItem = this.findFileInCache(filesData, id);
      
      if (!fileItem || !fileItem.download_url) {
        // Fallback to API call if not in cache
        const downloadUrl = await this.getDownloadUrl(id);
        this.downloadViaDirectLink(downloadUrl, filename);
        return;
      }
      
      this.downloadViaDirectLink(fileItem.download_url, filename);
    } catch (error) {
      console.error('Download error:', error);
      throw new Error('Failed to download file');
    }
  },

  // Helper method to find file in cache recursively
  findFileInCache(files, targetId) {
    for (const file of files) {
      if (file.id === targetId) {
        return file;
      }
      if (file.items && Array.isArray(file.items)) {
        const found = this.findFileInCache(file.items, targetId);
        if (found) return found;
      }
    }
    return null;
  },

  // Direct download using browser's built-in download
  downloadViaDirectLink(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Fallback download method for when blob approach fails
  downloadViaIframe(url, filename) {
    // Create temporary iframe for download
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);
    
    // Remove iframe after some time
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 5000);
    
    // Also try direct window open as additional fallback
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Sync files
  async syncFiles() {
    const response = await fetch(`${BASE_URL}/onedrive/sync`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to sync files');
    }

    // Clear cache after sync
    fileCache.clear();
  },
};

// Quick access to cached lists
export const getCachedFiles = (parent_id) => {
  const cacheKey = `files_${parent_id || 'root'}`;
  return fileCache.get(cacheKey);
};

// Permissions API - Enhanced implementation matching provided API documentation
export const permissionsApi = {
  // Get file permissions - returns array of permission objects
  async getFilePermissions(file_id) {
    const response = await fetch(`${BASE_URL}/files/permissions/list/${file_id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch permissions');
    }

    const data = await response.json();
    // Ensure we return an array format as per API docs
    return Array.isArray(data) ? data : [];
  },

  // Assign permission - grant specific permissions to users
async assignPermission(file_id, user_id, permission) {
  const url = `${BASE_URL}/files/permissions/assign`;
  const token = localStorage.getItem('token');
  const payload = {
    file_id: parseInt(file_id),
    user_id,
    permission
  };

  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });


    const duration = Date.now() - startTime;

    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch {
        console.warn("⚠️ Could not parse error JSON");
      }
      console.error("❌ Server responded with error:", errorData);
      throw new Error(errorData.message || 'Failed to assign permission');
    }

    const data = await response.json();

    return data;
  } catch (err) {
    console.error("Network/Fetch failed:", err?.message || err);
    throw err;
  }
}

,
  // Remove permission - revoke specific permissions from users
  async removePermission(file_id, user_id, permission) {
    const response = await fetch(`${BASE_URL}/files/permissions/remove`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        file_id: parseInt(file_id), // Ensure numeric type as per API spec
        user_id, 
        permission 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to remove permission');
    }

    return response.json();
  },

  // Get user permissions - get all file permissions for a specific user
  async getUserPermissions(user_id) {
    const response = await fetch(`${BASE_URL}/files/permissions/user/${user_id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user permissions');
    }

    const data = await response.json();
    // Ensure we return an array format as per API docs
    return Array.isArray(data) ? data : [];
  },
};

// Utility functions
export const getFileIcon = (filename, type) => {
  if (type === 'folder') return 'folder';
  
  const extension = filename.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return 'file-text';
    case 'doc':
    case 'docx':
      return 'file-text';
    case 'xls':
    case 'xlsx':
      return 'file-spreadsheet';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
      return 'image';
    case 'mp4':
    case 'avi':
    case 'mov':
      return 'video';
    case 'mp3':
    case 'wav':
    case 'ogg':
      return 'music';
    case 'zip':
    case 'rar':
    case '7z':
      return 'archive';
    default:
      return 'file';
  }
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// File types (for documentation/reference - not enforced in JavaScript)
/*
FileItem structure:
{
  id: string,
  name: string,
  type: 'file' | 'folder',
  size?: number,
  created_at: string,
  updated_at?: string,
  owner?: {
    id: number,
    name: string
  },
  items?: FileItem[]
}
*/