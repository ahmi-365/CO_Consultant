import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Home,
  Users,
  Star,
  Trash2,
  Upload,
  User,
  FileText,
  Download,
  Loader2,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { fileApi } from "../services/FileService";
import { starService } from "../services/Starredservice";
import { trashService } from "../services/trashservice";
import { toast } from "sonner";
import FileUploadModal from "./FileUploadModal";

export default function EnhancedSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { folderId } = useParams();
  const currentPath = location.pathname;
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [allItems, setAllItems] = useState([]);
  const [folders, setFolders] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [loadingActions, setLoadingActions] = useState({
    download: new Set(),
    move: new Set(),
    star: new Set(),
    rename: new Set(),
    trash: new Set(),
  });

  // Use a state to hold the current folder information for the modal
  const [uploadTargetFolder, setUploadTargetFolder] = useState({
    id: null,
    name: "Root",
    path: "/",
  });

  const isActive = (path) => currentPath === path;

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Helper function to set loading state for specific actions
  const setActionLoading = (action, itemId, isLoading) => {
    setLoadingActions(prev => {
      const newState = { ...prev };
      if (isLoading) {
        newState[action] = new Set([...prev[action], itemId]);
      } else {
        newState[action] = new Set([...prev[action]]);
        newState[action].delete(itemId);
      }
      return newState;
    });
  };

  const isActionLoading = (action, itemId) => {
    return loadingActions[action].has(itemId);
  };

  useEffect(() => {
    loadAllItems();
  }, []);

  // New useEffect to handle URL folderId changes and update upload target
  useEffect(() => {
    let targetFolder = {
      id: null,
      name: "Root",
      path: "/",
    };
    if (folderId) {
      // Find the folder from the allItems list
      const folderItem = allItems.find(item => item.id.toString() === folderId);
      if (folderItem) {
        targetFolder = {
          id: folderItem.id,
          name: folderItem.name,
          path: `/folder/${folderItem.id}`,
          fullPath: "Root / " + folderItem.name // Simplified, you can use your buildFolderPath logic here
        };
      }
    }
    setUploadTargetFolder(targetFolder);
  }, [folderId, allItems]);

  const handleFileUploaded = () => {
    loadAllItems();
    window.dispatchEvent(new CustomEvent("fileUploaded"));
  };

  const handleUploadClick = () => {
    setShowUploadModal(true);
    if (isMobile) {
      setIsMobileSidebarOpen(false);
    }
  };

  const handleNavigationClick = (path) => {
    navigate(path);
    if (isMobile) {
      setIsMobileSidebarOpen(false);
    }
  };

  const loadAllItems = async () => {
    try {
      setIsLoading(true);
      const response = await fileApi.listFiles();
      if (Array.isArray(response)) {
        setAllItems(response);
        const organizedFolders = organizeItemsHierarchically(response);
        setFolders(organizedFolders);
      } else if (response.status === 'ok' && Array.isArray(response.data)) {
        setAllItems(response.data);
        const organizedFolders = organizeItemsHierarchically(response.data);
        setFolders(organizedFolders);
      }
    } catch (error) {
      console.error("Error loading items:", error);
      toast.error("Error loading folders");
    } finally {
      setIsLoading(false);
    }
  };

  const organizeItemsHierarchically = (items) => {
    const itemMap = new Map();
    const rootFolders = [];

    items.forEach(item => {
      itemMap.set(item.id, {
        ...item,
        children: [],
        files: [],
        isLoaded: true,
      });

      if ((item.parent_id === 1 || item.parent_id === 2 || item.parent_id === null) && item.type === 'folder') {
        rootFolders.push(item.id);
      }
    });

    items.forEach(item => {
      if (item.parent_id && itemMap.has(item.parent_id)) {
        const parent = itemMap.get(item.parent_id);

        if (item.type === 'folder') {
          parent.children.push(itemMap.get(item.id));
        } else {
          parent.files.push(item);
        }
      }
    });

    return rootFolders.map(id => itemMap.get(id)).filter(Boolean);
  };

  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFolderClick = (folderId) => {
    navigate(`/folder/${folderId}`);
    if (isMobile) {
      setIsMobileSidebarOpen(false);
    }
  };

  const handleFileClick = (fileId) => {
    console.log("File clicked:", fileId);
    if (isMobile) {
      setIsMobileSidebarOpen(false);
    }
  };

  const handleStarToggle = async (itemId, currentStarStatus) => {
    setActionLoading('star', itemId, true);
    try {
      const response = await starService.toggleStar(itemId);
      if (response.status === "ok") {
        toast.success(response.message || `File ${currentStarStatus ? 'unstarred' : 'starred'}`);
        await loadAllItems(); // Refresh to show updated star status
        window.dispatchEvent(new CustomEvent("refreshFileList"));
      } else {
        toast.error(response.message || "Failed to update star status");
      }
    } catch (error) {
      console.error("Error toggling star:", error);
      toast.error("Error updating star status");
    } finally {
      setActionLoading('star', itemId, false);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    setActionLoading('download', fileId, true);
    try {
      const response = await fileApi.getDownloadUrl(fileId);
      
      // Handle different response formats
      if (response && (response.success || response.download_url || response.url)) {
        const downloadUrl = response.download_url || response.url || response.data?.download_url || response.data?.url;
        
        if (downloadUrl) {
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = fileName;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast.success(`Downloaded ${fileName}`);
        } else {
          toast.error("Download URL not available");
        }
      } else {
        toast.error("Failed to get download URL");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Error downloading file");
    } finally {
      setActionLoading('download', fileId, false);
    }
  };

  const handleTrashToggle = async (itemId, itemName, isCurrentlyTrashed) => {
    setActionLoading('trash', itemId, true);
    try {
      let response;
      if (isCurrentlyTrashed) {
        response = await trashService.restoreFromTrash(itemId);
        if (response.success) {
          toast.success(`${itemName} restored from trash`);
        }
      } else {
        response = await trashService.moveToTrash(itemId);
        if (response.success) {
          toast.success(`${itemName} moved to trash`);
        }
      }
      
      if (response.success) {
        await loadAllItems();
        window.dispatchEvent(new CustomEvent("refreshFileList"));
      } else {
        toast.error(`Failed to ${isCurrentlyTrashed ? 'restore' : 'trash'} item`);
      }
    } catch (error) {
      console.error("Error with trash operation:", error);
      toast.error("Error with trash operation");
    } finally {
      setActionLoading('trash', itemId, false);
    }
  };

  const handleDrop = async (e, folderId) => {
    e.preventDefault();
    const fileId = e.dataTransfer.getData("text/plain");

    if (!fileId) return;

    try {
      await fileApi.moveItem(fileId, folderId);
      toast.success("File moved successfully");
      await loadAllItems();
      window.dispatchEvent(new CustomEvent("filesMoved"));
    } catch (error) {
      console.error("Error moving file:", error);
      toast.error("Error moving file");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const renderFile = (file, level) => {
    const isDownloading = isActionLoading('download', file.id);
    const isMoving = isActionLoading('move', file.id);
    const isStarring = isActionLoading('star', file.id);
    const isTrashing = isActionLoading('trash', file.id);
    const isAnyActionLoading = isDownloading || isMoving || isStarring || isTrashing;

    return (
      <div
        key={file.id}
        className={`flex items-center gap-1 ${isMoving ? 'opacity-50' : ''}`}
        style={{ marginLeft: `${(level + 1) * (isMobile ? 12 : 16)}px` }}
      >
        <div className="w-3 h-3" />
        <button
          onClick={() => handleFileClick(file.id)}
          className="flex items-center gap-2 px-2 py-1 text-sm w-full text-left rounded transition-colors text-sidebar-foreground hover:bg-sidebar-accent/50 group"
          draggable={!isAnyActionLoading && !isMobile}
          onDragStart={(e) => {
            if (!isAnyActionLoading && !isMobile) {
              e.dataTransfer.setData("text/plain", file.id);
            } else {
              e.preventDefault();
            }
          }}
          disabled={isAnyActionLoading}
        >
          <FileText className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          <span className="truncate flex-1" title={file.name}>{file.name}</span>
          
          {/* Star indicator with loading state */}
          {isStarring ? (
            <Loader2 className="w-3 h-3 animate-spin text-yellow-400 flex-shrink-0" />
          ) : (
            file.is_starred && <Star className="w-3 h-3 text-yellow-400 fill-current flex-shrink-0" />
          )}
          
          {/* Action buttons - Hide on mobile for cleaner UI */}
          {!isMobile && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
              {/* Star button */}
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-sidebar-accent"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStarToggle(file.id, file.is_starred);
                }}
                disabled={isStarring}
              >
                {isStarring ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Star className={`w-3 h-3 ${file.is_starred ? 'text-yellow-400 fill-current' : ''}`} />
                )}
              </Button>
              
              {/* Download button */}
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-sidebar-accent"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(file.id, file.name);
                }}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Download className="w-3 h-3" />
                )}
              </Button>
              
              {/* Trash button */}
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-sidebar-accent hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTrashToggle(file.id, file.name, file.is_trashed);
                }}
                disabled={isTrashing}
              >
                {isTrashing ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Trash2 className="w-3 h-3" />
                )}
              </Button>
            </div>
          )}
          
          {/* Status indicators */}
          {isMoving && (
            <span className="text-xs text-muted-foreground flex-shrink-0">Moving...</span>
          )}
        </button>
      </div>
    );
  };

  const renderFolder = (folder, level = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isCurrentFolder = currentPath === `/folder/${folder.id}`;
    const hasChildren = folder.children && folder.children.length > 0;
    const hasFiles = folder.files && folder.files.length > 0;
    const isStarring = isActionLoading('star', folder.id);
    const isTrashing = isActionLoading('trash', folder.id);
    const isAnyActionLoading = isStarring || isTrashing;

    return (
      <div key={folder.id} className="space-y-1">
        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleFolder(folder.id)}
            className="p-0.5 hover:bg-sidebar-accent rounded transition-colors flex-shrink-0"
            disabled={isAnyActionLoading}
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-sidebar-foreground/60" />
            ) : (
              <ChevronRight className="w-3 h-3 text-sidebar-foreground/60" />
            )}
          </button>
          <button
            onClick={() => handleFolderClick(folder.id)}
            onDrop={(e) => !isMobile && handleDrop(e, folder.id)}
            onDragOver={!isMobile ? handleDragOver : undefined}
            className={`flex items-center gap-2 px-2 py-1 text-sm w-full text-left rounded transition-colors group ${
              isCurrentFolder
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            }`}
            style={{ marginLeft: `${level * (isMobile ? 12 : 16)}px` }}
            disabled={isAnyActionLoading}
          >
            {isExpanded ? (
              <FolderOpen className="w-4 h-4 text-panel flex-shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-panel flex-shrink-0" />
            )}
            <span className="truncate flex-1" title={folder.name}>{folder.name}</span>
            
            {/* Star indicator with loading state */}
            {isStarring ? (
              <Loader2 className="w-3 h-3 animate-spin text-yellow-400 flex-shrink-0" />
            ) : (
              folder.is_starred && <Star className="w-3 h-3 text-yellow-400 fill-current flex-shrink-0" />
            )}
            
            {/* Action buttons for folders - Hide on mobile */}
            {!isMobile && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                {/* Star button */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-sidebar-accent"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStarToggle(folder.id, folder.is_starred);
                  }}
                  disabled={isStarring}
                >
                  {isStarring ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Star className={`w-3 h-3 ${folder.is_starred ? 'text-yellow-400 fill-current' : ''}`} />
                  )}
                </Button>
                
                {/* Trash button */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-sidebar-accent hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTrashToggle(folder.id, folder.name, folder.is_trashed);
                  }}
                  disabled={isTrashing}
                >
                  {isTrashing ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                </Button>
              </div>
            )}
          </button>
        </div>

        {isExpanded && (
          <div className="space-y-1">
            {hasChildren &&
              folder.children.map((child) => renderFolder(child, level + 1))}

            {hasFiles &&
              folder.files.map((file) => renderFile(file, level))}

            {!hasChildren && !hasFiles && (
              <div
                className="text-xs text-sidebar-foreground/60 px-2 py-1"
                style={{ marginLeft: `${(level + 1) * (isMobile ? 12 : 16)}px` }}
              >
                Empty folder
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const getTotalItems = () => {
    const totalFolders = allItems.filter(item => item.type === 'folder').length;
    const totalFiles = allItems.filter(item => item.type === 'file').length;
    return { totalFolders, totalFiles, total: totalFolders + totalFiles };
  };

  useEffect(() => {
    const handleFolderCreated = () => {
      loadAllItems();
    };

    const handleFilesMoved = () => {
      loadAllItems();
    };

    const handleFilesUploaded = () => {
      loadAllItems();
    };

    const handleRefreshSidebar = () => {
      loadAllItems();
    };

    window.addEventListener("folderCreated", handleFolderCreated);
    window.addEventListener("filesMoved", handleFilesMoved);
    window.addEventListener("filesUploaded", handleFilesUploaded);
    window.addEventListener("refreshSidebar", handleRefreshSidebar);

    return () => {
      window.removeEventListener("folderCreated", handleFolderCreated);
      window.removeEventListener("filesMoved", handleFilesMoved);
      window.removeEventListener("filesUploaded", handleFilesUploaded);
      window.removeEventListener("refreshSidebar", handleRefreshSidebar);
    };
  }, []);

  const stats = getTotalItems();

  // Sidebar Content Component (shared between desktop and mobile)
  const SidebarContent = ({ isMobileView = false }) => (
    <div className={`${isMobileView ? 'h-full' : 'w-60'} bg-sidebar border-r border-sidebar-border flex flex-col`}>
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-panel rounded-full flex items-center justify-center text-panel-foreground font-bold text-sm">
            CV
          </div>
          <span className="font-semibold text-sidebar-foreground">
            CloudVault
          </span>
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-sidebar-foreground/60" />
          )}
        </div>
        <div className="text-xs text-sidebar-foreground/60 mt-1">
          {isLoading ? "Loading..." : `${stats.total} items (${stats.totalFolders} folders, ${stats.totalFiles} files)`}
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <nav className="space-y-1">
          <button
            onClick={() => handleNavigationClick("/filemanager")}
            className={`flex items-center gap-2 px-3 py-2 w-full text-left rounded-md transition-colors ${
              isActive("/filemanager")
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="text-sm">Home</span>
          </button>

          <div className="mt-6">
            <div className="px-3 py-1 text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wide">
              My Files
            </div>

            <div className="mt-2 space-y-1">
              {isLoading ? (
                <div className="px-3 py-2 text-sm text-sidebar-foreground/60 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading folders...
                </div>
              ) : folders.length === 0 ? (
                <div className="px-3 py-2 text-sm text-sidebar-foreground/60">
                  No folders found
                </div>
              ) : (
                folders.map((folder) => renderFolder(folder))
              )}
            </div>
          </div>

          <div className="mt-8 space-y-1">
            <button
              onClick={() => handleNavigationClick("/shared")}
              className={`flex items-center gap-2 px-3 py-2 text-sm w-full rounded-md transition-colors ${
                isActive("/shared")
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Shared with me</span>
            </button>
            <button
              onClick={() => handleNavigationClick("/starred")}
              className={`flex items-center gap-2 px-3 py-2 text-sm w-full rounded-md transition-colors ${
                isActive("/starred")
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <Star className="w-4 h-4" />
              <span>Starred</span>
            </button>
            <button
              onClick={() => handleNavigationClick("/trash")}
              className={`flex items-center gap-2 px-3 py-2 text-sm w-full rounded-md transition-colors ${
                isActive("/trash")
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>Trash</span>
            </button>
            <button
              onClick={() => handleNavigationClick("/profile")}
              className={`flex items-center gap-2 px-3 py-2 text-sm w-full rounded-md transition-colors ${
                isActive("/profile")
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>
          </div>
        </nav>
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <Button
          className="w-full bg-panel hover:bg-panel/90 text-panel-foreground"
          onClick={handleUploadClick} 
        >
          <Upload className="w-4 h-4 mr-2" />
          New Upload
        </Button>
      </div>
    </div>
  );

  // Mobile: Return hamburger button and sheet
  if (isMobile) {
    return (
      <>
        {/* Mobile Hamburger Button */}
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm border shadow-sm"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SidebarContent isMobileView={true} />
          </SheetContent>
        </Sheet>

        <FileUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onFileUploaded={handleFileUploaded}
          currentFolder={uploadTargetFolder} 
        />
      </>
    );
  }

  // Desktop: Return normal sidebar
  return (
    <>
      <SidebarContent />
      <FileUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onFileUploaded={handleFileUploaded}
        currentFolder={uploadTargetFolder} 
      />
    </>
  );
}