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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";



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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [reportsPerPage, setReportsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);



  // Move this BEFORE pagination logic
  const filteredReports = recentReports.filter((report) => {
  const reportName = getReportTypeName(report.type).toLowerCase();
  const query = searchQuery.toLowerCase();

  const matchesSearch =
    reportName.includes(query) ||
    report.format.toLowerCase().includes(query);

  const matchesType =
    !filterType || filterType === "all" || getReportTypeName(report.type) === filterType;

  const matchesDate =
    !filterDate || new Date(report.created_at) >= new Date(filterDate);

  return matchesSearch && matchesType && matchesDate;
});
  // Now compute pagination
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);


  //  const filteredReports = recentReports.filter((report) => {
  //     const reportName = getReportTypeName(report.type).toLowerCase();
  //     const query = searchQuery.toLowerCase();

  //     const matchesSearch =
  //       reportName.includes(query) ||
  //       report.format.toLowerCase().includes(query);

  //     const matchesType =
  //       !filterType || getReportTypeName(report.type) === filterType;

  //     const matchesDate =
  //       !filterDate || new Date(report.created_at) >= new Date(filterDate);

  //     return matchesSearch && matchesType && matchesDate;
  //   });



  useEffect(() => {
    fetchReports();
  }, []);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType, filterDate, reportsPerPage]);

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
  // const filteredReports = recentReports.filter((report) => {
  //   const reportName = getReportTypeName(report.type).toLowerCase();
  //   const query = searchQuery.toLowerCase();

  //   const matchesSearch =
  //     reportName.includes(query) ||
  //     report.format.toLowerCase().includes(query);

  //   const matchesType =
  //     !filterType || getReportTypeName(report.type) === filterType;

  //   const matchesDate =
  //     !filterDate || new Date(report.created_at) >= new Date(filterDate);

  //   return matchesSearch && matchesType && matchesDate;
  // });


  //  const filteredReports = recentReports.filter((report) => {
  //   const reportName = getReportTypeName(report.type).toLowerCase();
  //   const query = searchQuery.toLowerCase();

  //   // ✅ Search match
  //   const matchesSearch =
  //     reportName.includes(query) ||
  //     report.format.toLowerCase().includes(query);

  //   // ✅ Type match
  //   const matchesType =
  //     !filterType || getReportTypeName(report.type) === filterType;

  //   // ✅ Date match (if applicable)
  //   const matchesDate =
  //     !filterDate || new Date(report.created_at) >= new Date(filterDate);

  //   return matchesSearch && matchesType && matchesDate;
  // });

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
        {/* <Button
          onClick={handleExportAll}
          className="self-start sm:self-auto flex items-center gap-2"
          disabled={recentReports.length === 0}
        >
          <Download className="h-4 w-4" />
          Export All
        </Button> */}
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
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedReport === report.id
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
                {/* Start Date */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
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
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date >= today; // block today & future
                        }}
                        className="bg- text- rounded-md border border-border shadow-sm
            [&_.rdp-day_selected]:bg-blue-600 
            [&_.rdp-day_selected]:text-white 
            [&_.rdp-day_selected:hover]:bg-blue-700 
            [&_.rdp-day_selected:hover]:text-white 
            [&_.rdp-day_today]:border-none"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* End Date */}
                <div>
                  <label className="text-sm font-medium mb-2 block">End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
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
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date >= today; // block today & future
                        }}
                        className="bg-background text-foreground rounded-md border border-border shadow-sm
            [&_.rdp-day_selected]:bg-blue-600 
            [&_.rdp-day_selected]:text-white 
            [&_.rdp-day_selected:hover]:bg-blue-700 
            [&_.rdp-day_selected:hover]:text-white 
            [&_.rdp-day_today]:border-none"
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


          <Card className="shadow-sm border border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Reports</CardTitle>
            </CardHeader>

            <CardContent>
              {/* Filters Section */}
              {/* Filters Section */}
              <div className="bg-muted/30 p-4 rounded-lg mb-6 space-y-4 md:space-y-0 md:flex md:items-end md:gap-4">
                {/* Search */}
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search by name or format..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Type Filter */}
                <div className="w-full md:w-48">
                  <Label htmlFor="type">Report Type</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
  <SelectTrigger id="type">
    <SelectValue placeholder="All Types" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Types</SelectItem>
    {Array.from(new Set(recentReports.map(r => getReportTypeName(r.type)))).map(type => (
      <SelectItem key={type} value={type}>{type}</SelectItem>
    ))}
  </SelectContent>
</Select>
                </div>

                {/* Date Filter */}
                <div className="w-full md:w-48">
                  <Label htmlFor="date">From Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filterDate ? format(new Date(filterDate), "PPP") : "Any date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filterDate ? new Date(filterDate) : undefined}
                        onSelect={(date) => setFilterDate(date ? format(date, "yyyy-MM-dd") : "")}
                        disabled={(date) => date > new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Per Page */}
                <div className="w-full md:w-40">
                  <Label htmlFor="perPage">Per Page</Label>
                  <Select value={String(reportsPerPage)} onValueChange={(v) => setReportsPerPage(Number(v))}>
  <SelectTrigger id="perPage">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    {[5, 10, 15, 20, 25].map(num => (
      <SelectItem key={num} value={String(num)}>{num} </SelectItem>
    ))}
  </SelectContent>
</Select>
                </div>
              </div>

              {/* Filtered Reports */}
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading reports...
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No reports found for the selected filters.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Table Header */}
                  <div className="hidden md:grid md:grid-cols-5 gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wider pb-2 border-b">
                    <div className="col-span-2">Report Name</div>
                    <div>Type</div>
                    <div>Generated</div>
                    <div>Actions</div>
                  </div>

                  {/* Paginated Report List */}
                  {currentReports.map((report) => (
                    <div
                      key={report.id}
                      className="grid grid-cols-1 md:grid-cols-5 gap-4 py-3 border-b border-border last:border-0 hover:bg-gray-50 dark:hover:bg-[#0f172a] rounded-lg px-3 transition-colors"
                    >
                      {/* Report Name */}
                      <div className="col-span-2">
                        <div className="font-medium text-sm">
                          {getReportTypeName(report.type)} -{" "}
                          {format(new Date(report.created_at), "MMM dd, yyyy")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {report.format.toUpperCase()} Format
                        </div>
                      </div>

                      {/* Type */}
                      <div>
                        <Badge variant="outline" className="text-xs truncate">
                          {getReportTypeName(report.type).replace(/report/i, "").trim()}
                        </Badge>
                      </div>

                      {/* Generated Time */}
                      <div className="text-sm text-muted-foreground">
                        {formatRelativeTime(report.created_at)}
                      </div>

                      {/* Actions */}
                      <div className="flex items-end justify-start md:justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2"
                          onClick={() =>
                            handleDownloadReport(report.path, getReportTypeName(report.type))
                          }
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Pagination Controls */}
                  <div className="flex items-center justify-center gap-3 pt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {Math.max(1, Math.ceil(filteredReports.length / reportsPerPage))}
                      {filteredReports.length > 0 && ` (${filteredReports.length} total)`}
                    </span><span className="text-sm text-muted-foreground">
                      Page {currentPage} of {Math.ceil(filteredReports.length / reportsPerPage)}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={currentPage === Math.ceil(filteredReports.length / reportsPerPage)}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                      Next
                    </Button>
                  </div>
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

          {/* <Card className="mt-6">
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
          </Card> */}
        </div>
      </div>
    </div>
  );
}