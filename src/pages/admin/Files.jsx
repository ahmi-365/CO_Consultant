import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FolderPlus,
  Upload,
  Search,
  RefreshCw,
  Home,
  HardDrive,
  FolderOpen,
  Move,
  ArrowUp,
  MoreHorizontal,
  X,
  Loader2,
} from "lucide-react";
import FileItem from "@/components/admin/Files/FileItem";
import UserPermissions from "@/components/admin/Files/UserPermissions";
import FilePreviewDialog from "@/components/admin/Files/FilePreviewDialog";
import DragDropZone from "@/components/admin/Files/DragDropZone";
import FileUploadModal from "@/components/FileUploadModal"; // Import your existing modal
import { fileApi, getCachedFiles } from "@/services/FileService";
import { useToast } from "@/hooks/use-toast";
import SearchUser from "../../components/admin/Files/SearchUser";
import MoveFileDialog from '@/components/MoveFileDialog';

export default function FileManagement() {
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false); // For your FileUploadModal
  const [newFolderName, setNewFolderName] = useState("");
  const [moveDestination, setMoveDestination] = useState("");
  const [availableFolders, setAvailableFolders] = useState([]);
  const [preview, setPreview] = useState(null);
  const [openUsersDialog, setOpenUsersDialog] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [itemForPermissions, setItemForPermissions] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [isDeleting, setIsDeleting] = useState({});
  const [isDownloading, setIsDownloading] = useState({});
  const [isRenaming, setIsRenaming] = useState({});
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [itemToMove, setItemToMove] = useState(null);
const [searchDebounceTimer, setSearchDebounceTimer] = useState(null); // ← ADD THIS LINE
  const { toast } = useToast();
const base_url = import.meta.env.VITE_API_URL ;
  useEffect(() => {
    loadFiles();
  }, [currentPath, selectedUser]);
useEffect(() => {
  // Clear existing timer
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }

  // Set new timer for search
  const timer = setTimeout(() => {
    if (searchTerm.trim()) {
      loadFiles({ search: searchTerm.trim() });
    } else {
      // If search is cleared, reload normally
      loadFiles();
    }
  }, 500); // 500ms debounce

  setSearchDebounceTimer(timer);

  // Cleanup
  return () => {
    if (timer) clearTimeout(timer);
  };
}, [searchTerm]);
  // Load available folders for move dialog
  useEffect(() => {
    if (isMoveDialogOpen) {
      loadAvailableFolders();
    }
  }, [isMoveDialogOpen]);
const handleIframeUpdate = async (itemId, iframeUrl) => {
  try {
    const response = await fetch(`${base_url}/onedrive/update-iframe/${itemId}`, {
      method: 'POST',
     headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        iframe_url: iframeUrl
      })
    });
    
    const data = await response.json();
    
    if (data.status === 'ok') {
      // Update your local state here to reflect the change
      // For example, update the item in your files array
      setFiles(prevFiles => 
        prevFiles.map(file => 
          file.id === itemId 
            ? { ...file, iframe_url: iframeUrl }
            : file
        )
      );
      return data;
    } else {
      throw new Error(data.message || 'Failed to update iframe');
    }
  } catch (error) {
    throw error;
  }
};

const loadFiles = async (opts = {}) => {
  console.log("🔄 loadFiles called with opts:", opts);
  setLoading(true);
  
  try {
    const currentParentId = currentPath.length > 0 ? currentPath[currentPath.length - 1].id : null;
    
    const params = {
      ...(selectedUser ? { user_id: selectedUser } : {}),
      ...(opts.search ? { search: opts.search } : {}),
    };

    const options = {
      force: opts.force || !!selectedUser || !!opts.search,
    };

    console.log("📡 API call params:", { currentParentId, params, options });
    
    const response = await fileApi.listFiles(currentParentId, params, options);
    console.log("✅ Full API Response:", response);
    
    // SIMPLIFIED response handling
    let data = [];
    if (Array.isArray(response)) {
      data = response;
    } else if (response?.data) {
      data = Array.isArray(response.data) ? response.data : [response.data];
    } else if (response?.files) {
      data = Array.isArray(response.files) ? response.files : [response.files];
    }
    
    console.log("📊 Extracted data:", data);
    console.log("📊 Data length:", data.length);
    
    // Apply filtering only when NOT searching
    const safeData = opts.search 
      ? data  
      : data.filter((f) => {
          if (currentParentId === null) {
            return f.parent_id === 1 || f.parent_id === null || f.parent_id === 2;
          } else {
            return f.parent_id === currentParentId;
          }
        });

    console.log("🎯 Final files to display:", safeData);
    setFiles(safeData);
    
  } catch (error) {
    console.error("❌ Failed to load files:", error);
    toast({
      title: "Error",
      description: "Failed to load files",
      variant: "destructive",
    });
    setFiles([]);
  } finally {
    setLoading(false);
  }
};

  const loadAvailableFolders = async () => {
    setLoadingFolders(true);
    try {
      // Get folders from root level for move destination
      const data = await fileApi.listFiles(null);
      const folders = Array.isArray(data)
        ? data.filter((item) => item.type === "folder")
        : [];
      setAvailableFolders(folders);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load folders",
        variant: "destructive",
      });
      setAvailableFolders([]);
    } finally {
      setLoadingFolders(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    setIsCreating(true);
    try {
      const parentId =
        currentPath.length > 0 ? currentPath[currentPath.length - 1].id : null;

      await fileApi.createFolder(newFolderName.trim(), parentId);

      toast({
        title: "Success",
        description: "Folder created successfully",
      });

      setNewFolderName("");
      setIsCreateFolderOpen(false);
      loadFiles({ force: true });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Handle file upload completion from FileUploadModal
  const handleFileUploaded = async (uploadedFile) => {
    // Refresh the files list
    await loadFiles({ force: true });
  };

  const handleFileDrop = async (files, targetFolderId) => {
    const fileArray = Array.from(files);
    
    // Use the FileUploadModal for dropped files
    if (fileArray.length > 0) {
      setIsUploadOpen(true);
      // Note: You might need to modify FileUploadModal to accept pre-selected files
      // For now, this opens the modal and user can select files again
    }
  };

  const handleFileSelect = (item) => {
    if (item.type === "folder") {
      setCurrentPath([...currentPath, { id: item.id, name: item.name }]);
    }
    setSelectedItem(item);
  };

  const handleDownload = async (id, filename) => {
    setIsDownloading((prev) => ({ ...prev, [id]: true }));
    try {
      // Get the download URL from your API
      const response = await fileApi.getDownloadUrl(id);

      console.log('API Response:', response);

      // Handle different response formats
      let downloadUrl;
      if (typeof response === 'string') {
        // Direct URL string
        downloadUrl = response;
      } else if (response && response.download_url) {
        // Response object with download_url property
        downloadUrl = response.download_url;
      } else if (response && response.url) {
        // Response object with url property
        downloadUrl = response.url;
      } else {
        throw new Error('Invalid response format: no download URL found');
      }

      if (!downloadUrl) {
        throw new Error('Download URL is empty or undefined');
      }

      console.log('Download URL retrieved:', downloadUrl);

      // Create a temporary link element and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'file';

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: `Downloading ${filename}`,
      });

    } catch (error) {
      console.error('Failed to download file:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      toast({
        title: "Error",
        description: `Failed to download file: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsDownloading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async (id) => {
    setIsDeleting((prev) => ({ ...prev, [id]: true }));
    try {
      await fileApi.deleteItem(id);
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
      loadFiles({ force: true });

      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    } finally {
      setIsDeleting((prev) => ({ ...prev, [id]: false }));
    }
  };

const handleMove = async (item) => {
  console.log("handleMove called with:", item); // Debug log
  
  if (!item) {
    console.error("No item provided to handleMove");
    return;
  }
  
  if (!item.id) {
    console.error("Item missing ID:", item);
    toast({
      title: "Error",
      description: "Selected item has no ID",
      variant: "destructive",
    });
    return;
  }
  
  console.log("Setting itemToMove:", item);
  setItemToMove(item);
  setIsMoveDialogOpen(true);
};

  const handleConfirmMove = async () => {
    if (!itemToMove || !moveDestination) {
      console.warn("⚠️ No itemToMove or moveDestination provided", {
        itemToMove,
        moveDestination,
      });
      toast({
        title: "Error",
        description: "Please select an item and destination",
        variant: "destructive",
      });
      return;
    }

    setIsMoving(true);
    try {
      const dest = moveDestination === "root" ? null : moveDestination;

      console.log("📦 Moving item", { itemToMove, dest });

      const result = await fileApi.moveItem(itemToMove, dest);
      console.log("✅ Move result:", result);

      toast({
        title: "Success",
        description: "Item moved successfully",
      });

      setIsMoveDialogOpen(false);
      setItemToMove(null);
      setMoveDestination("");

      // wait for files to reload
      await loadFiles({ force: true });

    } catch (error) {
      console.error("🚨 Move failed:", error);

      if (
        error.name === "TypeError" &&
        error.message.includes("Failed to fetch")
      ) {
        console.error("🌐 Possible CORS/network issue during move request");
      }

      toast({
        title: "Error",
        description: "Failed to move item",
        variant: "destructive",
      });
    } finally {
      setIsMoving(false);
    }
  };

  const handleRename = async (id, newName) => {
    setIsRenaming((prev) => ({ ...prev, [id]: true }));
    try {
      await fileApi.renameItem(id, newName);
      loadFiles({ force: true });

      toast({
        title: "Success",
        description: "Item renamed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to rename item",
        variant: "destructive",
      });
    } finally {
      setIsRenaming((prev) => ({ ...prev, [id]: false }));
    }
  };
    const handleMoveSuccess = async (movedItem, destination) => {
  await loadFiles({ force: true });
};

  const handleManagePermissions = (item) => {
    setItemForPermissions(item);
    setShowPermissionsDialog(true);
  };

  const handlePreview = async (item) => {
    if (item.type !== "file") return;
    try {
      const url = await fileApi.getDownloadUrl(item.id);
      const ext = item.name.split(".").pop()?.toLowerCase() || "";
      setPreview({ open: true, url, name: item.name, type: ext });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load preview",
        variant: "destructive",
      });
    }
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
      // Root level
      setCurrentPath([]);
    } else {
      setCurrentPath(currentPath.slice(0, index + 1));
    }
  };

  const handleSync = async () => {
    setLoading(true);
    try {
      await fileApi.syncFiles();
      loadFiles({ force: true });

      toast({
        title: "Success",
        description: "Files synchronized successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sync files",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter files for current folder search only
const displayItems = files;  // ← Just display what API returns

  // Get current folder for FileUploadModal
  const currentFolder = currentPath.length > 0 
    ? currentPath[currentPath.length - 1] 
    : null;

  return (
    <DragDropZone onFileDrop={handleFileDrop}>
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 border-b pb-4">
            {/* Left side: title and subtitle */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
                File Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Organize and manage your team's files with ease
              </p>
            </div>

            {/* Right side: buttons */}
            <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
              {/* Sync Button */}
              <button
                onClick={handleSync}
                disabled={loading}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                {loading ? "Syncing..." : "Sync"}
              </button>

              {/* Upload Button - Now opens FileUploadModal */}
              <button
                onClick={() => setIsUploadOpen(true)}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </button>

              {/* New Folder Button */}
              <button
                onClick={() => setIsCreateFolderOpen(true)}
                disabled={isCreating}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-panel hover:bg-panel/60 rounded-lg transition disabled:opacity-50"
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FolderPlus className="h-4 w-4 mr-2" />
                )}
                {isCreating ? "Creating..." : "New Folder"}
              </button>
            </div>
          </div>

          {/* Breadcrumb Navigation */}
          <div className="mb-6 animate-fade-in">
            <nav className="flex items-center justify-between bg-card p-4 rounded-lg shadow-file border">
              <div className="flex items-center space-x-2 text-sm overflow-x-auto whitespace-nowrap">
                <button
                  onClick={() => handleBreadcrumbClick(-1)}
                  disabled={loading}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 cursor-pointer transition-smooth font-medium disabled:opacity-50"
                >
                  <Home className="h-4 w-4" />
                  Root
                </button>
                {currentPath.map((folder, index) => (
                  <div key={folder.id} className="flex items-center">
                    <span className="mx-2 text-muted-foreground">/</span>
                    <button
                      onClick={() => handleBreadcrumbClick(index)}
                      disabled={loading}
                      className="text-primary hover:text-primary/80 cursor-pointer transition-smooth font-medium disabled:opacity-50"
                    >
                      {folder.name}
                    </button>
                  </div>
                ))}
              </div>

              {/* Parent folder navigation */}
              {currentPath.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleBreadcrumbClick(currentPath.length - 2)
                    }
                    disabled={loading}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <ArrowUp className="h-4 w-4" />
                    Back
                  </Button>
                </div>
              )}
            </nav>
          </div>

          <div className="grid grid-cols-1">
            {/* Main File Area */}
            <div className="animate-fade-in">
              <Card className="shadow-card border-0 bg-gradient-file">
                <CardHeader className="bg-card/95 backdrop-blur-sm rounded-t-lg border-b">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <HardDrive className="h-5 w-5 text-primary" />
                      Files & Folders
                    </CardTitle>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                      {/* User Filter */}
                      <div className="w-full sm:w-auto">
                        <SearchUser
                          selectedUser={selectedUser}
                          onUserSelect={setSelectedUser}
                        />
                      </div>

                      {/* Search Input - Current folder only */}
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
placeholder={searchTerm ? "Searching..." : "Search files..."}
                          className="pl-9 w-full border-border bg-background"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSearchTerm("")}
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="bg-card/95 backdrop-blur-sm rounded-b-lg p-6">
                  <div className="space-y-3">
                    {loading ? (
                      <div className="text-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
                        <p className="text-muted-foreground">Loading files...</p>
                      </div>
                    ) : displayItems.length === 0 ? (
                      <div className="text-center py-12">
                        <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">
                          {searchTerm ? "No files found" : "No files available"}
                        </h3>
                        <p className="text-muted-foreground">
                          {searchTerm
                            ? `No results found for "${searchTerm}". Try different search terms.`
                            : "Start by uploading files or creating folders"}
                        </p>
                      </div>
                    ) : (
                      // Grid layout for 3 columns on medium screens and up
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displayItems.map((item) => (
                          <div key={item.id} className="relative">
                            <DragDropZone
                              onFileDrop={handleFileDrop}
                              folderId={item.id}
                              isFolder={item.type === "folder"}
                              className="rounded-lg h-full"
                            >
                              <FileItem
                                item={item}
                                onSelect={handleFileSelect}
                                onDelete={handleDelete}
                                onMove={handleMove}
                                onDownload={handleDownload}
                                onRename={handleRename}
                                onManagePermissions={handleManagePermissions}
                                isDeleting={isDeleting[item.id]}
                                isDownloading={isDownloading[item.id]}
                                isRenaming={isRenaming[item.id]}
  onIframeUpdate={handleIframeUpdate}
                              />
                            </DragDropZone>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* File Upload Modal - Replace the old upload dialog */}
          <FileUploadModal
            isOpen={isUploadOpen}
            onClose={() => setIsUploadOpen(false)}
            onFileUploaded={handleFileUploaded}
            currentFolder={currentFolder}
          />

          {/* Create Folder Dialog */}
          <Dialog
            open={isCreateFolderOpen}
            onOpenChange={setIsCreateFolderOpen}
          >
            <DialogContent className="bg-card shadow-card">
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  Create New Folder
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Enter a name for the new folder
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <Input
                  placeholder="Folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !isCreating && handleCreateFolder()
                  }
                  className="border-border"
                  disabled={isCreating}
                />
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateFolderOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>

                <Button
                  className="bg-panel flex items-center gap-2"
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim() || isCreating}
                >
                  {isCreating && (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  )}
                  {isCreating ? "Creating..." : "Create Folder"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Move Item Dialog */}
         <MoveFileDialog
  isOpen={isMoveDialogOpen}
  onClose={() => {
    setIsMoveDialogOpen(false);
    setItemToMove(null);
  }}
  itemToMove={itemToMove}
  onMoveSuccess={handleMoveSuccess}
  currentPath={currentPath}
/>

          {/* User Permissions Dialog */}
          <Dialog
            open={showPermissionsDialog}
            onOpenChange={setShowPermissionsDialog}
          >
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <UserPermissions
                selectedItem={itemForPermissions}
                onPermissionChange={() => loadFiles({ force: true })}
                openUsersDialog={false}
                onOpenUsersDialogChange={() => {}}
                onClose={() => setShowPermissionsDialog(false)}
              />
            </DialogContent>
          </Dialog>

          {/* File Preview Dialog */}
          <FilePreviewDialog
            open={preview?.open || false}
            onOpenChange={(open) => setPreview(open ? preview : null)}
            file={preview}
            onDownload={
              preview
                ? () => handleDownload(selectedItem?.id || "", preview.name)
                : undefined
            }
          />
        </div>
      </div>
    </DragDropZone>
  );
}