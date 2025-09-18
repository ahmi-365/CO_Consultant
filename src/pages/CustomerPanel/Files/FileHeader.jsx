import React, { useState } from "react";
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
import { FolderPlus, Upload, RefreshCw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function FileHeader({
  recentFiles,
  isUploading,
  isCreating,
  isRefreshing,
  user,
  hasPermission,
  setIsCreateFolderOpen,
  handleRefresh,
  isSelectionMode, 
  toggleSelectionMode, 
  selectedFiles, 
  files, 
  handleSelectAll,
  // New props for upload functionality
  onFileUpload,
  currentPath = []
}) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  
  const { toast } = useToast();

  const getFileIcon = (fileName, fileType) => {
    // If it's a folder, return folder icon
    if (fileType === "folder") {
      return "📁";
    }
    
    // For files, get extension from name
    const ext = fileName.split(".").pop()?.toLowerCase();
    const iconMap = {
      pdf: "📄",
      doc: "📝",
      docx: "📝",
      ppt: "📊",
      pptx: "📊",
      xls: "📈",
      xlsx: "📈",
      jpg: "🖼️",
      jpeg: "🖼️",
      png: "🖼️",
      gif: "🖼️",
      mp4: "🎥",
      mp3: "🎵",
      zip: "📦",
      rar: "📦",
    };
    return iconMap[ext || ""] || "📄";
  };

  const handleFileUploaded = async () => {
    if (!selectedFile || !onFileUpload) return;

    setUploadProgress(true);
    try {
      // Get current folder ID from path
      const parentId = currentPath.length > 0 ? currentPath[currentPath.length - 1].id : null;
      
      await onFileUpload(selectedFile, parentId);
      
      toast({
        title: "Success",
        description: `File "${selectedFile.name}" uploaded successfully`,
      });

      // Reset state
      setSelectedFile(null);
      setIsUploadOpen(false);
      
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Error",
        description: `Failed to upload file "${selectedFile.name}"`,
        variant: "destructive",
      });
    } finally {
      setUploadProgress(false);
    }
  };

  const handleFileClick = (file) => {
    // Handle file/folder click based on type
    if (file.type === "folder") {
      // Navigate to folder or handle folder opening
      console.log("Opening folder:", file.name);
      // You might want to call a parent function to handle navigation
    } else {
      // For files, you might want to open them
      console.log("Opening file:", file.name);
      // If you have a web_url or download_url, you can use it here
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="mb-8">
      {/* Upload Progress Overlay */}
      {(isUploading || uploadProgress) && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <Loader2 className="h-4 w-4 animate-spin" />
          Uploading files...
        </div>
      )}

      {/* Header Section */}
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">
            File Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize and manage your team's files with ease
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2 className="text-lg font-medium text-foreground">Quick Actions:</h2>

          <div className="flex flex-wrap gap-2">
            {hasPermission(user, "files.upload") && (
              <Button
                onClick={() => setIsUploadOpen(true)}
                disabled={isUploading || uploadProgress}
                className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1 px-3 py-1.5 h-8 text-sm"
              >
                {(isUploading || uploadProgress) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Upload
              </Button>
            )}

            {(hasPermission(user, "files.create") || hasPermission(user, "files.upload")) && (
              <Button
                onClick={() => setIsCreateFolderOpen(true)}
                disabled={isCreating}
                variant="outline"
                className="flex items-center gap-1 px-3 py-1.5 h-8 text-sm border-2"
              >
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderPlus className="h-4 w-4" />}
                New Folder
              </Button>
            )}

            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              className="flex items-center gap-1 px-3 py-1.5 h-8 text-sm border-2"
            >
              {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </Button>
            
            <Button 
              onClick={toggleSelectionMode}
              variant={isSelectionMode ? "default" : "outline"}
              size="sm"
            >
              {isSelectionMode ? "Cancel Selection" : "Select Files"}
            </Button>

            {isSelectionMode && files.length > 0 && (
              <Button onClick={() => handleSelectAll(files.map(f => f.id))} size="sm">
                Select All
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Recent Files */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-foreground mb-4">Recent Files</h2>
        {recentFiles && recentFiles.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {recentFiles.map((file) => (
              <div
                key={file.file_id}
                className="flex flex-col items-center cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
                onClick={() => handleFileClick(file)}
              >
                <div className="w-28 h-28 rounded-lg bg-muted flex items-center justify-center mb-2">
                  <div className="text-4xl">{getFileIcon(file.name, file.type)}</div>
                </div>

                <h3 className="text-sm font-semibold text-center line-clamp-1 w-28" title={file.name}>
                  {file.name}
                </h3>

                <p className="text-xs text-muted-foreground">
                  {file.type?.toUpperCase() || "FILE"}
                </p>

                <p className="text-xs text-blue-500 mt-1">
                  Viewed: {formatDate(file.viewed_at)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No recent files</p>
        )}
      </div>

      {/* Upload File Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="bg-card shadow-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Upload Files
            </DialogTitle>
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
              disabled={uploadProgress}
            />
            {selectedFile && (
              <div className="mt-3 p-3 bg-primary/10 rounded-lg">
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
              disabled={uploadProgress}
            >
              Cancel
            </Button>
            <Button
              onClick={handleFileUploaded}
              disabled={!selectedFile || uploadProgress}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
            >
              {uploadProgress && <Loader2 className="h-4 w-4 animate-spin" />}
              {uploadProgress ? "Uploading..." : "Upload File"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}