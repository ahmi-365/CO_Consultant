import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, HardDrive, FolderOpen, Loader2, X } from "lucide-react";
import FileItem from "@/components/Customer/FileItem";
import DragDropZone from "@/components/Customer/DragDropZone";
import FilePreviewDialog from "@/components/Customer/FilePreviewDialog";
import { useToast } from "@/hooks/use-toast";
import { fileApi } from "@/services/FileService";
import { searchService } from "@/services/SearchService";

export default function FileContent({
  files = [],
  searchResults = [],
  isGlobalSearch,
  searchTerm,
  setSearchTerm,
  selectedUser,
  loading,
  indexing,
  isSearching,
  setIsGlobalSearch,
  setSearchResults,
  currentPath = [],
  selectedItem,
  setSelectedItem,
  preview,
  setPreview,
  isDeleting,
  setIsDeleting,
  isDownloading,
  setIsDownloading,
  isRenaming,
  setIsRenaming,
  setItemForPermissions,
  setShowPermissionsDialog,
  setItemToMove,
  setIsMoveDialogOpen,
  loadFiles,
  onFileSelect,
  isSelectionMode = false,  
  selectedFiles = new Set() 
}) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const displayItems = isGlobalSearch
    ? searchResults.filter(
        (item) => !selectedUser || item.created_by === selectedUser
      )
    : files.filter((file) => {
        const matchesSearch = file.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesUser = !selectedUser || file.created_by === selectedUser;
        return matchesSearch && matchesUser;
      });

  // Handle selection from search results
  const handleSearchResultSelect = (result) => {
    if (result.path) {
      toast({
        title: "File Found",
        description: `File located at: ${result.path}`,
      });
    }
    setSelectedItem(result);
    if (result.type === "file") handlePreview(result);
  };

  const handleFileSelect = (item) => {
    setSelectedItem(item);
    
    // Handle folder navigation - if it's a folder, navigate into it
    if (item.type === "folder" && !isSelectionMode) {
      // Call parent component's navigation handler
      if (onFileSelect && typeof onFileSelect === 'function') {
        // Check if onFileSelect expects navigation logic or selection logic
        // For navigation, we need to update currentPath in parent
        onFileSelect(item);
      }
    }
  };

  // Enhanced selection handler with immediate feedback
  const handleFileSelectionChange = (itemId, isSelected) => {
    console.log('FileContent - Selection change:', itemId, isSelected);
    
    // Call the parent's selection handler
    if (onFileSelect) {
      onFileSelect(itemId, isSelected);
    }
    
    // Force a re-render to ensure UI updates immediately
    // This helps with the timing issue
    setTimeout(() => {
      // Small delay to ensure state has propagated
    }, 0);
  };

  const handlePreview = async (item) => {
    if (item.type !== "file") return;
    try {
      const url = item.web_url || (await fileApi.getDownloadUrl(item.id));
      const ext = item.name?.split(".").pop()?.toLowerCase() || "";
      setPreview({ open: true, url, name: item.name, type: ext });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load preview",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (item) => {
    setIsDownloading((prev) => ({ ...prev, [item.id]: true }));
    try {
      const response = await fileApi.getDownloadUrl(item.id);
      const downloadUrl = response?.download_url || response?.url || item.web_url;

      if (!downloadUrl) throw new Error("No download URL available");

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = item.name || "file";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: `Downloading ${item.name}`,
      });
    } catch (error) {
      console.error("Failed to download file:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDownloading((prev) => ({ ...prev, [item.id]: false }));
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
      searchService.clearIndex();
      await searchService.indexAllFiles(true);

      if (selectedItem?.id === id) setSelectedItem(null);
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

  const handleRename = async (id, newName) => {
    setIsRenaming((prev) => ({ ...prev, [id]: true }));
    try {
      await fileApi.renameItem(id, newName);
      loadFiles({ force: true });
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
      setIsRenaming((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleManagePermissions = (item) => {
    setItemForPermissions(item);
    setShowPermissionsDialog(true);
  };

  const handleFileDrop = async (filesDropped, targetFolderId) => {
    setIsUploading(true);
    for (const file of Array.from(filesDropped)) {
      await handleUploadFile(file, targetFolderId);
    }
    setIsUploading(false);
  };

  const handleUploadFile = async (file, targetFolderId) => {
    try {
      const parentId = targetFolderId || (currentPath.length > 0 ? currentPath[currentPath.length - 1]?.id : null);
      await fileApi.uploadFile(file, parentId);

      toast({
        title: "Success",
        description: `File "${file.name}" uploaded successfully`,
      });

      loadFiles({ force: true });
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

  return (
    <div className="grid grid-cols-1 gap-8">
      <div className="animate-fade-in">
        <Card className="shadow-card border-0 bg-gradient-file">
          <CardHeader className="bg-card/95 backdrop-blur-sm rounded-t-lg border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <HardDrive className="h-5 w-5 text-primary" />
                {isGlobalSearch ? "Global Search Results" : "Files & Folders"}
                {(indexing || isSearching) && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder={
                      indexing
                        ? "Indexing files..."
                        : isSearching
                        ? "Searching..."
                        : "Search all files and folders..."
                    }
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
                      : "Start by uploading files or creating folders"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(displayItems || []).map((item) => (
                    <div key={item.id || item.name} className="relative">
                      {isGlobalSearch && item.path && (
                        <div className="text-xs text-muted-foreground mb-1 pl-2">
                          <span>📁 {item.path}</span>
                        </div>
                      )}
                      <DragDropZone
                        onFileDrop={handleFileDrop}
                        folderId={item.id}
                        isFolder={item.type === "folder"}
                        className="rounded-lg h-full"
                      >
                        <FileItem
                          key={`${item.id}-${isSelectionMode}-${selectedFiles.has(item.id)}`} // Force re-render
                          item={item}
                          onSelect={isGlobalSearch ? handleSearchResultSelect : (!isSelectionMode ? (onFileSelect || handleFileSelect) : undefined)}
                          onDelete={handleDelete}
                          onMove={() => {
                            setItemToMove(item.id);
                            setIsMoveDialogOpen(true);
                          }}
                          onDownload={() => handleDownload(item)}
                          onRename={handleRename}
                          onManagePermissions={handleManagePermissions}
                          isDownloading={isDownloading[item.id]}
                          isRenaming={isRenaming[item.id]}
                          isSelectionMode={isSelectionMode}
                          isSelected={selectedFiles && selectedFiles.has(item.id)}
                          onSelectionChange={isSelectionMode ? handleFileSelectionChange : undefined} // Only use selection change in selection mode
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

      <FilePreviewDialog
        open={preview?.open || false}
        onOpenChange={(open) => setPreview(open ? preview : null)}
        file={preview}
        onDownload={preview ? () => handleDownload(selectedItem) : undefined}
      />
    </div>
  );
}