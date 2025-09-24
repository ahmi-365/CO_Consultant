import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import FileHeader from "./Files/FileHeader";
import FileNavigation from "./Files/FileNavigation";
import FileContent from "./Files/FileContent";
import FileDialogs from "./Files/FileDialogs";
import { fileApi, fetchRecentFiles } from "@/services/FileService";
import { searchService } from "../../services/SearchService";
import { useToast } from "../../hooks/use-toast";
import { hasPermission } from "../../utils/permissions";
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

  // Load files when path changes
  useEffect(() => {
    loadFiles();
  }, [currentPath]);

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

      const results = searchService.search(searchTerm);
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
const loadFiles = async (opts = {}) => {
  console.log("🔄 loadFiles called with opts:", opts);

  setLoading(true);
  try {
    const currentParentId =
      currentPath.length > 0 ? currentPath[currentPath.length - 1].id : null;

    console.log("📂 Current Parent ID:", currentParentId);
    console.log("📍 Current Path:", currentPath);

    // Prepare parameters with parent_id
    const params = {
      parent_id: currentParentId // Explicitly pass parent_id
    };
    
    const options = { force: opts.force };

    console.log("⚙️ API call parameters:", {
      parentId: currentParentId,
      params,
      options,
    });
    
    console.log("📡 Calling fileApi.listFiles with parentId:", currentParentId);

    // Pass the parentId as the first parameter AND in params for redundancy
    const data = await fileApi.listFiles(currentParentId, params, options);
    console.log("✅ API Response raw:", data);

    // CRITICAL FIX: Handle response structure
    const safeData = Array.isArray(data) ? data : (data?.files || []);
    
    // Debug logging
    console.log("📊 Safe Data (files count):", safeData.length);
    console.log("📋 Parent IDs in response:", [...new Set(safeData.map(f => f.parent_id))]);
    console.log("🎯 Expected parent_id:", currentParentId);
    
    // Filter files to ensure they belong to current parent
    const filteredFiles = safeData.filter(file => {
      // For root level (currentParentId is null)
      if (currentParentId === null) {
        // Show files with parent_id = null, 1 (admin assigned), or 2 (UserRoot)
        return file.parent_id === null || file.parent_id === 1 || file.parent_id === 2;
      }
      // For nested folders, show only files with matching parent_id
      return file.parent_id === currentParentId;
    });
    
    console.log("🔍 Filtered Files (parent match):", filteredFiles.length);
    console.log("📁 Filtered files preview:", filteredFiles.slice(0, 3).map(f => ({
      id: f.id,
      name: f.name,
      parent_id: f.parent_id,
      type: f.type
    })));

    setFiles(filteredFiles);
  } catch (error) {
    console.error("❌ Failed to load files:", error);
    toast({
      title: "Error",
      description: "Failed to load files. Please check your authentication.",
      variant: "destructive",
    });
    setFiles([]);
  } finally {
    console.log("🏁 loadFiles finished");
    setLoading(false);
  }
};
  // Load recent files
  const loadRecentFiles = async () => {
    try {
      const response = await fetchRecentFiles();
      let recentFilesData = [];

      if (
        response &&
        response.status === "ok" &&
        Array.isArray(response.recent_views)
      ) {
        recentFilesData = response.recent_views;
      } else if (Array.isArray(response)) {
        recentFilesData = response;
      }

      const sorted = recentFilesData
        .filter((f) => f && f.viewed_at)
        .sort((a, b) => new Date(b.viewed_at) - new Date(a.viewed_at))
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

  // Handle file upload
  const handleFileUpload = async (file, targetFolderId) => {
    setIsUploading(true);
    try {
      const parentId =
        targetFolderId ||
        (currentPath.length > 0
          ? currentPath[currentPath.length - 1].id
          : null);

      await fileApi.uploadFile(file, parentId);

      toast({
        title: "Success",
        description: `File "${file.name}" uploaded successfully`,
      });

      // Refresh files and recent files
      await loadFiles({ force: true });
      await loadRecentFiles();

      // Refresh search index
      searchService.clearIndex();
      await searchService.indexAllFiles(true);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to upload file "${file.name}"`,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await loadFiles({ force: true });
      await loadRecentFiles();
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

      const message =
        response.success === true
          ? response.message || "Files moved successfully"
          : response.error || "Something went wrong";

      const variant = response.success === true ? "default" : "default";

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

  const handleStarChange = (fileId, isStarred) => {
    // Update files state
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.id === fileId ? { ...file, is_starred: isStarred } : file
      )
    );

    // Update search results if in global search
    if (isGlobalSearch) {
      setSearchResults((prevResults) =>
        prevResults.map((file) =>
          file.id === fileId ? { ...file, is_starred: isStarred } : file
        )
      );
    }

    // Update recent files
    setRecentFiles((prevRecent) =>
      prevRecent.map((file) =>
        file.id === fileId ? { ...file, is_starred: isStarred } : file
      )
    );
  };

  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Upload Progress Overlay */}
        {isUploading && (
          <div className="fixed top-4 left-4 right-4 sm:top-4 sm:right-4 sm:left-auto bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Uploading files...</span>
          </div>
        )}


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
  onFileUpload={handleFileUpload} // Keep this for future use if needed
  currentPath={currentPath}
  setIsUploading={setIsUploading} // Add this prop to control upload state from parent
  loadFiles={loadFiles} // Add this prop to refresh files after upload
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
          }
          isSelectionMode={isSelectionMode}
          selectedFiles={selectedFiles}
          onStarChange={handleStarChange}
        />

        {/* Bulk action toolbar */}
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