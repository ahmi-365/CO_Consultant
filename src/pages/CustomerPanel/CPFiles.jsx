import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import FileHeader from "./Files/FileHeader";
import FileNavigation from "./Files/FileNavigation";
import FileContent from "./Files/FileContent";
import FileDialogs from "./Files/FileDialogs";
import { fileApi, fetchRecentFiles } from "@/services/FileService";
import { searchService } from "@/services/SearchService";
import { useToast } from "@/hooks/use-toast";
import { hasPermission } from "@/utils/permissions";
import BulkActionToolbar from "../../components/Customer/BulkActionToolbar";
import { trashService } from "../../services/trashservice";

export default function CPFileManagement() {
  // State management
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isGlobalSearch, setIsGlobalSearch] = useState(false);
  const [recentFiles, setRecentFiles] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [loadingFolders, setLoadingFolders] = useState(false);

  // Dialog states
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);

  // Form states
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [itemToMove, setItemToMove] = useState(null);
  const [moveDestination, setMoveDestination] = useState("");
  const [availableFolders, setAvailableFolders] = useState([]);
  const [itemForPermissions, setItemForPermissions] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [preview, setPreview] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState({});
  const [isDownloading, setIsDownloading] = useState({});
  const [isRenaming, setIsRenaming] = useState({});

  const { toast } = useToast();
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedFiles(new Set());
  };

  // Select all files
  const handleSelectAll = (allFileIds) => {
    setSelectedFiles(new Set(allFileIds));
  };
  // Load files when path or user changes
  useEffect(() => {
    loadFiles();
  }, [currentPath, selectedUser]);

  // Initialize search index
  useEffect(() => {
    initializeSearch();
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch();
      } else {
        setIsGlobalSearch(false);
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Load available folders for move dialog
  useEffect(() => {
    if (isMoveDialogOpen) {
      loadAvailableFolders();
    }
  }, [isMoveDialogOpen]);

  // Load recent files
  useEffect(() => {
    loadRecentFiles();
  }, []);

  // Initialize search index
  const initializeSearch = async () => {
    setIndexing(true);
    try {
      await searchService.indexAllFiles();
    } catch (error) {
      console.warn("Failed to initialize search index:", error);
    } finally {
      setIndexing(false);
    }
  };

  // Handle search functionality
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setIsGlobalSearch(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      if (indexing) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return handleSearch();
      }

      let results = searchService.search(searchTerm);

      if (selectedUser) {
        results = results.filter((item) => item.created_by === selectedUser);
      }

      setSearchResults(results);
      setIsGlobalSearch(true);
    } catch (error) {
      console.warn("Search failed:", error);
      toast({
        title: "Search Error",
        description: "Failed to search files. Using local folder search.",
        variant: "destructive",
      });
      setIsGlobalSearch(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Load files from API
  const loadFiles = async (opts = {}) => {
    setLoading(true);
    try {
      const currentParentId =
        currentPath.length > 0 ? currentPath[currentPath.length - 1].id : null;
      const params = {};
      if (selectedUser) {
        params.user_id = selectedUser;
      }
      const options = {
        force: opts.force || !!selectedUser,
      };

      const data = await fileApi.listFiles(currentParentId, params, options);
      const safeData = Array.isArray(data) ? data : [];
      setFiles(safeData);
    } catch (error) {
      console.error("Failed to load files:", error);
      toast({
        title: "Error",
        description: "Failed to load files. Please check your authentication.",
        variant: "destructive",
      });
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // Load recent files
  const loadRecentFiles = async () => {
    try {
      const files = await fetchRecentFiles();
      const sorted = files
        .map((f) => f.file)
        .filter((f) => f?.type === "file" && f?.created_at)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      setRecentFiles(sorted);
    } catch (error) {
      console.error("Error loading recent files:", error);
      setRecentFiles([]);
    }
  };

  // Load available folders for move dialog
  const loadAvailableFolders = async () => {
    setLoadingFolders(true);
    try {
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

  // Handle folder creation
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

  // Handle refresh
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await loadFiles({ force: true });
    } catch (error) {
      console.error("Error refreshing files:", error);
      toast({
        title: "Error",
        description: "Failed to refresh files.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
      setCurrentPath([]);
    } else {
      setCurrentPath(currentPath.slice(0, index + 1));
    }
  };
const handleBulkMoveToTrash = async (fileIds) => {
  try {
    const response = await trashService.bulkMoveToTrash(fileIds);
    console.log("TRASH RESPONSE:", response);

    // backend ka ulta structure handle kar rahe hain
    const message = response.success === true 
      ? response.message || "Files moved successfully"
      : response.error || "Something went wrong";

    const variant = response.success === true ? "default" : "default"; 
    // yahan default variant use karenge kyunki backend ka success=false hai, par message success ka hai

    loadFiles({ force: true });
    setSelectedFiles(new Set());
    setIsSelectionMode(false);

    toast({
      title: "Success",
      description: message,
      variant: variant,
    });

  } catch (err) {
    console.error(err);
    toast({
      title: "Error",
      description: err.message || "Network error",
      variant: "destructive",
    });
  }
};


  const handleFolderNavigation = (item) => {
    console.log("Navigating to folder:", item);
    if (item.type === "folder") {
      setCurrentPath([...currentPath, { id: item.id, name: item.name }]);
    }
    setSelectedItem(item);
  };
  const handleFileSelection = (fileId, isSelected) => {
    console.log("File selection changed:", fileId, isSelected);

    setSelectedFiles((prev) => {
      const newSelected = new Set(prev);
      if (isSelected) {
        newSelected.add(fileId);
      } else {
        newSelected.delete(fileId);
      }
      console.log("New selected files:", Array.from(newSelected));
      return newSelected;
    });
  };

  useEffect(() => {
    console.log("Selected files changed:", Array.from(selectedFiles));
  }, [selectedFiles]);
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Upload Progress Overlay */}
        {isUploading && (
          <div className="fixed top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading files...
          </div>
        )}

        {/* Header Section with Recent Files */}
        <FileHeader
          recentFiles={recentFiles}
          isUploading={isUploading}
          isCreating={isCreating}
          isRefreshing={isRefreshing}
          user={user}
          hasPermission={hasPermission}
          setIsCreateFolderOpen={setIsCreateFolderOpen}
          handleRefresh={handleRefresh}
          isSelectionMode={isSelectionMode}
          toggleSelectionMode={toggleSelectionMode}
          selectedFiles={selectedFiles}
          files={files}
          handleSelectAll={handleSelectAll}
        />

        {/* Navigation Breadcrumb */}
        <FileNavigation
          currentPath={currentPath}
          loading={loading}
          handleBreadcrumbClick={handleBreadcrumbClick}
        />

        {/* Main File Content Area */}
        <FileContent
          files={files}
          searchResults={searchResults}
          isGlobalSearch={isGlobalSearch}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedUser={selectedUser}
          loading={loading}
          indexing={indexing}
          isSearching={isSearching}
          setIsGlobalSearch={setIsGlobalSearch}
          setSearchResults={setSearchResults}
          currentPath={currentPath}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          preview={preview}
          setPreview={setPreview}
          isDeleting={isDeleting}
          setIsDeleting={setIsDeleting}
          isDownloading={isDownloading}
          setIsDownloading={setIsDownloading}
          isRenaming={isRenaming}
          setIsRenaming={setIsRenaming}
          setItemForPermissions={setItemForPermissions}
          setShowPermissionsDialog={setShowPermissionsDialog}
          setItemToMove={setItemToMove}
          setIsMoveDialogOpen={setIsMoveDialogOpen}
          loadFiles={loadFiles}
          onFileSelect={
            isSelectionMode ? handleFileSelection : handleFolderNavigation
          } // Use conditional handler
          isSelectionMode={isSelectionMode}
          selectedFiles={selectedFiles}
        />
          {selectedFiles.size > 0 && isSelectionMode && (
            <BulkActionToolbar
              selectedCount={selectedFiles.size}
              onMoveToTrash={() =>
                handleBulkMoveToTrash(Array.from(selectedFiles))
              }
              onCancel={() => {
                setSelectedFiles(new Set());
                setIsSelectionMode(false);
              }}
            />
          )}
        {/* All Dialogs */}
        <FileDialogs
          isCreateFolderOpen={isCreateFolderOpen}
          setIsCreateFolderOpen={setIsCreateFolderOpen}
          isUploadOpen={isUploadOpen}
          setIsUploadOpen={setIsUploadOpen}
          isMoveDialogOpen={isMoveDialogOpen}
          setIsMoveDialogOpen={setIsMoveDialogOpen}
          showPermissionsDialog={showPermissionsDialog}
          setShowPermissionsDialog={setShowPermissionsDialog}
          newFolderName={newFolderName}
          setNewFolderName={setNewFolderName}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          setIsMoving={setIsMoving}
          itemToMove={itemToMove}
          setItemToMove={setItemToMove}
          moveDestination={moveDestination}
          setMoveDestination={setMoveDestination}
          availableFolders={availableFolders}
          itemForPermissions={itemForPermissions}
          isCreating={isCreating}
          isUploading={isUploading}
          isMoving={isMoving}
          loadingFolders={loadingFolders}
          handleCreateFolder={handleCreateFolder}
          loadFiles={loadFiles}
          currentPath={currentPath}
        />
      </div>
    </div>
  );
}
