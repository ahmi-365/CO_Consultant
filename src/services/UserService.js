const BASE_URL = import.meta.env.VITE_API_URL;

// User Management API
export const userApi = {
  // Get all users with pagination support
  async getAllUsers() {
    const response = await fetch(`${BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return response.json();
  },

  // Get single user by ID
  async getUser(userId) {
    const response = await fetch(`${BASE_URL}/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    return response.json();
  },

  // Create new user
  async createUser(userData) {
    const response = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create user');
    }

    return response.json();
  },

  // Update existing user
  async updateUser(userId, userData) {
    const response = await fetch(`${BASE_URL}/users/${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...userData,
        _method: 'put'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update user');
    }

    return response.json();
  },

  // Delete user
  async deleteUser(userId) {
    const response = await fetch(`${BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete user');
    }

    return response.json();
  },

  // Search users by name or email (client-side filtering for now)
  async searchUsers(query) {
    const allUsers = await this.getAllUsers();
    const users = Array.isArray(allUsers) ? allUsers : allUsers.data || [];
    
    if (!query.trim()) {
      return users;
    }

    const searchTerm = query.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm)
    );
  }
};

// User role definitions
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager', 
  USER: 'user'
};

// Permission definitions - Updated to match your backend enums
export const PERMISSIONS = {
  OWNER: 'owner',
  VIEW: 'view',
  UPLOAD: 'upload',
  EDIT: 'edit',
  DELETE: 'delete',
  CREATE_FOLDER: 'create_folder'
};

// Permission options for UI - Updated to match backend enums
export const PERMISSION_OPTIONS = [
  { 
    value: PERMISSIONS.OWNER, 
    label: 'Owner', 
    description: 'Full control over the file/folder',
    icon: '👑',
    priority: 1
  },
  { 
    value: PERMISSIONS.VIEW, 
    label: 'View', 
    description: 'Can view and download files',
    icon: '👁️',
    priority: 2
  },
  { 
    value: PERMISSIONS.EDIT, 
    label: 'Edit', 
    description: 'Can modify file content and properties',
    icon: '✏️',
    priority: 3
  },
  { 
    value: PERMISSIONS.UPLOAD, 
    label: 'Upload', 
    description: 'Can upload new files to folders',
    icon: '📤',
    priority: 4
  },
  { 
    value: PERMISSIONS.CREATE_FOLDER, 
    label: 'Create Folder', 
    description: 'Can create new folders and subfolders',
    icon: '📁',
    priority: 5
  },
  { 
    value: PERMISSIONS.DELETE, 
    label: 'Delete', 
    description: 'Can remove files and folders permanently',
    icon: '🗑️',
    priority: 6
  }
];

// Helper functions
export const getUserInitials = (name) => {
  if (!name || typeof name !== 'string') return 'U';
  
  return name.split(' ')
    .filter(part => part.length > 0)
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getRoleColor = (role) => {
  switch (role) {
    case USER_ROLES.ADMIN:
      return 'bg-red-100 text-red-800 border-red-200';
    case USER_ROLES.MANAGER:  
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case USER_ROLES.USER:
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getPermissionColor = (permission) => {
  switch (permission) {
    case PERMISSIONS.OWNER: 
      return 'bg-red-100 text-red-800 border-red-200';
    case PERMISSIONS.VIEW: 
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case PERMISSIONS.EDIT: 
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case PERMISSIONS.UPLOAD: 
      return 'bg-green-100 text-green-800 border-green-200';
    case PERMISSIONS.CREATE_FOLDER: 
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case PERMISSIONS.DELETE: 
      return 'bg-red-100 text-red-800 border-red-200';
    default: 
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Get permission details by value
export const getPermissionDetails = (permissionValue) => {
  return PERMISSION_OPTIONS.find(p => p.value === permissionValue) || {
    value: permissionValue,
    label: permissionValue.charAt(0).toUpperCase() + permissionValue.slice(1),
    description: 'Unknown permission',
    icon: '❓',
    priority: 99
  };
};

// Check if user has specific permission
export const hasPermission = (userPermissions = [], requiredPermission) => {
  if (!Array.isArray(userPermissions)) return false;
  
  // Owner has all permissions
  if (userPermissions.includes(PERMISSIONS.OWNER)) return true;
  
  // Check for specific permission
  return userPermissions.includes(requiredPermission);
};

// Get highest priority permission for display
export const getHighestPermission = (userPermissions = []) => {
  if (!Array.isArray(userPermissions) || userPermissions.length === 0) return null;
  
  const permissionPriorities = userPermissions
    .map(perm => getPermissionDetails(perm))
    .sort((a, b) => a.priority - b.priority);
  
  return permissionPriorities[0] || null;
};

// Format permissions for display
export const formatPermissionsDisplay = (userPermissions = [], maxDisplay = 3) => {
  if (!Array.isArray(userPermissions)) return { visible: [], hidden: 0 };
  
  const sorted = userPermissions
    .map(perm => getPermissionDetails(perm))
    .sort((a, b) => a.priority - b.priority);
  
  return {
    visible: sorted.slice(0, maxDisplay),
    hidden: Math.max(0, sorted.length - maxDisplay)
  };
};