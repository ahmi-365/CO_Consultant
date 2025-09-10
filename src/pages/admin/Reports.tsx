import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, FileText, Users, Activity, TrendingUp, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const reportTypes = [
  { id: "user-activity", name: "User Activity Report", description: "Detailed user engagement and file access logs", icon: Activity },
  { id: "storage-usage", name: "Storage Usage Report", description: "Storage consumption by users and file types", icon: BarChart3 },
  { id: "file-access", name: "File Access Report", description: "File downloads, views, and modifications", icon: FileText },
  { id: "team-overview", name: "Team Overview Report", description: "Comprehensive team performance metrics", icon: Users },
];

const recentReports = [
  { name: "Monthly User Activity - November 2024", type: "User Activity", generated: "2 hours ago", size: "2.4 MB", status: "Ready" },
  { name: "Storage Usage Analysis - Q4 2024", type: "Storage Usage", generated: "1 day ago", size: "1.8 MB", status: "Ready" },
  { name: "File Access Summary - Week 45", type: "File Access", generated: "3 days ago", size: "950 KB", status: "Ready" },
  { name: "Team Performance - October 2024", type: "Team Overview", generated: "1 week ago", size: "3.2 MB", status: "Archived" },
];

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState("");
  const [dateRange, setDateRange] = useState("last-30-days");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateReport = async () => {
    if (!selectedReport) {
      toast({
        title: "Report Type Required",
        description: "Please select a report type to generate.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Report Generated Successfully",
        description: `Your ${reportTypes.find(r => r.id === selectedReport)?.name} has been generated and is ready for download.`,
      });
    }, 3000);
  };

  const handleDownloadReport = (reportName: string) => {
    toast({
      title: "Download Started",
      description: `Downloading ${reportName}...`,
    });
  };

  const handleExportAll = () => {
    toast({
      title: "Bulk Export Started", 
      description: "All reports are being prepared for download. This may take a few minutes.",
    });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Generate and manage system reports</p>
        </div>
        <Button onClick={handleExportAll}>
          <Download className="h-4 w-4 mr-2" />
          Export All
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Generate New Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-3 block">Select Report Type</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reportTypes.map((report) => (
                    <div
                      key={report.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedReport === report.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-accent-foreground'
                      }`}
                      onClick={() => setSelectedReport(report.id)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <report.icon className="h-5 w-5" />
                        <h3 className="font-medium text-sm">{report.name}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">{report.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Date Range</label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last-7-days">Last 7 days</SelectItem>
                      <SelectItem value="last-30-days">Last 30 days</SelectItem>
                      <SelectItem value="last-90-days">Last 90 days</SelectItem>
                      <SelectItem value="custom">Custom range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {dateRange === "custom" && (
                  <div className="grid grid-cols-2 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Start date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "End date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>

              <Button 
                className="w-full" 
                size="lg"
                disabled={!selectedReport}
                onClick={handleGenerateReport}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate Report"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wider pb-2 border-b">
                  <div className="col-span-2">Report Name</div>
                  <div>Type</div>
                  <div>Generated</div>
                  <div>Actions</div>
                </div>
                {recentReports.map((report, index) => (
                  <div key={index} className="grid grid-cols-5 gap-4 items-center py-3 border-b border-border last:border-0 hover:bg-accent/50 rounded-lg px-2">
                    <div className="col-span-2">
                      <div className="font-medium text-sm">{report.name}</div>
                      <div className="text-xs text-muted-foreground">{report.size}</div>
                    </div>
                    <div>
                      <Badge variant="outline" className="text-xs">
                        {report.type}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{report.generated}</div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadReport(report.name)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Badge 
                        variant={report.status === 'Ready' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {report.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 border border-border rounded-lg">
                <div className="text-2xl font-bold">127</div>
                <div className="text-sm text-muted-foreground">Reports Generated This Month</div>
              </div>
              
              <div className="p-3 border border-border rounded-lg">
                <div className="text-2xl font-bold">2.4 GB</div>
                <div className="text-sm text-muted-foreground">Total Report Data</div>
              </div>
              
              <div className="p-3 border border-border rounded-lg">
                <div className="text-2xl font-bold">95%</div>
                <div className="text-sm text-muted-foreground">Report Completion Rate</div>
              </div>
              
              <div className="p-3 border border-border rounded-lg">
                <div className="text-2xl font-bold">45 min</div>
                <div className="text-sm text-muted-foreground">Average Generation Time</div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border border-border rounded-lg">
                  <div className="font-medium text-sm">Weekly User Activity</div>
                  <div className="text-xs text-muted-foreground">Every Monday at 9:00 AM</div>
                  <Badge variant="secondary" className="text-xs mt-1">Active</Badge>
                </div>
                
                <div className="p-3 border border-border rounded-lg">
                  <div className="font-medium text-sm">Monthly Storage Report</div>
                  <div className="text-xs text-muted-foreground">1st of every month</div>
                  <Badge variant="secondary" className="text-xs mt-1">Active</Badge>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4" size="sm">
                Manage Schedules
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}