import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Upload, FolderPlus, Share2 } from "lucide-react";

const users = [
  { name: "Ethan Carter", email: "ethan.carter@example.com", storage: "60 GB", lastActive: "2 days ago", status: "Active" },
  { name: "Olivia Bennett", email: "olivia.bennett@example.com", storage: "80 GB", lastActive: "1 day ago", status: "Active" },
  { name: "Noah Harper", email: "noah.harper@example.com", storage: "45 GB", lastActive: "3 days ago", status: "Active" },
  { name: "Ava Foster", email: "ava.foster@example.com", storage: "70 GB", lastActive: "1 week ago", status: "Inactive" },
  { name: "Liam Hayes", email: "liam.hayes@example.com", storage: "55 GB", lastActive: "2 weeks ago", status: "Inactive" },
];

const activities = [
  { user: "Olivia Bennett", action: "uploaded", item: "Project Proposal.pdf", time: "2 hours ago", icon: Upload, color: "text-blue-500" },
  { user: "Ethan Carter", action: "created folder", item: "Marketing Materials", time: "4 hours ago", icon: FolderPlus, color: "text-green-500" },
  { user: "Noah Harper", action: "shared", item: "Client Presentation.pptx", time: "6 hours ago", icon: Share2, color: "text-purple-500" },
  { user: "Ava Foster", action: "downloaded", item: "Annual Report.xlsx", time: "8 hours ago", icon: Upload, color: "text-orange-500" },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
        <p className="text-gray-600 mt-2">Manage your team's files and storage efficiently</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              Total Storage Used
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-gray-900">1.2 TB</div>
            <p className="text-sm text-green-600 mt-1">↗ 12% from last month</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-gray-900">25</div>
            <p className="text-sm text-blue-600 mt-1">↗ 3 new this week</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              Files Stored
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-gray-900">15,000</div>
            <p className="text-sm text-purple-600 mt-1">↗ 1,200 this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Users Table - Takes 2 columns */}
        <Card className="xl:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900">Team Members</CardTitle>
            <p className="text-sm text-gray-600 mt-1">Monitor user activity and storage usage</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="col-span-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  User
                </div>
                <div className="col-span-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Email
                </div>
                <div className="col-span-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Storage
                </div>
                <div className="col-span-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Last Active
                </div>
                <div className="col-span-1 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {users.map((user, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                    
                    {/* User Info */}
                    <div className="col-span-4 flex items-center space-x-3">
                      <Avatar className="h-10 w-10 ring-2 ring-gray-200">
                        <AvatarFallback className="text-sm font-medium bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user.name}
                        </p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="col-span-3 flex items-center">
                      <p className="text-sm text-gray-600 truncate">
                        {user.email}
                      </p>
                    </div>

                    {/* Storage Usage */}
                    <div className="col-span-2 flex items-center">
                      <div className="w-full">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-900">{user.storage}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${Math.random() * 40 + 40}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Last Active */}
                    <div className="col-span-2 flex items-center">
                      <p className="text-sm text-gray-600">
                        {user.lastActive}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="col-span-1 flex items-center">
                      <Badge 
                        variant={user.status === 'Active' ? 'default' : 'secondary'} 
                        className={`text-xs font-medium px-2 py-1 ${
                          user.status === 'Active' 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {user.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity - Takes 1 column */}
        <Card className="xl:col-span-1 border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900">Recent Activity</CardTitle>
            <p className="text-sm text-gray-600 mt-1">Latest team actions</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                
                {/* Icon */}
                <div className={`flex-shrink-0 p-2 rounded-lg bg-white border ${activity.color} shadow-sm`}>
                  <activity.icon className="h-4 w-4" />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 leading-5">
                    <span className="font-semibold">{activity.user}</span>{' '}
                    <span className="text-gray-600">{activity.action}</span>{' '}
                    <span className="font-medium text-gray-800">"{activity.item}"</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
            
            {/* View All Button */}
            <div className="pt-2 border-t border-gray-200">
              <button className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-800 py-2 rounded-md hover:bg-blue-50 transition-colors">
                View All Activity
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}