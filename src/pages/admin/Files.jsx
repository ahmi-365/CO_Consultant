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
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { 
  FolderPlus, 
  Upload, 
  Search, 
  RefreshCw,
  Home,
  Settings,
  HardDrive
} from "lucide-react";
import FileItem from "@/components/admin/FileItem";
import UserPermissions from "@/components/admin/UserPermissions";
import {   fileApi } from "@/services/FileService";
import { useToast } from "@/hooks/use-toast";

export default function FileManagement() {
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const { toast } = useToast();

  // Load files on component mount and path changes
  useEffect(() => {
    loadFiles();
  }, [currentPath]);

const loadFiles = async () => {
  setLoading(true);
  try {
    const currentParentId = currentPath.length > 0 
      ? currentPath[currentPath.length - 1].id 
      : null; // Changed from undefined to null

    const data = await fileApi.listFiles(currentParentId);

    // Ensure data is an array
    const safeData = Array.isArray(data) 
      ? data 
      : Array.isArray(data?.data) 
        ? data.data 
        : [];

    setFiles(safeData);
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to load files",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      const parentId = currentPath.length > 0 
        ? currentPath[currentPath.length - 1].id.toString() // Convert to string
        : null; // Use null for root level
      
      await fileApi.createFolder(newFolderName.trim(), parentId);
      
      toast({
        title: "Success",
        description: "Folder created successfully",
      });
      
      setNewFolderName("");
      setIsCreateFolderOpen(false);
      loadFiles();
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to create folder",
        variant: "destructive",
      });
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile) return;

    try {
      const parentId = currentPath.length > 0 
        ? currentPath[currentPath.length - 1].id.toString() // Convert to string
        : null; // Use null for root level
      
      await fileApi.uploadFile(selectedFile, parentId);
      
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
      
      setSelectedFile(null);
      setIsUploadOpen(false);
      loadFiles();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (item) => {
    if (item.type === 'folder') {
      setCurrentPath([...currentPath, item]);
    }
    setSelectedItem(item);
  };

  const handleDownload = async (id) => {
    try {
      const downloadUrl = await fileApi.getDownloadUrl(id);
      window.open(downloadUrl, '_blank');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await fileApi.deleteItem(id);
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
      loadFiles();
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

  const handleMove = async (id) => {
    // This would open a folder selection dialog
    toast({
      title: "Info",
      description: "Move functionality coming soon",
    });
  };

  const handleManagePermissions = (item) => {
    setSelectedItem(item);
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
      loadFiles();
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

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">File Management</h1>
            <p className="text-gray-600 mt-1">Organize and manage your team's files</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleSync} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Sync
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsUploadOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
            <Button onClick={() => setIsCreateFolderOpen(true)}>
              <FolderPlus className="h-4 w-4 mr-2" />
              New Folder
            </Button>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm">
            <button 
              onClick={() => handleBreadcrumbClick(-1)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              <Home className="h-4 w-4" />
              Root
            </button>
            {currentPath.map((folder, index) => (
              <div key={folder.id} className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <button 
                  onClick={() => handleBreadcrumbClick(index)}
                  className="text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  {folder.name}
                </button>
              </div>
            ))}
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main File Area */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-white rounded-t-lg border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <HardDrive className="h-5 w-5" />
                    Files & Folders
                  </CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input 
                      placeholder="Search files..." 
                      className="pl-9 w-64 border-gray-200"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="bg-white rounded-b-lg">
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center py-12">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
                      <p className="text-gray-500">Loading files...</p>
                    </div>
                  ) : filteredFiles.length === 0 ? (
                    <div className="text-center py-12">
                      <HardDrive className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
                      <p className="text-gray-500">
                        {searchTerm ? "Try adjusting your search terms" : "Start by uploading files or creating folders"}
                      </p>
                    </div>
                  ) : (
                    filteredFiles.map((item) => (
                      <FileItem
                        key={item.id}
                        item={item}
                        onSelect={handleFileSelect}
                        onDelete={handleDelete}
                        onMove={handleMove}
                        onDownload={handleDownload}
                        onManagePermissions={handleManagePermissions}
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Permissions Panel */}
          <div>
            <UserPermissions 
              selectedItem={selectedItem} 
              onPermissionChange={loadFiles}
            />
          </div>
        </div>

        {/* Create Folder Dialog */}
        <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Create New Folder</DialogTitle>
              <DialogDescription className="text-gray-600">
                Enter a name for the new folder
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                className="border-gray-200"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
                Create Folder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Upload File Dialog */}
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Upload Files</DialogTitle>
              <DialogDescription className="text-gray-600">
                Select files to upload to the current folder
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="cursor-pointer border-gray-200"
              />
              {selectedFile && (
                <p className="text-sm text-gray-500 mt-2">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUploadFile} disabled={!selectedFile}>
                Upload File
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}