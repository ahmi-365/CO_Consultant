import { Upload, FolderPlus, Share2 } from "lucide-react";

const users = [
  { name: "Ethan Carter", email: "ethan.carter@example.com", storage: "60 GB", lastActive: "2 days ago", status: "Active" },
  { name: "Olivia Bennett", email: "olivia.bennett@example.com", storage: "80 GB", lastActive: "1 day ago", status: "Active" },
  { name: "Noah Harper", email: "noah.harper@example.com", storage: "45 GB", lastActive: "3 days ago", status: "Active" },
  { name: "Ava Foster", email: "ava.foster@example.com", storage: "70 GB", lastActive: "1 week ago", status: "Inactive" },
  { name: "Liam Hayes", email: "liam.hayes@example.com", storage: "55 GB", lastActive: "2 weeks ago", status: "Inactive" },
];

const activities = [
  { user: "Olivia Bennett", action: "uploaded", item: "Project Proposal.pdf", time: "2 hours ago", icon: Upload },
  { user: "Ethan Carter", action: "created folder", item: "Marketing Materials", time: "4 hours ago", icon: FolderPlus },
  { user: "Noah Harper", action: "shared", item: "Client Presentation.pptx", time: "6 hours ago", icon: Share2 },
  { user: "Ava Foster", action: "downloaded", item: "Annual Report.xlsx", time: "8 hours ago", icon: Upload },
];

export default function Dashboard() {
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('');
  };

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
          <div className="text-2xl md:text-3xl font-bold text-gray-900">1.2 TB</div>
          <p className="text-sm text-green-600 mt-1">↗ 12% from last month</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">
            Active Users
          </h3>
          <div className="text-2xl md:text-3xl font-bold text-gray-900">25</div>
          <p className="text-sm text-blue-600 mt-1">↗ 3 new this week</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">
            Files Stored
          </h3>
          <div className="text-2xl md:text-3xl font-bold text-gray-900">15,000</div>
          <p className="text-sm text-purple-600 mt-1">↗ 1,200 this month</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Team Members */}
        <div className="xl:col-span-2 bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
            <p className="text-sm text-gray-600 mt-1">Monitor user activity and storage usage</p>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {users.map((user, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg">
                  
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
                      <p className="text-xs text-gray-500 mb-1">Last Active</p>
                      <p className="text-sm font-medium text-gray-900">{user.lastActive}</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        user.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {user.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
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
              {activities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                  
                  {/* Icon */}
                  <div className="flex-shrink-0 p-2 rounded-lg bg-white border shadow-sm">
                    <activity.icon className="h-4 w-4 text-gray-600" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 leading-5">
                      <span className="font-medium">{activity.user}</span>{' '}
                      <span className="text-gray-600">{activity.action}</span>{' '}
                      <span className="font-medium">"{activity.item}"</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
              
              {/* View All Button */}
              <div className="pt-4 border-t border-gray-200">
                <button className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-800 py-2 rounded-md hover:bg-blue-50 transition-colors">
                  View All Activity
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}