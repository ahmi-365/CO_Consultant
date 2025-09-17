const BASE_URL = import.meta.env.VITE_API_URL;

export const notificationService = {
  // Get all unread notifications
  getUnreadNotifications: async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/notifications/unread`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      });

      const data = await res.json();
      if (res.ok) return { success: true, data };
      else return { success: false, error: data.message || "Failed to fetch notifications" };
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return { success: false, error: error.message || "Network error" };
    }
  },

  // Mark a notification as read (expects array of IDs)
  markAsRead: async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/notifications/mark-read`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ ids: [notificationId] }), // Send as array
      });

      const data = await res.json();
      if (res.ok) return { success: true, data };
      else return { success: false, error: data.message || "Failed to mark notification as read" };
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return { success: false, error: error.message || "Network error" };
    }
  },

  // Mark multiple notifications as read (batch operation)
  markMultipleAsRead: async (notificationIds) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/notifications/mark-read`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ ids: notificationIds }), // Send array of IDs
      });

      const data = await res.json();
      if (res.ok) return { success: true, data };
      else return { success: false, error: data.message || "Failed to mark notifications as read" };
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      return { success: false, error: error.message || "Network error" };
    }
  },

  // Delete a notification (expects array of IDs)
  deleteNotification: async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/notifications/delete`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ ids: [notificationId] }), // Send as array
      });

      const data = await res.json();
      if (res.ok) return { success: true, data };
      else return { success: false, error: data.message || "Failed to delete notification" };
    } catch (error) {
      console.error("Error deleting notification:", error);
      return { success: false, error: error.message || "Network error" };
    }
  },

  // Delete multiple notifications (batch operation)
  deleteMultipleNotifications: async (notificationIds) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/notifications/delete`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ ids: notificationIds }), // Send array of IDs
      });

      const data = await res.json();
      if (res.ok) return { success: true, data };
      else return { success: false, error: data.message || "Failed to delete notifications" };
    } catch (error) {
      console.error("Error deleting notifications:", error);
      return { success: false, error: error.message || "Network error" };
    }
  },
};