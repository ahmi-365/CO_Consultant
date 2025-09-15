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
  Loader2
} from "lucide-react";
import FileItem from "@/components/admin/FileItem";
import UserPermissions from "@/components/admin/UserPermissions";
import FilePreviewDialog from "@/components/admin/FilePreviewDialog";
import DragDropZone from "@/components/admin/DragDropZone";
import { fileApi, getCachedFiles } from "@/services/FileService";
import { searchService } from "@/services/SearchService";
import { useToast } from "@/hooks/use-toast";

export default function FileManagement() {
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isGlobalSearch, setIsGlobalSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [itemToMove, setItemToMove] = useState(null);
  const [moveDestination, setMoveDestination] = useState("");
  const [availableFolders, setAvailableFolders] = useState([]);
  const [preview, setPreview] = useState(null);
  const [openUsersDialog, setOpenUsersDialog] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [itemForPermissions, setItemForPermissions] = useState(null);
  
  // New loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [isDeleting, setIsDeleting] = useState({});
  const [isDownloading, setIsDownloading] = useState({});
  const [isRenaming, setIsRenaming] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [loadingFolders, setLoadingFolders] = useState(false);
  
  const { toast } = useToast();

  // Load files on component mount and path changes
  useEffect(() => {
    loadFiles();
  }, [currentPath]);

  // Index files for global search on mount
  useEffect(() => {
    initializeSearch();
  }, []);

  // Handle search term changes with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch();
      } else {
        setIsGlobalSearch(false);
        setSearchResults([]);
      }
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Load available folders for move dialog
  useEffect(() => {
    if (isMoveDialogOpen) {
      loadAvailableFolders();
    }
  }, [isMoveDialogOpen]);

  const loadFiles = async (opts = {}) => {
    setLoading(true);
    try {
      const currentParentId = currentPath.length > 0 
        ? currentPath[currentPath.length - 1].id 
        : null;

      // Use cached memory unless force is true
      if (!opts.force) {
        const cached = getCachedFiles(currentParentId);
        if (cached) {
          setFiles(Array.isArray(cached) ? cached : []);
          setLoading(false);
          return;
        }
      }

      const data = await fileApi.listFiles(currentParentId);
      const safeData = Array.isArray(data) ? data : [];
      setFiles(safeData);
    } catch (error) {
      console.error('Failed to load files:', error);
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

  const initializeSearch = async () => {
    setIndexing(true);
    try {
      await searchService.indexAllFiles();
      console.log('Global search index initialized');
    } catch (error) {
      console.warn('Failed to initialize search index:', error);
    } finally {
      setIndexing(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setIsGlobalSearch(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // First ensure search index is ready
      if (indexing) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return handleSearch(); // Retry after short delay
      }

      const results = searchService.search(searchTerm);
      setSearchResults(results);
      setIsGlobalSearch(true);
    } catch (error) {
      console.warn('Search failed:', error);
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

  const handleSearchResultSelect = (result) => {
    // Navigate to parent folder if needed
    if (result.parent_path && result.parent_path !== '/') {
      // This would require path parsing to set correct breadcrumb
      // For now, we'll just show a message
      toast({
        title: "File Found",
        description: `File located at: ${result.path}`,
      });
    }
    
    setSelectedItem(result);
    
    // If it's a file, you could trigger download or preview
    if (result.type === 'file') {
      handlePreview(result);
    } 
  };

  const loadAvailableFolders = async () => {
    setLoadingFolders(true);
    try {
      // Get folders from root level for move destination
      const data = await fileApi.listFiles(null);
      const folders = Array.isArray(data) 
        ? data.filter(item => item.type === 'folder')
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
      const parentId = currentPath.length > 0 
        ? currentPath[currentPath.length - 1].id 
        : null;
      
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

  const handleUploadFile = async (file, targetFolderId) => {
    setIsUploading(true);
    try {
      const parentId = targetFolderId || (currentPath.length > 0 
        ? currentPath[currentPath.length - 1].id 
        : null);
      
      await fileApi.uploadFile(file, parentId);
      
      toast({
        title: "Success",
        description: `File "${file.name}" uploaded successfully`,
      });
      
      loadFiles({ force: true });
      
      // Refresh search index
      searchService.clearIndex();
      await searchService.indexAllFiles(true);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to upload file "${file.name}"`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleMultipleFilesUpload = async () => {
    if (!selectedFile) return;

    try {
      await handleUploadFile(selectedFile);
      setSelectedFile(null);
      setIsUploadOpen(false);
    } catch (error) {
      // Error already handled in handleUploadFile
    }
  };

  const handleFileDrop = async (files, targetFolderId) => {
    const fileArray = Array.from(files);
    
    setIsUploading(true);
    for (const file of fileArray) {
      await handleUploadFile(file, targetFolderId);
    }
    setIsUploading(false);
  };

  const handleFileSelect = (item) => {
    if (item.type === 'folder') {
      setCurrentPath([...currentPath, { id: item.id, name: item.name }]);
    }
    setSelectedItem(item);
  };

  const handleDownload = async (id, filename) => {
    setIsDownloading(prev => ({ ...prev, [id]: true }));
    try {
      await fileApi.downloadFile(id, filename);
      toast({
        title: "Download Started",
        description: `Downloading ${filename}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async (id) => {
    setIsDeleting(prev => ({ ...prev, [id]: true }));
    try {
      await fileApi.deleteItem(id);
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
      loadFiles({ force: true });
      
      // Refresh search index
      searchService.clearIndex();
      await searchService.indexAllFiles(true);
      
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
      setIsDeleting(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleMove = async (id) => {
    setItemToMove(id);
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
      const dest = moveDestination === 'root' ? null : moveDestination;

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

      // wait for files to reload before indexing
      await loadFiles({ force: true });

      console.log("🔍 Refreshing search index...");
      await searchService.clearIndex();
      await searchService.indexAllFiles(true);
      console.log("🔍 Index refresh done");
    } catch (error) {
      console.error("🚨 Move failed:", error);

      if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
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
    setIsRenaming(prev => ({ ...prev, [id]: true }));
    try {
      await fileApi.renameItem(id, newName);
      loadFiles({ force: true });
      
      // Refresh search index
      searchService.clearIndex();
      await searchService.indexAllFiles(true);
      
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
      setIsRenaming(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleManagePermissions = (item) => {
    setItemForPermissions(item);
    setShowPermissionsDialog(true);
  };

  const handlePreview = async (item) => {
    if (item.type !== 'file') return;
    try {
      const url = await fileApi.getDownloadUrl(item.id);
      const ext = item.name.split('.').pop()?.toLowerCase() || '';
      setPreview({ open: true, url, name: item.name, type: ext });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to load preview', 
        variant: 'destructive' 
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
      
      // Refresh search index after sync
      searchService.clearIndex();
      await searchService.indexAllFiles(true);
      
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

  // Determine what to display based on search state
  const displayItems = isGlobalSearch ? searchResults : files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DragDropZone onFileDrop={handleFileDrop}>
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Upload Progress Overlay */}
          {isUploading && (
            <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading files...
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-6 border-b pb-4">
            {/* Left side: title and subtitle */}
            <div>
              <h1 className="text-3xl font-semibold text-gray-800">
                File Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Organize and manage your team's files with ease
              </p>
            </div>

            {/* Right side: buttons */}
            <div className="flex gap-3">
              {/* Sync Button */}
              <button
                onClick={handleSync}
                disabled={loading}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                />
                {loading ? 'Syncing...' : 'Sync'}
              </button>

              {/* Upload Button */}
              <button
                onClick={() => setIsUploadOpen(true)}
                disabled={isUploading}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {isUploading ? 'Uploading...' : 'Upload'}
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
                {isCreating ? 'Creating...' : 'New Folder'}
              </button>
            </div>
          </div>

          {/* Breadcrumb Navigation */}
          <div className="mb-6 animate-fade-in">
            <nav className="flex items-center justify-between bg-card p-4 rounded-lg shadow-file border">
              <div className="flex items-center space-x-2 text-sm">
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
                    onClick={() => handleBreadcrumbClick(currentPath.length - 2)}
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

          <div className="grid grid-cols-1 gap-8">
            {/* Main File Area */}
            <div className="animate-fade-in">
              <Card className="shadow-card border-0 bg-gradient-file">
                <CardHeader className="bg-card/95 backdrop-blur-sm rounded-t-lg border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <HardDrive className="h-5 w-5 text-primary" />
                      {isGlobalSearch ? 'Global Search Results' : 'Files & Folders'}
                      {(indexing || isSearching) && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </CardTitle>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input 
                        placeholder={indexing ? "Indexing files..." : isSearching ? "Searching..." : "Search all files and folders..."} 
                        className="pl-9 w-64 border-border bg-background"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={indexing}
                      />
                      {isSearching && (
                        <Loader2 className="absolute right-8 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                      {isGlobalSearch && !isSearching && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSearchTerm("");
                            setIsGlobalSearch(false);
                            setSearchResults([]);
                          }}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="bg-card/95 backdrop-blur-sm rounded-b-lg p-6">
                  <div className="space-y-3">
                    {loading || indexing ? (
                      <div className="text-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
                        <p className="text-muted-foreground">
                          {indexing ? "Loading files..." : "Loading files..."}
                        </p>
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
                            : "Start by uploading files or creating folders"
                          }
                        </p>
                      </div>
                    ) : (
                      // Grid layout for 3 columns
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displayItems.map((item) => (
                          <div key={item.id} className="relative">
                            {isGlobalSearch && 'path' in item && (
                              <div className="text-xs text-muted-foreground mb-1 pl-2">
                                <span>📁 {item.path}</span>
                              </div>
                            )}
                            <DragDropZone 
                              onFileDrop={handleFileDrop} 
                              folderId={item.id} 
                              isFolder={item.type === 'folder'}
                              className="rounded-lg h-full"
                            >
                              <FileItem
                                item={item}
                                onSelect={isGlobalSearch ? handleSearchResultSelect : handleFileSelect}
                                onDelete={handleDelete}
                                onMove={handleMove}
                                onDownload={handleDownload}
                                onRename={handleRename}
                                onManagePermissions={handleManagePermissions}
                                isDeleting={isDeleting[item.id]}
                                isDownloading={isDownloading[item.id]}
                                isRenaming={isRenaming[item.id]}
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

          {/* Create Folder Dialog */}
          <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
            <DialogContent className="bg-card shadow-card">
              <DialogHeader>
                <DialogTitle className="text-foreground">Create New Folder</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Enter a name for the new folder
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <Input
                  placeholder="Folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isCreating && handleCreateFolder()}
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
                  {isCreating ? 'Creating...' : 'Create Folder'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Upload File Dialog */}
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogContent className="bg-card shadow-card">
              <DialogHeader>
                <DialogTitle className="text-foreground">Upload Files</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Select files to upload to the current folder
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="cursor-pointer border-border"
                  multiple
                  disabled={isUploading}
                />
                {selectedFile && (
                  <div className="mt-3 p-3 bg-primary-light rounded-lg">
                    <p className="text-sm text-primary font-medium">
                      Selected: {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsUploadOpen(false)}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button 
                  variant="upload" 
                  onClick={handleMultipleFilesUpload} 
                  disabled={!selectedFile || isUploading}
                  className="flex items-center gap-2"
                >
                  {isUploading && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {isUploading ? 'Uploading...' : 'Upload File'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Move Item Dialog */}
          <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
            <DialogContent className="bg-card shadow-card">
              <DialogHeader>
                <DialogTitle className="text-foreground flex items-center gap-2">
                  <Move className="h-5 w-5" />
                  Move Item
                  {isMoving && <Loader2 className="h-4 w-4 animate-spin" />}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Select the destination folder for this item
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {loadingFolders ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Loading folders...</span>
                  </div>
                ) : (
                  <Select value={moveDestination} onValueChange={setMoveDestination} disabled={isMoving}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination folder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="root">Root folder</SelectItem>
                      {availableFolders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          <div className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4 mr-2 text-primary" />
                            {folder.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsMoveDialogOpen(false)}
                  disabled={isMoving}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmMove} 
                  disabled={!moveDestination || isMoving}
                  className="flex items-center gap-2"
                >
                  {isMoving && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {isMoving ? 'Moving...' : 'Move'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* User Permissions Dialog */}
          <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
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
            onDownload={preview ? () => handleDownload(selectedItem?.id || '', preview.name) : undefined}
          />
        </div>
      </div>
    </DragDropZone>
  );
}