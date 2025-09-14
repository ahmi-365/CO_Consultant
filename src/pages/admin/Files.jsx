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
  X
} from "lucide-react";
import FileItem from "@/components/admin/FileItem";
import UserPermissions from "@/components/admin/UserPermissions";
import FilePreviewDialog from "@/components/admin/FilePreviewDialog";
import DragDropZone from "@/components/admin/DragDropZone";
import { fileApi,  getCachedFiles } from "@/services/FileService";
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
  const [itemToMove, setItemToMove] = useState (null);
  const [moveDestination, setMoveDestination] = useState("");
  const [availableFolders, setAvailableFolders] = useState([]);
  const [preview, setPreview] = useState(null);
  const [openUsersDialog, setOpenUsersDialog] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  // Load files on component mount and path changes
  useEffect(() => {
    loadFiles();
  }, [currentPath]);

  // Index files for global search on mount
  useEffect(() => {
    initializeSearch();
  }, []);

  // Handle search term changes
  useEffect(() => {
    if (searchTerm.trim()) {
      handleSearch();
    } else {
      setIsGlobalSearch(false);
      setSearchResults([]);
    }
  }, [searchTerm]);

  // Load available folders for move dialog
  useEffect(() => {
    if (isMoveDialogOpen) {
      loadAvailableFolders();
    }
  }, [isMoveDialogOpen]);

const loadFiles = async ({ force } = {}) => {
  setLoading(true);
  try {
    const currentParentId = currentPath.length > 0 
      ? currentPath[currentPath.length - 1].id 
      : null;

    // Use cached memory unless force is true
    if (!force) {
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
    // Only show toast if nothing cached and nothing to show
    if (!files.length) {
      toast({
        title: "Offline",
        description: "Using cached data (or mock) while network is unavailable",
        variant: "destructive",
      });
      // Fallback mock data for testing only (API remains wired)
      setFiles([
        { id: '1', name: 'Documents', type: 'folder', created_at: new Date().toISOString() },
        { id: '2', name: 'sample.pdf', type: 'file', size: 345678, created_at: new Date().toISOString() },
      ]);
    }
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
    }
  };

  const handleSearchResultSelect = (result ) => {
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
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
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
    }
  };

  const handleUploadFile = async (file , targetFolderId ) => {
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

  const handleFileDrop = async (files , targetFolderId ) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      await handleUploadFile(file, targetFolderId);
    }
  };

  const handleFileSelect = (item ) => {
    if (item.type === 'folder') {
      setCurrentPath([...currentPath, { id: item.id, name: item.name }]);
    }
    setSelectedItem(item);
  };

  const handleDownload = async (id , filename ) => {
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
    }
  };

  const handleDelete = async (id ) => {
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
    }
  };

  const handleMove = async (id ) => {
    setItemToMove(id);
    setIsMoveDialogOpen(true);
  };

  const handleConfirmMove = async () => {
    if (!itemToMove || !moveDestination) return;

    try {
      const dest = moveDestination === 'root' ? null : moveDestination;
      await fileApi.moveItem(itemToMove, dest);
      toast({
        title: "Success",
        description: "Item moved successfully",
      });
      setIsMoveDialogOpen(false);
      setItemToMove(null);
      setMoveDestination("");
      loadFiles({ force: true });
      
      // Refresh search index
      searchService.clearIndex();
      await searchService.indexAllFiles(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move item",
        variant: "destructive",
      });
    }
  };

  const handleRename = async (id , newName ) => {
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
    }
  };

  const handleManagePermissions = (item ) => {
    setSelectedItem(item);
    setOpenUsersDialog(true);
  };

  const handlePreview = async (item ) => {
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

  const handleBreadcrumbClick = (index ) => {
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
const displayItems = isGlobalSearch
  ? searchResults
  : files.filter(file =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );


  return (
    <DragDropZone onFileDrop={handleFileDrop}>
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="animate-slide-up">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              File Management
            </h1>
            <p className="text-muted-foreground mt-2">Organize and manage your team's files with ease</p>
          </div>
          <div className="flex gap-3 animate-slide-up">
            <Button variant="ghost" onClick={handleSync} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Sync
            </Button>
            <Button variant="upload" onClick={() => setIsUploadOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
            <Button variant="folder" onClick={() => setIsCreateFolderOpen(true)}>
              <FolderPlus className="h-4 w-4 mr-2" />
              New Folder
            </Button>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="mb-6 animate-fade-in">
          <nav className="flex items-center justify-between bg-card p-4 rounded-lg shadow-file border">
            <div className="flex items-center space-x-2 text-sm">
              <button 
                onClick={() => handleBreadcrumbClick(-1)}
                className="flex items-center gap-2 text-primary hover:text-primary/80 cursor-pointer transition-smooth font-medium"
              >
                <Home className="h-4 w-4" />
                Root
              </button>
              {currentPath.map((folder, index) => (
                <div key={folder.id} className="flex items-center">
                  <span className="mx-2 text-muted-foreground">/</span>
                  <button 
                    onClick={() => handleBreadcrumbClick(index)}
                    className="text-primary hover:text-primary/80 cursor-pointer transition-smooth font-medium"
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
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <ArrowUp className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBreadcrumbClick(-1)}
                  className="p-2"
                  title="Go to Root"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            )}
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main File Area */}
          <div className="lg:col-span-2 animate-fade-in">
            <Card className="shadow-card border-0 bg-gradient-file">
              <CardHeader className="bg-card/95 backdrop-blur-sm rounded-t-lg border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <HardDrive className="h-5 w-5 text-primary" />
                    {isGlobalSearch ? 'Global Search Results' : 'Files & Folders'}
                    {indexing && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
                  </CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input 
                      placeholder={indexing ? "Indexing files..." : "Search all files and folders..."} 
                      className="pl-9 w-64 border-border bg-background"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      disabled={indexing}
                    />
                    {isGlobalSearch && (
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
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
                      <p className="text-muted-foreground">
                        {indexing ? "Indexing files for search..." : "Loading files..."}
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
                    displayItems.map((item) => (
                      <div key={item.id} className="relative">
                        {isGlobalSearch && 'path' in item && (
                          <div className="text-xs text-muted-foreground mb-1 pl-4">
                            <span>📁 {(item ).path}</span>
                          </div>
                        )}
                        <DragDropZone 
                          onFileDrop={handleFileDrop} 
                          folderId={item.id} 
                          isFolder={item.type === 'folder'}
                          className="rounded-lg"
                        >
                          <FileItem
                            item={item}
                            onSelect={isGlobalSearch ? handleSearchResultSelect : handleFileSelect}
                            onDelete={handleDelete}
                            onMove={handleMove}
                            onDownload={handleDownload}
                            onRename={handleRename}
                            onManagePermissions={handleManagePermissions}
                            onPreview={handlePreview}
                          />
                        </DragDropZone>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Permissions Panel */}
          <div className="animate-fade-in">
            <UserPermissions 
              selectedItem={selectedItem} 
              onPermissionChange={() => loadFiles({ force: true })}
              openUsersDialog={openUsersDialog}
              onOpenUsersDialogChange={setOpenUsersDialog}
            />
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
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                className="border-border"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
                Cancel
              </Button>
              <Button variant="folder" onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
                Create Folder
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
              <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                Cancel
              </Button>
              <Button variant="upload" onClick={handleMultipleFilesUpload} disabled={!selectedFile}>
                Upload File
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Move Item Dialog */}

        {/* Move Item Dialog */}
        <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
          <DialogContent className="bg-card shadow-card">
            <DialogHeader>
              <DialogTitle className="text-foreground flex items-center gap-2">
                <Move className="h-5 w-5" />
                Move Item
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Select the destination folder for this item
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Select value={moveDestination} onValueChange={setMoveDestination}>
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsMoveDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleConfirmMove} disabled={!moveDestination}>Move</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={!!preview?.open} onOpenChange={(open) => setPreview(open ? preview : null)}>
          <DialogContent className="bg-card shadow-card max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-foreground">Preview: {preview?.name}</DialogTitle>
              <DialogDescription className="text-muted-foreground">Quick preview</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {preview && (
                preview.type.match(/^(png|jpg|jpeg|gif|svg)$/) ? (
                  <img src={preview.url} alt={preview.name} className="max-h-[60vh] w-full object-contain rounded-md" />
                ) : preview.type === 'pdf' ? (
                  <iframe src={preview.url} className="w-full h-[60vh] rounded-md" />
                ) : preview.type.match(/^(mp4|webm|ogg)$/) ? (
                  <video src={preview.url} controls className="w-full rounded-md" />
                ) : (
                  <div className="text-sm text-muted-foreground">Preview not supported. You can download the file instead.</div>
                )
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPreview(null)}>Close</Button>
              {preview && (
                <Button onClick={() => window.open(preview.url, '_blank')}>Open in new tab</Button>
              )}
            </DialogFooter>
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