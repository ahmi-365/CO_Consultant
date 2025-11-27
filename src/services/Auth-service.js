// services/Auth-service.ts
export const authService = {
  // Register user
  async register(data) {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        return {
          success: false,
          message: result.message || "Registration failed",
          data: result,
        };
      }

      // ✅ Return full API data (so token & user reach frontend)
      return result;
    } catch (err) {
      console.error("❌ Register error:", err);
      return { success: false, message: "Something went wrong" };
    }
  },

  // Login user
  async login(data) {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok || result.status !== "success") {
        return { success: false, message: result.message || "Login failed" };
      }

      // Save token + user in localStorage with expiration
      if (result.authorisation?.token) {
        const expiresIn = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        const expiresAt = new Date().getTime() + expiresIn;
        
        localStorage.setItem("token", result.authorisation.token);
        localStorage.setItem("user", JSON.stringify(result.user));
        localStorage.setItem("token_expires_at", expiresAt.toString());
      }

      return { success: true };
    } catch (err) {
      console.error("❌ Login error:", err);
      return { success: false, message: "Something went wrong" };
    }
  },

  getUser() {
    const user = localStorage.getItem("user");
    // Check if token is expired before returning user
    if (this.isTokenExpired()) {
      this.logout();
      return null;
    }
    return user ? JSON.parse(user) : null;
  },

  getToken() {
    // Check if token is expired before returning
    if (this.isTokenExpired()) {
      this.logout();
      return null;
    }
    return localStorage.getItem("token");
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("token_expires_at");
  },

  // NEW: Check if token is expired
  isTokenExpired() {
    const expiresAt = localStorage.getItem("token_expires_at");
    if (!expiresAt) return true; // No expiration time means expired
    
    const now = new Date().getTime();
    return now > parseInt(expiresAt);
  },

  // NEW: Clear auth data (alias for logout)
  clearAuth() {
    this.logout();
  },

  // NEW: Get remaining time until token expires (in milliseconds)
  getTokenExpirationTime() {
    const expiresAt = localStorage.getItem("token_expires_at");
    if (!expiresAt) return 0;
    
    const now = new Date().getTime();
    return Math.max(0, parseInt(expiresAt) - now);
  }
};