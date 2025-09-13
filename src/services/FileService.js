const BASE_URL = 'https://co-consultant.majesticsofts.com/api'; // Replace with your actual backend URL

// File Management API
export const fileApi = {
  // List files and folders
  async listFiles(parent_id) {
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
    
    return response.json();
  },

  // Create folder
  async createFolder(name, parent_id){
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
  },

  // Move item
  async moveItem(id, new_parent_id){
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
  },

  // Get download URL
  async getDownloadUrl(id){
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
  },
};

// Permissions API
export const permissionsApi = {
  // Get file permissions
  async getFilePermissions(file_id){
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