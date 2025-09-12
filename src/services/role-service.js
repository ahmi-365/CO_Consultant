export const roleService = {
  // ✅ Get all roles
  async getAll() {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/roles`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const result = await res.json();

      if (!res.ok) {
        return { success: false, message: result.message || "Failed to fetch roles" };
      }

      console.log("Fetched roles:", result);
      return { success: true, data: result };
    } catch (err) {
      console.error("❌ Get roles error:", err);
      return { success: false, message: "Something went wrong" };
    }
  },

  // ✅ Get single role by ID
  async getById(id) {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/roles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const result = await res.json();

      if (!res.ok) {
        return { success: false, message: result.message || "Failed to fetch role" };
      }

      return { success: true, data: result };
    } catch (err) {
      console.error("❌ Get role by ID error:", err);
      return { success: false, message: "Something went wrong" };
    }
  },

  // ✅ Create role
  async create(data) {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/roles`, {
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
        return { success: false, message: result.message || "Failed to create role" };
      }

      return { success: true, data: result };
    } catch (err) {
      console.error("❌ Create role error:", err);
      return { success: false, message: "Something went wrong" };
    }
  },

  // ✅ Update role
  async update(id, data) {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/roles/${id}`, {
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
        return { success: false, message: result.message || "Failed to update role" };
      }

      return { success: true, data: result };
    } catch (err) {
      console.error("❌ Update role error:", err);
      return { success: false, message: "Something went wrong" };
    }
  },

  // ✅ Delete role
  async delete(id) {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/roles/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const result = await res.json().catch(() => null);

      if (!res.ok) {
        return { success: false, message: result?.message || "Failed to delete role" };
      }

      return { success: true, message: result?.message || "Role deleted successfully" };
    } catch (err) {
      console.error("❌ Delete role error:", err);
      return { success: false, message: "Something went wrong" };
    }
  },
};
