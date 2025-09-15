const BASE_URL = 'https://co-consultant.majesticsofts.com/api';

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

class FileCache {
  constructor() {
    this.cache = new Map();
    this.CACHE_KEY = 'fmc_t';
    this.CACHE_EXPIRY = 24 * 60 * 60 * 1000;
    this.FOLDER_CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000;
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.CACHE_KEY);
      if (stored) {
        const decryptedData = decryptData(stored);
        if (decryptedData) {
          const { data, timestamp } = decryptedData;
          if (Date.now() - timestamp < this.CACHE_EXPIRY) {
            this.cache = new Map(data.map(([key, value]) => {
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

export const fileApi = {
  async listFiles(parent_id, params = {}, options = {}) {
    const userFilter = params.user_id || 'all';
    const cacheKey = `files_${parent_id || 'root'}_${userFilter}`;
    const cached = fileCache.get(cacheKey);
    
    if (cached && !params.user_id && !options.force) {
      return cached;
    }
    
    const queryParams = new URLSearchParams();
    if (parent_id) queryParams.append('parent_id', parent_id);
    if (params.id) queryParams.append('id', params.id);
    if (params.search) queryParams.append('search', params.search);
    if (params.user_id) queryParams.append('user_id', params.user_id);

    const url = `${BASE_URL}/onedrive/list${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });
       
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        throw new Error('Authentication failed or server error. Please check your login status.');
      }
      throw new Error(`Failed to fetch files: ${response.status} ${response.statusText}`);
    }
       
    const data = await response.json();
    const safeData = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

    if (!params.user_id) {
      fileCache.set(cacheKey, safeData);
    }
       
    return safeData;
  },

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
    
    const cacheKey = `files_${parent_id || 'root'}`;
    const folderNamesKey = `folder_names_${parent_id || 'root'}`;
    fileCache.delete(cacheKey);
    fileCache.delete(folderNamesKey);
    
    return result.data;
  },

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
    
    const cacheKey = `files_${parent_id || 'root'}`;
    const folderNamesKey = `folder_names_${parent_id || 'root'}`;
    fileCache.delete(cacheKey);
    fileCache.delete(folderNamesKey);
    
    return result.data;
  },

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

    fileCache.clear();
  },

  async moveItem(id, new_parent_id) {
    const token = localStorage.getItem('token');
    const url = `${BASE_URL}/onedrive/move/${id}`;

    if (!token) {
      throw new Error("No auth token found");
    }

    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        new_parent_id: new_parent_id ? parseInt(new_parent_id) : null,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Move failed with status ${response.status}`);
    }

    const result = await response.json().catch(() => null);
    fileCache.clear();
    return result?.data || result;
  },

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

    fileCache.clear();
  },

  async getDownloadUrl(id) {
    const response = await fetch(`${BASE_URL}/onedrive/file/${id}/download-url`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get download URL: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  },

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

  async syncFiles() {
    const response = await fetch(`${BASE_URL}/onedrive/sync`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to sync files');
    }

    fileCache.clear();
  },
};

export const getCachedFiles = (parent_id) => {
  const cacheKey = `files_${parent_id || 'root'}`;
  return fileCache.get(cacheKey);
};

export const permissionsApi = {
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
    return Array.isArray(data) ? data : [];
  },

  async assignPermission(file_id, user_id, permission) {
    const url = `${BASE_URL}/files/permissions/assign`;
    const token = localStorage.getItem('token');
    const payload = {
      file_id: parseInt(file_id),
      user_id,
      permission
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to assign permission');
    }

    return response.json();
  },
async listFilesNoUser(parent_id, options = {}) {
  const cacheKey = `files_${parent_id || 'root'}`;
  const cached = fileCache.get(cacheKey);

  if (cached && !options.force) {
    return cached;
  }

  const queryParams = new URLSearchParams();
  if (parent_id) queryParams.append('parent_id', parent_id);

  const url = `${BASE_URL}/onedrive/list${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      throw new Error('Authentication failed or server error. Please check your login status.');
    }
    throw new Error(`Failed to fetch files: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const safeData = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

  fileCache.set(cacheKey, safeData);

  return safeData;
}
,
  async removePermission(file_id, user_id, permission) {
    const response = await fetch(`${BASE_URL}/files/permissions/remove`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        file_id: parseInt(file_id),
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
    return Array.isArray(data) ? data : [];
  },
};

export const getFileIcon = (filename, type) => {
  if (type === 'folder') return 'folder';
  
  const extension = filename.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf': return 'file-text';
    case 'doc':
    case 'docx': return 'file-text';
    case 'xls':
    case 'xlsx': return 'file-spreadsheet';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg': return 'image';
    case 'mp4':
    case 'avi':
    case 'mov': return 'video';
    case 'mp3':
    case 'wav':
    case 'ogg': return 'music';
    case 'zip':
    case 'rar':
    case '7z': return 'archive';
    default: return 'file';
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