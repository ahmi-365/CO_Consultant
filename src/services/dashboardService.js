const API_URL = import.meta.env.VITE_API_URL;

export const dashboardService = {
  async getDashboardData() {
    const token = localStorage.getItem('token');
    const url = `${API_URL}/dashboard`;

    if (!token) {
      throw new Error("No auth token found");
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      const result = await response.json().catch(() => null);
      return result?.data || result;

    } catch (err) {
      console.error('Dashboard fetch error:', err);
      throw err;
    }
  },
};
