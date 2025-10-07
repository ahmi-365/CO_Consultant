import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Download, FileText, Users, Activity, TrendingUp, BarChart3, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL;

const reportTypes = [
  { id: "user_activity", name: "User Activity Report", description: "Detailed user engagement and file access logs", icon: Activity },
  { id: "storage_usage", name: "Storage Usage Report", description: "Storage consumption by users and file types", icon: BarChart3 },
  { id: "file_history", name: "File History Report", description: "File downloads, views, and modifications", icon: FileText },
];

const reportsService = {
  async getReports() {
    const token = localStorage.getItem('token');
    const url = `${API_URL}/reports`;

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
      console.error('Reports fetch error:', err);
      throw err;
    }
  },

  async generateReport(payload) {
    const token = localStorage.getItem('token');
    const url = `${API_URL}/reports/generate`;

    if (!token) {
      throw new Error("No auth token found");
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      const result = await response.json().catch(() => null);
      return result?.data || result;

    } catch (err) {
      console.error('Report generation error:', err);
      throw err;
    }
  },
};

const getReportTypeName = (type) => {
  const reportType = reportTypes.find(rt => rt.id === type);
  return reportType ? reportType.name : type;
};

const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${diffDays} days ago`;
};

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState("");
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentReports, setRecentReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const result = await reportsService.getReports();
      
      if (result?.data) {
        setRecentReports(result.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch reports. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedReport) {
      toast({
        title: "Report Type Required",
        description: "Please select a report type to generate.",
        variant: "destructive",
      });
      return;
    }

    if (!startDate || !endDate) {
      toast({
        title: "Date Range Required",
        description: "Please select both start and end dates.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const payload = {
        type: selectedReport,
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
      };

      const result = await reportsService.generateReport(payload);

      if (result) {
        toast({
          title: "Report Generated Successfully",
          description: `Your ${getReportTypeName(selectedReport)} has been generated and is ready for download.`,
        });

        // Auto-download the generated report
        if (result.path) {
          downloadFile(result.path, `${getReportTypeName(selectedReport)}_${format(startDate, "yyyy-MM-dd")}_to_${format(endDate, "yyyy-MM-dd")}`);
        }

        // Refresh the reports list
        fetchReports();
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadFile = (reportPath, reportName) => {
    if (reportPath) {
      try {
        const a = document.createElement('a');
        a.href = reportPath;
      a.target = "_blank"; 
      a.rel = "noopener noreferrer"; 
        a.download = `${reportName.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(a);
        }, 100);
      } catch (error) {
        console.error('Download error:', error);
        toast({
          title: "Download Failed",
          description: "Failed to download the report. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDownloadReport = async (reportPath, reportName) => {
    downloadFile(reportPath, reportName);
    toast({
      title: "Download Started",
      description: `Downloading ${reportName}...`,
    });
  };

  const handleExportAll = async () => {
    if (recentReports.length === 0) {
      toast({
        title: "No Reports Available",
        description: "There are no reports to export.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Bulk Export Started", 
      description: "All reports are being prepared for download. This may take a few moments.",
    });

    // Download each report
    for (let i = 0; i < recentReports.length; i++) {
      const report = recentReports[i];
      await new Promise(resolve => setTimeout(resolve, i * 500)); // Stagger downloads
      await handleDownloadReport(report.path, `${getReportTypeName(report.type)}_${format(new Date(report.created_at), "yyyy-MM-dd")}`);
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Generate and manage system reports
          </p>
        </div>
        <Button 
          onClick={handleExportAll} 
          className="self-start sm:self-auto flex items-center gap-2"
          disabled={recentReports.length === 0}
        >
          <Download className="h-4 w-4" />
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
                  <label className="text-sm font-medium mb-2 block">Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Select start date"}
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
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Select end date"}
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
              </div>

              <Button 
                className="w-full" 
                size="lg"
                disabled={!selectedReport || !startDate || !endDate || isGenerating}
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
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading reports...
                </div>
              ) : recentReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No reports generated yet. Create your first report above.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="hidden md:grid md:grid-cols-5 gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wider pb-2 border-b">
                    <div className="col-span-2">Report Name</div>
                    <div>Type</div>
                    <div>Generated</div>
                    <div>Actions</div>
                  </div>

                  {recentReports.map((report) => (
                    <div
                      key={report.id}
                      className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start md:items-center py-3 border-b border-border last:border-0 hover:bg-gray-200 rounded-lg px-2"
                    >
                      <div className="col-span-2">
                        <div className="font-medium text-sm">
                          {getReportTypeName(report.type)} - {format(new Date(report.created_at), "MMM dd, yyyy")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {report.format.toUpperCase()} Format
                        </div>
                      </div>

                      <div>
                       <Badge variant="outline" className="text-xs truncate">
  {getReportTypeName(report.type).replace(/report/i, "").trim()}
</Badge>

                      </div>

                      <div className="text-sm text-muted-foreground">
                        {formatRelativeTime(report.created_at)}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadReport(report.path, getReportTypeName(report.type))}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                        <Badge variant="default" className="text-xs">
                          Ready
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                <div className="text-2xl font-bold">{recentReports.length}</div>
                <div className="text-sm text-muted-foreground">Total Reports Generated</div>
              </div>
              
              <div className="p-3 border border-border rounded-lg">
                <div className="text-2xl font-bold">
                  {recentReports.filter(r => r.type === "storage_usage").length}
                </div>
                <div className="text-sm text-muted-foreground">Storage Reports</div>
              </div>
              
              <div className="p-3 border border-border rounded-lg">
                <div className="text-2xl font-bold">
                  {recentReports.filter(r => r.type === "user_activity").length}
                </div>
                <div className="text-sm text-muted-foreground">Activity Reports</div>
              </div>
              
              <div className="p-3 border border-border rounded-lg">
                <div className="text-2xl font-bold">
                  {recentReports.filter(r => r.type === "file_history").length}
                </div>
                <div className="text-sm text-muted-foreground">File History Reports</div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Report Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportTypes.map((type) => (
                  <div key={type.id} className="p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <type.icon className="h-4 w-4" />
                      <div className="font-medium text-sm">{type.name}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{type.description}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}