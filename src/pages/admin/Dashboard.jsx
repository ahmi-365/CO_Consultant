import { useState, useEffect } from "react";
import { Upload, FolderPlus, Share2, Move, Trash2, RotateCcw, Edit, Download } from "lucide-react";

// API service
const API_URL = import.meta.env?.VITE_API_URL ;

const dashboardService = {
  async getDashboardData() {
    const token = localStorage?.getItem('token');
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

export default function Dashboard() {
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

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  const getActionIcon = (action) => {
    switch (action.toLowerCase()) {
      case 'uploaded':
      case 'upload':
        return Upload;
      case 'created':
      case 'create':
        return FolderPlus;
      case 'shared':
      case 'share':
        return Share2;
      case 'move':
        return Move;
      case 'trash':
        return Trash2;
      case 'restore':
        return RotateCcw;
      case 'rename':
        return Edit;
      case 'downloaded':
      case 'download':
        return Download;
      default:
        return Upload;
    }
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
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="text-center py-8">
          <p className="text-gray-600">No dashboard data available</p>
        </div>
      </div>
    );
  }

  const { storage, users, files, activity } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Overview</h1>
        <p className="text-gray-600 mt-2">Manage your team's files and storage efficiently</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">
            Total Storage Used
          </h3>
          <div className="text-2xl md:text-3xl font-bold text-gray-900">{storage?.used || '0 B'}</div>
          <p className={`text-sm mt-1 ${getGrowthColor(storage?.growth_pct || 0)}`}>
            {formatGrowthText(storage?.growth_pct || 0)}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">
            Active Users
          </h3>
          <div className="text-2xl md:text-3xl font-bold text-gray-900">{users?.total || 0}</div>
          <p className="text-sm text-blue-600 mt-1">
            ↗ {users?.active_this_week || 0} active this week
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">
            Files Stored
          </h3>
          <div className="text-2xl md:text-3xl font-bold text-gray-900">{files?.total || 0}</div>
          <p className="text-sm text-purple-600 mt-1">
            ↗ {files?.this_month || 0} this month
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Team Members */}
        <div className="xl:col-span-2 bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Recent Users</h2>
            <p className="text-sm text-gray-600 mt-1">Monitor user activity and storage usage</p>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {users?.recent?.map((user, index) => (
                <div key={user.id || index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg">
                  
                  {/* User Info */}
                  <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>

                  {/* User Details */}
                  <div className="flex items-center justify-between sm:justify-end space-x-4 sm:space-x-8">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Storage</p>
                      <p className="text-sm font-medium text-gray-900">{user.storage}</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {(!users?.recent || users.recent.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <p>No team members found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <p className="text-sm text-gray-600 mt-1">Latest team actions</p>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {activity?.slice(0, 6).map((item, index) => {
                const IconComponent = getActionIcon(item.action);
                return (
                  <div key={item.id || index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                    
                    {/* Icon */}
                    <div className="flex-shrink-0 p-2 rounded-lg bg-white border shadow-sm">
                      <IconComponent className="h-4 w-4 text-gray-600" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 leading-5">
                        <span className="font-medium">{item.user}</span>{' '}
                        <span className="text-gray-600">{item.action}</span>{' '}
                        <span className="font-medium">"{item.file}"</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                    </div>
                  </div>
                );
              })}
              
              {(!activity || activity.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <p>No recent activity</p>
                </div>
              )}
              
              {/* View All Button */}
              {/* {activity && activity.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <button className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-800 py-2 rounded-md hover:bg-blue-50 transition-colors">
                    View All Activity ({activity.length} total)
                  </button>
                </div>
              )} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}