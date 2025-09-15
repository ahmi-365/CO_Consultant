import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Home,
  Users,
  Star,
  Trash2,
  Upload,
  Menu,
  FileText,
  Archive,
  Image,
  Video,
  File,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import FileUploadModal from "./FileUploadModal";
import NewFolderModal from "./NewFolderModal";
import NotificationDropdown from "./NotificationDropdown";
import { toast } from "sonner";
import { apiService, FileItem, FolderItem } from "@/services/api";

const getFileIcon = (type ) => {
  const iconClass = "w-4 h-4 text-muted-foreground mr-2";
  switch (type) {
    case "document":
      return <FileText className={iconClass} />;
    case "zip":
      return <Archive className={iconClass} />;
    case "image":
      return <Image className={iconClass} />;
    case "video":
      return <Video className={iconClass} />;
    case "folder":
      return <Folder className={iconClass} />;
    default:
      return <File className={iconClass} />;
  }
};


export default function CloudVaultLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { folderId } = useParams();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isClientProjectsOpen, setIsClientProjectsOpen] = useState(true);
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const currentPath = location.pathname;

  const getBreadcrumbPath = () => {
    switch (currentPath) {
      case "/starred":
        return [{ name: "Starred", path: "/starred" }];
      case "/shared":
        return [{ name: "Shared with me", path: "/shared" }];
      case "/trash":
        return [{ name: "Trash", path: "/trash" }];
      case "/":
      default:
        return [
          { name: "My Files", path: "/filemanager" },
          { name: "Client Projects", path: "/folder/client-projects" },
          { name: "Project Alpha", path: "/folder/project-alpha" },
        ];
    }
  };

  const isActive = (path ) => currentPath === path;

  // Load data on component mount and when folderId changes
  useEffect(() => {
    loadFiles();
    loadFolders();
  }, [folderId]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const response = await apiService.getFiles(folderId);
      if (response.success) {
        setFiles(response.data);
      } else {
        toast.error("Failed to load files");
      }
    } catch (error) {
      console.error("Error loading files:", error);
      toast.error("Error loading files");
    } finally {
      setLoading(false);
    }
  };

  const loadFolders = async () => {
    try {
      const response = await apiService.getFolders(folderId);
      if (response.success) {
        setFolders(response.data);
      } else {
        toast.error("Failed to load folders");
      }
    } catch (error) {
      console.error("Error loading folders:", error);
      toast.error("Error loading folders");
    }
  };

  const handleFileUploaded = async (file) => {
    setLoading(true);
    try {
      const response = await apiService.uploadFile(file, folderId);
      if (response.success) {
        setFiles((prev) => [response.data, ...prev]);
        toast.success("File uploaded successfully");
      } else {
        toast.error("Failed to upload file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Error uploading file");
    } finally {
      setLoading(false);
    }
  };

  const handleFolderCreated = async (folderName ) => {
    setLoading(true);
    try {
      const response = await apiService.createFolder(folderName, folderId);
      if (response.success) {
        setFolders((prev) => [response.data, ...prev]);
        toast.success("Folder created successfully");
      } else {
        toast.error("Failed to create folder");
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Error creating folder");
    } finally {
      setLoading(false);
    }
  };

  const handleStarFile = async (fileId ) => {
    try {
      const response = await apiService.starFile(fileId);
      if (response.success) {
        loadFiles(); // Reload files to get updated star status
        toast.success("File starred successfully");
      } else {
        toast.error("Failed to star file");
      }
    } catch (error) {
      console.error("Error starring file:", error);
      toast.error("Error starring file");
    }
  };

  const handleMoveToTrash = async (fileId ) => {
    try {
      const response = await apiService.moveToTrash(fileId);
      if (response.success) {
        loadFiles(); // Reload files
        toast.success("File moved to trash");
      } else {
        toast.error("Failed to move file to trash");
      }
    } catch (error) {
      console.error("Error moving file to trash:", error);
      toast.error("Error moving file to trash");
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      loadFiles();
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.searchFiles(query);
      if (response.success) {
        setFiles(response.data);
      } else {
        toast.error("Search failed");
      }
    } catch (error) {
      console.error("Error searching files:", error);
      toast.error("Error searching files");
    } finally {
      setLoading(false);
    }
  };

  // Handle search input changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarCollapsed ? "w-16" : "w-60"
        } bg-sidebar-background border-r border-sidebar-border flex flex-col transition-all duration-300`}
      >
        {/* Logo and Collapse Button */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-panel rounded-full flex items-center justify-center text-panel-foreground font-bold text-sm">
                CV
              </div>
              {!isSidebarCollapsed && (
                <span className="font-semibold text-sidebar-foreground">
                  CloudVault
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="h-8 w-8 p-0 text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <nav className="space-y-1">
            <button
              onClick={() => navigate("/")}
              className={`flex items-center gap-2 px-3 py-2 w-full text-left rounded-md cursor-pointer transition-colors ${
                isActive("/")
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <Home className="w-4 h-4" />
              {!isSidebarCollapsed && <span className="text-sm">Home</span>}
            </button>

            {!isSidebarCollapsed && (
              <div className="mt-6">
                <div className="px-3 py-1 text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wide">
                  My Files
                </div>

                <div className="mt-2 space-y-1">
                  {folders.map((folder) => (
                    <div key={folder.id} className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          setIsClientProjectsOpen(!isClientProjectsOpen)
                        }
                        className="p-0.5 hover:bg-sidebar-accent rounded"
                      >
                        {isClientProjectsOpen ? (
                          <ChevronDown className="w-3 h-3 text-sidebar-foreground/60" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-sidebar-foreground/60" />
                        )}
                      </button>
                      <button
                        onClick={() => navigate(`/folder/${folder.id}`)}
                        className="flex items-center gap-2 px-2 py-1 text-sm text-sidebar-foreground hover:bg-sidebar-accent rounded cursor-pointer w-full text-left"
                      >
                        {isClientProjectsOpen ? (
                          <FolderOpen className="w-4 h-4" />
                        ) : (
                          <Folder className="w-4 h-4" />
                        )}
                        <span>{folder.name}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 space-y-1">
              <button
                onClick={() => navigate("/shared")}
                className={`flex items-center gap-2 px-3 py-2 text-sm w-full rounded-md cursor-pointer transition-colors ${
                  isActive("/shared")
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <Users className="w-4 h-4" />
                {!isSidebarCollapsed && <span>Shared with me</span>}
              </button>
              <button
                onClick={() => navigate("/starred")}
                className={`flex items-center gap-2 px-3 py-2 text-sm w-full rounded-md cursor-pointer transition-colors ${
                  isActive("/starred")
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <Star className="w-4 h-4" />
                {!isSidebarCollapsed && <span>Starred</span>}
              </button>
              <button
                onClick={() => navigate("/trash")}
                className={`flex items-center gap-2 px-3 py-2 text-sm w-full rounded-md cursor-pointer transition-colors ${
                  isActive("/trash")
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <Trash2 className="w-4 h-4" />
                {!isSidebarCollapsed && <span>Trash</span>}
              </button>
            </div>
          </nav>
        </div>

        {/* New Upload Button */}
        <div className="p-4 border-t border-sidebar-border">
          <Button
            className={`w-full bg-panel hover:bg-panel/90 text-panel-foreground ${
              isSidebarCollapsed ? "px-2" : ""
            }`}
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Upload className="w-4 h-4" />
            {!isSidebarCollapsed && <span className="ml-2">New Upload</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-cloudvault-text-secondary">
              {getBreadcrumbPath().map((crumb, index) => (
                <div key={crumb.path} className="flex items-center gap-2">
                  {index > 0 && <ChevronRight className="w-4 h-4" />}
                  <button
                    onClick={() => navigate(crumb.path)}
                    className={`hover:text-foreground transition-colors ${
                      index === getBreadcrumbPath().length - 1
                        ? "text-foreground font-medium"
                        : ""
                    }`}
                  >
                    {crumb.name}
                  </button>
                </div>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cloudvault-text-secondary" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-input border-border"
                disabled={loading}
              />
            </div>

            {/* Notifications */}
            <NotificationDropdown />

            {/* User Avatar */}
            <Avatar>
              <AvatarFallback className="bg-panel text-panel-foreground">
                U
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children || (
            <div className="space-y-6">
              {/* Page Header */}
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-foreground">
                  {currentPath === "/"
                    ? "Project Alpha"
                    : getBreadcrumbPath()[getBreadcrumbPath().length - 1]?.name}
                </h1>
              </div>

              {/* Files Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-foreground">Files</h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsNewFolderModalOpen(true)}
                    >
                      <Folder className="w-4 h-4 mr-2" />
                      New Folder
                    </Button>
                    <Button
                      size="sm"
                      className="bg-panel hover:bg-panel/90 text-panel-foreground"
                      onClick={() => setIsUploadModalOpen(true)}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>

                {/* Folders */}
                {folders.length > 0 && (
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    {folders.map((folder) => (
                      <button
                        key={folder.id}
                        onClick={() => navigate(`/folder/${folder.id}`)}
                        className="flex items-center gap-2 p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer text-left"
                      >
                        <Folder className="w-5 h-5 text-panel" />
                        <span className="text-sm font-medium truncate">
                          {folder.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* File Table */}
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="bg-muted px-4 py-3 border-b border-border">
                    <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground">
                      <div>Name</div>
                      <div>Owner</div>
                      <div>Last Modified</div>
                      <div>File Size</div>
                    </div>
                  </div>

                  <div className="divide-y divide-border">
                    {loading ? (
                      <div className="px-4 py-8 text-center text-muted-foreground">
                        Loading files...
                      </div>
                    ) : files.length === 0 ? (
                      <div className="px-4 py-8 text-center text-muted-foreground">
                        No files found
                      </div>
                    ) : (
                      files.map((file) => (
                        <div
                          key={file.id}
                          className="px-4 py-3 hover:bg-muted/50 cursor-pointer group"
                        >
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center">
                              {getFileIcon(file.type)}
                              <span className="text-foreground">
                                {file.name}
                              </span>
                            </div>
                            <div className="text-muted-foreground">
                              {file.owner}
                            </div>
                            <div className="text-muted-foreground">
                              {file.lastModified}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">
                                {file.size}
                              </span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStarFile(file.id);
                                  }}
                                  className="h-8 w-8 p-0"
                                >
                                  <Star className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveToTrash(file.id);
                                  }}
                                  className="h-8 w-8 p-0 text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onFileUploaded={handleFileUploaded}
        currentFolder={getBreadcrumbPath()
          .map((p) => p.name)
          .join(" / ")}
      />

      <NewFolderModal
        isOpen={isNewFolderModalOpen}
        onClose={() => setIsNewFolderModalOpen(false)}
        onFolderCreated={handleFolderCreated}
        currentPath={getBreadcrumbPath()
          .map((p) => p.name)
          .join(" / ")}
      />
    </div>
  );
}
