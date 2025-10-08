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
}
,
  // Login user
  async login(data) {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok || result.status !== "success") {
        return { success: false, message: result.message || "Login failed" }
      }

      // Save token + user in localStorage
      if (result.authorisation?.token) {
        localStorage.setItem("token", result.authorisation.token)
        localStorage.setItem("user", JSON.stringify(result.user))
      }

      return { success: true }
    } catch (err) {
      console.error("❌ Login error:", err)
      return { success: false, message: "Something went wrong" }
    }
  },

  getUser() {
    const user = localStorage.getItem("user")
    return user ? JSON.parse(user) : null
  },

  getToken() {
    return localStorage.getItem("token")
  },

  logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  },
}
