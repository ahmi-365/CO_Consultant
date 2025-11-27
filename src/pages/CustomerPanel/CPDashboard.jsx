import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Files, Star, Trash2, Activity, FolderPlus, FileImage, RotateCcw, Folder } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const dashboardService = {
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

export default function CPDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getDashboardData();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getActionIcon = (action) => {
    switch (action?.toLowerCase()) {
      case 'create_root':
        return Database;
      case 'restore':
        return RotateCcw;
      case 'create_folder':
        return FolderPlus;
      case 'trash':
        return Trash2;
      default:
        return Activity;
    }
  };

  const formatAction = (action) => {
    if (!action) return 'Unknown Action';
    return action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatGrowthText = (growthPct) => {
    if (growthPct > 0) {
      return `↗ ${growthPct}% from last month`;
    } else if (growthPct < 0) {
      return `↘ ${Math.abs(growthPct)}% from last month`;
    } else {
      return `→ No change from last month`;
    }
  };

  const getGrowthColor = (growthPct) => {
    if (growthPct > 0) return 'text-green-600';
    if (growthPct < 0) return 'text-red-600';
    return 'text-gray-600 dark:text-gray-400 dark:text-gray-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-6 lg:p-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4 animate-pulse"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Activity Section Skeleton */}
        <div className="bg-white dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border border-gray-200 dark:border-gray-700-b">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-950">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen  p-4 md:p-6 lg:p-8">
        <div className="bg-red-50 border border-gray-200 dark:border-gray-700 border border-gray-200 dark:border-gray-700-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Dashboard</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen  p-4 md:p-6 lg:p-8">
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400">No dashboard data available</p>
        </div>
      </div>
    );
  }

  const { storage, files, starredFiles, trashedFiles, activity } = dashboardData;

  return (
    <div className="min-h-screen  p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100">Overview</h1>
        <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 mt-2">Manage your files and storage efficiently</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div
          onClick={() => navigate('/filemanager')}
          className="bg-white dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-md transition-shadow"
        >
          <h3 className="text-sm font-mediumtext-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wide mb-2">
            Total Storage Used
          </h3>
          <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100">{storage?.used || '0 MB'}</div>
          <p className={`text-sm mt-1 ${getGrowthColor(storage?.growth_pct || 0)}`}>
            {formatGrowthText(storage?.growth_pct || 0)}
          </p>
        </div>

        <div
          onClick={() => navigate('/filemanager')}
          className="bg-white dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-md transition-shadow"
        >
          <h3 className="text-sm font-mediumtext-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wide mb-2">
            Files Stored
          </h3>
          <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100">{files?.total || 0}</div>
          <p className="text-sm text-purple-600 mt-1">
            ↗ {files?.this_month || 0} this month
          </p>
        </div>

        <div
          onClick={() => navigate('/starred')}
          className="bg-white dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-md transition-shadow"
        >
          <h3 className="text-sm font-mediumtext-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wide mb-2">
            Starred Files
          </h3>
          <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100">{starredFiles || 0}</div>
          <p className="text-sm text-yellow-600 mt-1">
            Important files
          </p>
        </div>

        <div
          onClick={() => navigate('/trash')}
          className="bg-white dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-md transition-shadow"
        >
          <h3 className="text-sm font-mediumtext-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-400 uppercase tracking-wide mb-2">
            Trashed Files
          </h3>
          <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100 dark:text-gray-100">{trashedFiles || 0}</div>
          <p className="text-sm text-red-600 mt-1">
            In trash bin
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6">
  {/* Recent Activity */}
  <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        Recent Activity
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
        Latest actions in your storage
      </p>
    </div>

    <div className="p-6">
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {activity?.map((item, index) => {
          const IconComponent = getActionIcon(item.action);
          return (
            <div
              key={item.id || index}
              className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              {/* Icon */}
              <div className="flex-shrink-0 p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
                <IconComponent className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-gray-100 leading-5">
                  <span className="font-medium">{item.user}</span>{' '}
                  <span className="text-gray-600 dark:text-gray-400">
                    {formatAction(item.action)}
                  </span>{' '}
                  {item.file ? (
                    <span className="font-medium">"{item.file}"</span>
                  ) : (
                    <span className="text-gray-400 italic">No file specified</span>
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {item.time}
                </p>
              </div>
            </div>
          );
        })}

        {(!activity || activity.length === 0) && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No recent activity</p>
          </div>
        )}
      </div>
    </div>
  </div>
</div>

    </div>
  );
}