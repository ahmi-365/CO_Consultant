export const permissionsApi = {
  // Get file permissions - returns array of permission objects
  async getFilePermissions(file_id) {
   console.log("Fetching permissions for file_id:", file_id);
    const response = await fetch(`${BASE_URL}/files/permissions/list/${file_id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });
console.log("Response status:", response.status);
    if (!response.ok) {
      throw new Error('Failed to fetch permissions');
    }
console.log("Response OK, parsing JSON");
    const data = await response.json();
console.log("Fetched permissions data:", data);
    return Array.isArray(data) ? data : [];
    
  },

  // Assign permission - grant specific permissions to users
  async assignPermission(file_id, user_id, permission) {
    const response = await fetch(`${BASE_URL}/files/permissions/assign`, {
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
      throw new Error(errorData.message || 'Failed to assign permission');
    }

    return response.json();
  },

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
