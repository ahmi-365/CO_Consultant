import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

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
// ✅ FIXED VERSION - Replace your listadminFiles function with this:

// ✅ COMPLETE FIXED VERSION with getRootMetadata support

async listadminFiles(parent_id, params = {}, options = {}) {
  const queryParams = new URLSearchParams();
  
  if (parent_id && !params.search) {
    queryParams.append('parent_id', parent_id);
  }
  if (params.id) queryParams.append('id', params.id);
  if (params.search) queryParams.append('search', params.search);
  if (params.user_id) queryParams.append('user_id', params.user_id);
  
  // Add pagination parameters
  if (params.page) queryParams.append('page', params.page);
  if (params.per_page) queryParams.append('per_page', params.per_page);

  const url = `${API_URL}/onedrive/list${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
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
  
  // ✅ FIX: Preserve ALL top-level fields from API response
  return {
    ...data, // Spreads iframe_url, is_iframe, root_id, status, etc.
    data: Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [],
    pagination: data.pagination || {
      current_page: params.page || 1,
      per_page: params.per_page || 10,
      total: data.total || 0,
      total_pages: data.total_pages || 1
    }
  };
},

// ✅ Keep getRootMetadata as backup/alternative method
async getRootMetadata() {
  const url = `${API_URL}/onedrive/list`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch root metadata: ${response.status}`);
  }

  const data = await response.json();
  console.log('📦 getRootMetadata response:', data);
  return data; // Returns full response with iframe_url, is_iframe, etc.
},


async listFiles(parent_id, params = {}, options = {}) {
  const queryParams = new URLSearchParams();
if (parent_id && !params.search) {
  queryParams.append('parent_id', parent_id);
}  if (params.id) queryParams.append('id', params.id);
  if (params.search) queryParams.append('search', params.search);
  if (params.user_id) queryParams.append('user_id', params.user_id);

  const url = `${API_URL}/onedrive/list${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
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

  return safeData;
},

async getFolderTree() {
  const url = `${API_URL}/onedrive/list-tree`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch root metadata: ${response.status}`);
  }

  const data = await response.json();
  // Return the full response object to get iframe_url
  return data;
},

  async createFolder(name, parent_id) {
    const response = await fetch(`${API_URL}/onedrive/folders/create`, {
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
async uploadFile(files, parent_id) {
  const formData = new FormData();
  
  // Handle both single file and array of files
  const fileArray = Array.isArray(files) ? files : [files];
  
  // Append all files with array notation 'files[]'
  // The backend will receive them as an array even for single files
  fileArray.forEach((file) => {
    formData.append('files[]', file);
  });
  
  if (parent_id) {
    formData.append('parent_id', parent_id.toString());
  }

  const response = await fetch(`${API_URL}/onedrive/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
   

    },
    body: formData,

    //  signal: options.signal,
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
    const response = await fetch(`${API_URL}/onedrive/trash/${id}`, {
      method: 'POST',
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
  console.log("moveItem called with:", { id, new_parent_id, id_type: typeof id, parent_type: typeof new_parent_id });
  
  const token = localStorage.getItem('token');
  const url = `${API_URL}/onedrive/move-file`;

  if (!token) throw new Error("No auth token found");

  if (!id) {
    throw new Error("File ID is required");
  }

  // Create FormData object
  const formData = new FormData();
  
  // Ensure we're sending the right values
  const fileId = parseInt(id);
  const parentId = new_parent_id ? parseInt(new_parent_id) : null;
  
  console.log("Parsed values:", { fileId, parentId });
  
  if (isNaN(fileId)) {
    throw new Error(`Invalid file ID: ${id}`);
  }
  
  formData.append('file_id', fileId.toString());
  
  // Handle null parent_id correctly
  if (parentId !== null) {
    if (isNaN(parentId)) {
      throw new Error(`Invalid parent ID: ${new_parent_id}`);
    }
    formData.append('new_parent_id', parentId.toString());
  } else {
    // For root folder, you might need to send empty string or specific value
    // Check what your backend expects for root folder
    formData.append('new_parent_id', '');
  }

  // Debug: log what we're sending
  console.log("FormData contents:");
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value} (type: ${typeof value})`);
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Don't set Content-Type for FormData
    },
    body: formData,
  });

  let result;
  try {
    result = await response.json();
  } catch {
    result = {};
  }

  console.log("API Response:", { status: response.status, result });

  if (!response.ok) {
    let errorMessage = `Move failed with status ${response.status}`;
    if (result.error) {
      if (typeof result.error === 'string') {
        errorMessage = result.error;
      } else if (result.error.message) {
        errorMessage = result.error.message;
      }
    } else if (result.message) {
      errorMessage = result.message;
    }
    console.error("Move API Error:", errorMessage);
    throw new Error(errorMessage);
  }

  fileCache.clear();
  return result;
},
async renameItem(id, newName) {
  try {
    const response = await fetch(`${API_URL}/onedrive/rename/${id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newName }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.message || 'Failed to rename item');
    }

    fileCache.clear();
    return data;
  } catch (error) {
    console.error("Rename item error:", error);
    throw error;
  }
}
,
async getDownloadUrl(id) {
    console.log("getDownloadUrl called with ID:", id);

    // Token ko parse karke log karein
    let rawToken = localStorage.getItem("token");
    console.log("Raw token from localStorage:", rawToken);

    // Agar token JSON ke andar hai to parse karein
    let token;
    try {
      token = JSON.parse(rawToken)?.token || rawToken;
    } catch (e) {
      token = rawToken;
    }
    console.log("Final token being sent:", token);

    const url = `${API_URL}/onedrive/file/${id}/download-url`;
    console.log("Fetching URL:", url);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      });

      console.log("Response status:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response body:", errorText);
        throw new Error(`Failed to get download URL: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Download URL response:", result);
      return result;
    } catch (error) {
      console.error("Error in getDownloadUrl:", error);
      throw error;
    }
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
    const response = await fetch(`${API_URL}/onedrive/sync`, {
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
    const response = await fetch(`${API_URL}/files/permissions/list/${file_id}`, {
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
    const url = `${API_URL}/files/permissions/assign`;
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

  const url = `${API_URL}/onedrive/list${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

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
    const response = await fetch(`${API_URL}/files/permissions/remove`, {
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
    const response = await fetch(`${API_URL}/files/permissions/user/${user_id}`, {
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

export async function fetchRecentFiles() {
  try {
    const response = await axios.get(`${API_URL}/onedrive/recent-files`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    console.log("Full API response:", response.data);
    
    // Based on your network tab, the structure is response.data = {status: "ok", recent_views: [...]}
    const apiData = response.data;
    
    if (apiData.status === "ok" && Array.isArray(apiData.recent_views)) {
      console.log("Fetched recent files:", apiData.recent_views);
      return apiData.recent_views; // Return the array directly
    } else {
      console.log("No recent views found or invalid response structure");
      return [];
    }
  } catch (error) {
    console.error("Failed to fetch recent files:", error);
    throw error;
  }
}