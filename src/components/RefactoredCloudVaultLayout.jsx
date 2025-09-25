import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Search, Bell, ChevronRight, Folder, Upload, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import EnhancedSidebar from "./EnhancedSidebar";
import EnhancedFileList from "./EnhancedFileList";
import FileUploadModal from "./FileUploadModal";
import NewFolderModal from "./NewFolderModal";
import NotificationDropdown from "./NotificationDropdown";
import { fileApi } from "../services/FileService";
import { toast } from "sonner";

export default function RefactoredCloudVaultLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { folderId } = useParams();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadParentId, setUploadParentId] = useState(null);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // New states for breadcrumb management
  const [folderPath, setFolderPath] = useState([]);
  const [isLoadingPath, setIsLoadingPath] = useState(false);
  const [allItems, setAllItems] = useState([]); // Store all items for breadcrumb building

  const currentPath = location.pathname;

  // Load all items for breadcrumb building
  const loadAllItems = useCallback(async () => {
    try {
      const response = await fileApi.listFiles();
      let items = [];
      
      if (response.status === 'ok' && Array.isArray(response.data)) {
        items = response.data;
      } else if (Array.isArray(response)) {
        items = response;
      }
      
      setAllItems(items);
      return items;
    } catch (error) {
      console.error("Error loading items:", error);
      return [];
    }
  }, []);

  // Function to build folder path using listFiles API
  const buildFolderPath = useCallback(async (currentFolderId) => {
    if (!currentFolderId) {
      setFolderPath([]);
      return;
    }

    setIsLoadingPath(true);
    try {
      // Load all items if not already loaded
      let items = allItems.length > 0 ? allItems : await loadAllItems();
      
      // Create a map of folder ID to folder info
      const folderMap = new Map();
      items.forEach(item => {
        if (item.type === 'folder') {
          folderMap.set(item.id, {
            id: item.id,
            name: item.name,
            parentId: item.parent_id
          });
        }
      });

      // Build path by traversing up the folder hierarchy
      const path = [];
      let currentId = parseInt(currentFolderId);
      
      while (currentId && folderMap.has(currentId)) {
        const folder = folderMap.get(currentId);
        path.unshift({
          id: folder.id,
          name: folder.name,
          path: `/folder/${folder.id}`
        });
        
        // Move to parent folder
        currentId = folder.parentId;
        
        // Prevent infinite loops
        if (path.length > 10) break;
      }
      
      setFolderPath(path);
    } catch (error) {
      console.error("Error building folder path:", error);
      setFolderPath([]);
    } finally {
      setIsLoadingPath(false);
    }
  }, [allItems, loadAllItems]);

  // Update folder path when folderId changes
  useEffect(() => {
    if (currentPath.startsWith("/folder/") && folderId) {
      buildFolderPath(folderId);
    } else {
      setFolderPath([]);
    }
  }, [folderId, currentPath, buildFolderPath]);

  // Load all items on component mount
  useEffect(() => {
    loadAllItems();
  }, [loadAllItems]);

  const getBreadcrumbPath = () => {
    switch (currentPath) {
      case "/starred":
        return [{ name: "Starred", path: "/starred" }];
      case "/shared":
        return [{ name: "Shared with me", path: "/shared" }];
      case "/trash":
        return [{ name: "Trash", path: "/trash" }];
      case "/profile":
        return [{ name: "Profile", path: "/profile" }];
      case "/":
        return [{ name: "My Files", path: "/" }];
      default:
        if (currentPath.startsWith("/folder/")) {
          const basePath = [{ name: "My Files", path: "/" }];
          return [...basePath, ...folderPath];
        }
        return [{ name: "My Files", path: "/" }];
    }
  };

  // Enhanced refresh function that triggers both sidebar and file list reload
  const handleRefreshClick = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      // Reload all items first
      await loadAllItems();
      
      // Dispatch custom events for both sidebar and file list to refresh
      window.dispatchEvent(new CustomEvent("refreshSidebar"));
      window.dispatchEvent(new CustomEvent("refreshFileList"));
      
      // If we're in a folder view, refresh the folder path as well
      if (currentPath.startsWith("/folder/") && folderId) {
        await buildFolderPath(folderId);
      }
      
      toast.success("Content refreshed successfully");
    } catch (error) {
      console.error("Error refreshing content:", error);
      toast.error("Failed to refresh content");
    } finally {
      setIsRefreshing(false);
    }
  }, [currentPath, folderId, buildFolderPath, loadAllItems]);

  const handleFileUpload = async (file, parentId) => {
    try {
      const response = await fileApi.uploadFile(file, parentId);
      if (response.success) {
        toast.success("File uploaded successfully");
        // Reload all items for breadcrumb updates
        await loadAllItems();
        // Trigger refresh of both sidebar and file list
        window.dispatchEvent(new CustomEvent("fileUploaded"));
        window.dispatchEvent(new CustomEvent("refreshSidebar"));
        window.dispatchEvent(new CustomEvent("refreshFileList"));
      } else {
        toast.error("Failed to upload file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Error uploading file");
    }
  };

  const handleSidebarUploadClick = (id) => {
    setUploadParentId(id);
    setIsUploadModalOpen(true);
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  // Enhanced search function that searches across all files
  const handleSearchChange = useCallback((e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Dispatch search event with query for global search
    window.dispatchEvent(new CustomEvent("globalSearch", {
      detail: { query }
    }));
  }, []);

  // Handle folder creation success
  const handleFolderCreated = useCallback(async () => {
    // Reload all items for breadcrumb updates
    await loadAllItems();
    
    // Refresh both sidebar and file list
    window.dispatchEvent(new CustomEvent("refreshSidebar"));
    window.dispatchEvent(new CustomEvent("refreshFileList"));
    
    // Refresh folder path if we're in a folder
    if (currentPath.startsWith("/folder/") && folderId) {
      buildFolderPath(folderId);
    }
  }, [currentPath, folderId, buildFolderPath, loadAllItems]);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <EnhancedSidebar onUploadClick={handleSidebarUploadClick} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Enhanced Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              {isLoadingPath && currentPath.startsWith("/folder/") ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin"></div>
                  <span>Loading path...</span>
                </div>
              ) : (
                getBreadcrumbPath().map((crumb, index) => (
                  <div key={crumb.path || crumb.id} className="flex items-center gap-2">
                    {index > 0 && <ChevronRight className="w-4 h-4" />}
                    <button
                      onClick={() => navigate(crumb.path)}
                      className={`hover:text-foreground transition-colors max-w-[150px] truncate ${
                        index === getBreadcrumbPath().length - 1
                          ? "text-foreground font-medium"
                          : ""
                      }`}
                      title={crumb.name} // Show full name on hover
                    >
                      {crumb.name}
                    </button>
                  </div>
                ))
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Refresh Button */}
            <Button
              variant="ghost"
              size="icon"
              className={`w-8 h-8 rounded-full text-foreground/60 hover:text-foreground ${
                isRefreshing ? 'animate-spin' : ''
              }`}
              onClick={handleRefreshClick}
              disabled={isRefreshing}
              title="Refresh all content"
            >
              <RefreshCcw className="w-4 h-4" />
            </Button>

            {/* Enhanced Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search all files..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 w-64 bg-input border-border"
                title="Search across all your files and folders"
              />
            </div>

            {/* Notifications */}
            <NotificationDropdown />

            {/* User Avatar */}
            <Avatar className="cursor-pointer" onClick={handleProfileClick}>
              <AvatarFallback className="bg-panel text-panel-foreground hover:bg-panel/90 transition-colors">
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
                  {getBreadcrumbPath()[getBreadcrumbPath().length - 1]?.name || "My Files"}
                </h1>
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
                    onClick={() => {
                      setUploadParentId(folderId || null);
                      setIsUploadModalOpen(true);
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>

              {/* Enhanced File List */}
              <EnhancedFileList
                searchQuery={searchQuery}
                onRefresh={handleRefreshClick}
              />
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setUploadParentId(null);
        }}
        currentFolder={{ id: uploadParentId }}
        onFileUploaded={(file, parentId) => {
          handleFileUpload(file, parentId);
        }}
      />
      <NewFolderModal
        isOpen={isNewFolderModalOpen}
        onClose={() => setIsNewFolderModalOpen(false)}
        parentId={folderId}
        onFolderCreated={handleFolderCreated}
      />
    </div>
  );
}