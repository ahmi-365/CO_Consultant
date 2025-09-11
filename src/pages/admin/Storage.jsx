import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HardDrive, Database, Cloud, Server, TrendingUp, AlertTriangle } from "lucide-react";

const storageStats = [
  { name: "Total Storage", value: "2.5 TB", used: "1.2 TB", percentage: 48, icon: HardDrive },
  { name: "Database", value: "500 GB", used: "320 GB", percentage: 64, icon: Database },
  { name: "File Storage", value: "1.8 TB", used: "850 GB", percentage: 47, icon: Cloud },
  { name: "Backup Storage", value: "200 GB", used: "45 GB", percentage: 23, icon: Server },
];

const storageByType = [
  { type: "Documents", size: "450 GB", files: "12,500", color: "bg-blue-500" },
  { type: "Images", size: "380 GB", files: "8,200", color: "bg-green-500" },
  { type: "Videos", size: "290 GB", files: "1,800", color: "bg-purple-500" },
  { type: "Audio", size: "120 GB", files: "3,400", color: "bg-yellow-500" },
  { type: "Archives", size: "180 GB", files: "950", color: "bg-red-500" },
  { type: "Other", size: "95 GB", files: "2,100", color: "bg-gray-500" },
];

const storageAlerts = [
  { message: "Database storage is approaching 80% capacity", type: "warning", icon: AlertTriangle },
  { message: "Backup storage is running efficiently", type: "success", icon: TrendingUp },
  { message: "Consider archiving old files to free up space", type: "info", icon: Database },
];

export default function Storage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Storage Management</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage your storage usage</p>
        </div>
        <Button>
          <Cloud className="h-4 w-4 mr-2" />
          Upgrade Storage
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {storageStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{stat.used}</span>
                  <span className="text-sm text-muted-foreground">of {stat.value}</span>
                </div>
                <Progress value={stat.percentage} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {stat.percentage}% used
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Storage by File Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {storageByType.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded ${item.color}`}></div>
                    <div>
                      <div className="font-medium text-sm">{item.type}</div>
                      <div className="text-xs text-muted-foreground">{item.files} files</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm">{item.size}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Storage Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {storageAlerts.map((alert, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border border-border rounded-lg">
                  <alert.icon className={`h-5 w-5 mt-0.5 ${
                    alert.type === 'warning' ? 'text-admin-warning' :
                    alert.type === 'success' ? 'text-admin-success' :
                    'text-admin-info'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm">{alert.message}</p>
                    <Badge 
                      variant="outline" 
                      className={`mt-2 text-xs ${
                        alert.type === 'warning' ? 'border-admin-warning text-admin-warning' :
                        alert.type === 'success' ? 'border-admin-success text-admin-success' :
                        'border-admin-info text-admin-info'
                      }`}
                    >
                      {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Storage Usage Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4" />
              <p>Storage usage charts and analytics would be displayed here</p>
              <p className="text-sm">Connect to analytics service to view detailed trends</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}