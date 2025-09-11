export const userService = {
  // ✅ Get all users
  async getAll() {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const result = await res.json();

      if (!res.ok) {
        return { success: false, message: result.message || "Failed to fetch users" };
      }
console.log("Fetched users:", result);
      return { success: true, data: result };
    } catch (err) {
      console.error("❌ Get users error:", err);
      return { success: false, message: "Something went wrong" };
    }
  },

  // ✅ Get single user
  async getById(id) {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const result = await res.json();

      if (!res.ok) {
        return { success: false, message: result.message || "Failed to fetch user" };
      }

      return { success: true, data: result };
    } catch (err) {
      console.error("❌ Get user by ID error:", err);
      return { success: false, message: "Something went wrong" };
    }
  },

  // ✅ Create user
  async create(data) {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        return { success: false, message: result.message || "Failed to create user" };
      }

      return { success: true, data: result };
    } catch (err) {
      console.error("❌ Create user error:", err);
      return { success: false, message: "Something went wrong" };
    }
  },

  // ✅ Update user
  async update(id, data) {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        return { success: false, message: result.message || "Failed to update user" };
      }

      return { success: true, data: result };
    } catch (err) {
      console.error("❌ Update user error:", err);
      return { success: false, message: "Something went wrong" };
    }
  },

  // ✅ Delete user
  async delete(id) {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const result = await res.json();
        return { success: false, message: result.message || "Failed to delete user" };
      }

      return { success: true, message: "User deleted successfully" };
    } catch (err) {
      console.error("❌ Delete user error:", err);
      return { success: false, message: "Something went wrong" };
    }
  },
};
