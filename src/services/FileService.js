const BASE_URL = 'https://co-consultant.majesticsofts.com/api'; // Replace with your actual backend URL

// Enhanced file cache for performance optimization
class FileCache {
  cache = new Map();
  CACHE_KEY = 'file_management_cache';
  CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours for file lists
  FOLDER_CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days for folder structure

  constructor() {
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.CACHE_KEY);
      if (stored) {
        const { data, timestamp } = JSON.parse(stored);
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
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(data));
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

  // Move item
  async moveItem(id, new_parent_id) {
    const response = await fetch(`${BASE_URL}/onedrive/move/${id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ new_parent_id }),
    });

    if (!response.ok) {
      throw new Error('Failed to move item');
    }

    // Clear cache since item moved between folders
    fileCache.clear();
  },

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

  // Download file directly
  async downloadFile(id, filename) {
    try {
      const downloadUrl = await this.getDownloadUrl(id);
      
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      throw new Error('Failed to download file');
    }
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


// Permissions API
export const permissionsApi = {
  // Get file permissions
  async getFilePermissions(file_id) {
    const response = await fetch(`${BASE_URL}/files/permissions/list/${file_id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch permissions');
    }

    return response.json();
  },

  // Assign permission
  async assignPermission(file_id, user_id, permission) {
    const response = await fetch(`${BASE_URL}/files/permissions/assign`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ file_id, user_id, permission }),
    });

    if (!response.ok) {
      throw new Error('Failed to assign permission');
    }
  },

  // Remove permission
  async removePermission(file_id, user_id, permission) {
    const response = await fetch(`${BASE_URL}/files/permissions/remove`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ file_id, user_id, permission }),
    });

    if (!response.ok) {
      throw new Error('Failed to remove permission');
    }
  },

  // Get user permissions
  async getUserPermissions(user_id) {
    const response = await fetch(`${BASE_URL}/files/permissions/user/${user_id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user permissions');
    }

    return response.json();
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

// File types
