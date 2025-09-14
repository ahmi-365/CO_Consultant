const BASE_URL = 'https://co-consultant.majesticsofts.com/api';

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

// Permission definitions
export const PERMISSIONS = {
  READ: 'read',
  CREATE_FOLDER: 'create_folder',
  EDIT: 'edit',
  UPLOAD: 'upload',
  DELETE: 'delete',
  MANAGE: 'manage'
};

// Permission options for UI
export const PERMISSION_OPTIONS = [
  { 
    value: PERMISSIONS.READ, 
    label: 'View Only', 
    description: 'Can view and download files' 
  },
  { 
    value: PERMISSIONS.CREATE_FOLDER, 
    label: 'Create Folders', 
    description: 'Can create new folders' 
  },
  { 
    value: PERMISSIONS.EDIT, 
    label: 'Edit', 
    description: 'Can modify files and folders' 
  },
  { 
    value: PERMISSIONS.UPLOAD, 
    label: 'Upload', 
    description: 'Can upload new files' 
  },
  { 
    value: PERMISSIONS.DELETE, 
    label: 'Delete', 
    description: 'Can remove files and folders' 
  },
  { 
    value: PERMISSIONS.MANAGE, 
    label: 'Full Control', 
    description: 'Can manage all permissions' 
  }
];

// Helper functions
export const getUserInitials = (name) => {
  return name.split(' ')
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
    case PERMISSIONS.READ: 
      return 'bg-secondary text-secondary-foreground';
    case PERMISSIONS.CREATE_FOLDER: 
      return 'bg-primary-light text-primary';
    case PERMISSIONS.EDIT: 
      return 'bg-warning-light text-warning';
    case PERMISSIONS.UPLOAD: 
      return 'bg-success-light text-success';
    case PERMISSIONS.DELETE: 
      return 'bg-destructive-light text-destructive';
    case PERMISSIONS.MANAGE: 
      return 'bg-accent-light text-accent';
    default: 
      return 'bg-muted text-muted-foreground';
  }
};