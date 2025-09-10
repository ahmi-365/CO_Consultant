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
];

export default function Dashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Overview</h1>
        <p className="text-muted-foreground mt-1">Manage your team's files and storage</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Storage Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1.2 TB</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">25</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Files Stored</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">15,000</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-6 gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wider pb-2 border-b">
                <div>Name</div>
                <div className="col-span-2">Email</div>
                <div>Storage Used</div>
                <div>Last Active</div>
                <div>Status</div>
              </div>
              {users.map((user, index) => (
                <div key={index} className="grid grid-cols-6 gap-4 items-center py-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">{user.name}</span>
                  </div>
                  <div className="col-span-2 text-sm text-muted-foreground">{user.email}</div>
                  <div className="text-sm">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mb-1">
                      <div className="bg-panel h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    {user.storage}
                  </div>
                  <div className="text-sm text-muted-foreground">{user.lastActive}</div>
                  <div>
                    <Badge variant={user.status === 'Active' ? 'default' : 'outline'} className="text-xs">
                      {user.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-200">
                  <div className={`p-2 rounded-lg bg-accent ${activity.color}`}>
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span> {activity.action}{' '}
                      <span className="font-medium">'{activity.item}'</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}