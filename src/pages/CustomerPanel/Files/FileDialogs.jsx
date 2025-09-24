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
import { Move, FolderOpen, Loader2, Home } from "lucide-react";
import UserPermissions from "@/components/Customer/UserPermissions";
import { fileApi, getCachedFiles } from "@/services/FileService";
import { searchService } from "@/services/SearchService";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export default function FileDialogs({
  isCreateFolderOpen,
  setIsCreateFolderOpen,
  isUploadOpen,
  setIsUploadOpen,
  isMoveDialogOpen,
  setIsMoveDialogOpen,
  showPermissionsDialog,
  setShowPermissionsDialog,
  newFolderName,
  setNewFolderName,
  selectedFile,
  setSelectedFile,
  itemToMove,
  setItemToMove,
  moveDestination,
  setMoveDestination,
  availableFolders,
  itemForPermissions,
  isCreating,
  isUploading,
  isMoving,
  loadingFolders,
  handleCreateFolder,
  loadFiles,
  currentPath,
  setIsMoving
}) {
  const { toast } = useToast();
  const [rootId, setRootId] = useState(null);
  const [fetchingRootId, setFetchingRootId] = useState(false);

  console.log('availableFolders:', availableFolders);
  console.log('Current rootId:', rootId);

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

  const handleUploadFile = async (file, targetFolderId) => {
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

  // Enhanced function to fetch root ID from API
  const fetchRootId = async () => {
    if (fetchingRootId) return; // Prevent multiple simultaneous requests
    
    try {
      setFetchingRootId(true);
      console.log("🔍 Fetching root ID from API...");

      // Use the fileApi.listFiles method to get files and root_id
      const data = await fileApi.listFiles(null, {}, { force: true });
      console.log("📦 API Response:", data);

      // Check if data has root_id property (from your API response structure)
      if (data && data.root_id) {
        setRootId(data.root_id);
        console.log("✅ Root ID successfully set:", data.root_id);
      } else if (Array.isArray(data) && data.length > 0 && data[0].parent_id) {
        // Fallback: if data is array, try to get parent_id of first item as potential root
        const potentialRootId = data[0].parent_id;
        setRootId(potentialRootId);
        console.log("✅ Root ID inferred from parent_id:", potentialRootId);
      } else {
        console.warn("⚠️ No root_id found in API response");
        throw new Error("Root ID not found in API response");
      }
    } catch (error) {
      console.error("🚨 Failed to fetch root ID:", error);
      toast({
        title: "Warning",
        description: "Could not fetch root folder information. Moving to root may not work properly.",
        variant: "destructive",
      });
    } finally {
      setFetchingRootId(false);
    }
  };

  const handleConfirmMove = async () => {
    try {
      setIsMoving(true);

      // Enhanced validation
      if (!itemToMove && itemToMove !== 0) {
        throw new Error("No item selected to move");
      }

      if (!moveDestination && moveDestination !== "root") {
        throw new Error("No destination selected");
      }

      const fileId = itemToMove;
      if (fileId === undefined || fileId === null) {
        throw new Error("Invalid file ID");
      }

      // Determine target parent ID with enhanced root handling
      let targetParentId;
      if (moveDestination === "root") {
        if (!rootId) {
          console.log("🔄 Root ID not available, fetching from API...");
          await fetchRootId();
        }
        
        if (!rootId) {
          throw new Error("Could not determine root folder ID. Please try again.");
        }
        
        targetParentId = String(rootId);
        console.log("📁 Moving to root folder with ID:", targetParentId);
      } else {
        targetParentId = String(moveDestination);
        console.log("📁 Moving to folder with ID:", targetParentId);
      }

      // Validate target folder exists (except for root)
      if (moveDestination !== "root") {
        const targetFolder = availableFolders.find(f => f.id === moveDestination);
        if (!targetFolder) {
          throw new Error("Selected destination folder no longer exists");
        }
      }

      // Use fileApi.moveItem method with both file_id and new_parent_id
      console.log("📤 Sending move request:", { 
        file_id: fileId, 
        new_parent_id: targetParentId 
      });
      
      const result = await fileApi.moveItem(fileId, targetParentId);
      console.log("✅ Move operation successful:", result);

      // Enhanced success notification
      const destinationName = moveDestination === "root" 
        ? "Root Folder" 
        : availableFolders.find(f => f.id === moveDestination)?.name || "Selected Folder";

      toast({
        title: "Move Successful",
        description: `Item has been moved to "${destinationName}"`,
      });

      // Reset dialog state
      setIsMoveDialogOpen(false);
      setItemToMove(null);
      setMoveDestination("");

      // Refresh the file list
      await loadFiles({ force: true });

      // Refresh search index
      await searchService.clearIndex();
      await searchService.indexAllFiles(true);

    } catch (error) {
      console.error("🚨 Move operation error:", {
        errorMessage: error.message,
        itemToMove,
        moveDestination,
        rootId
      });

      // Show backend error directly without modification
      toast({
        title: "Move Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsMoving(false);
    }
  };

  // Enhanced move dialog handler
  const handleMoveDialogOpen = async (open) => {
    setIsMoveDialogOpen(open);
    if (open) {
      console.log("🔄 Move dialog opened, ensuring root ID is available...");
      // Always fetch fresh root ID when dialog opens
      await fetchRootId();
    } else {
      // Reset state when dialog closes
      setMoveDestination("");
    }
  };

  // Effect to fetch root ID when component mounts or when needed
  useEffect(() => {
    if (isMoveDialogOpen && !rootId && !fetchingRootId) {
      fetchRootId();
    }
  }, [isMoveDialogOpen, rootId, fetchingRootId]);

  return (
    <>
      {/* Create Folder Dialog */}
      <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
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
              {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isUploading ? "Uploading..." : "Upload File"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Move Item Dialog */}
      <Dialog open={isMoveDialogOpen} onOpenChange={handleMoveDialogOpen}>
        <DialogContent className="bg-card shadow-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Move className="h-5 w-5 text-primary" />
              Move Item
              {(isMoving || fetchingRootId) && (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              )}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Choose the destination folder where you want to move this item
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            {(loadingFolders || fetchingRootId) ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">
                    {fetchingRootId ? "Loading root folder..." : "Loading available folders..."}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Select Destination
                </label>
                <Select
                  value={moveDestination}
                  onValueChange={setMoveDestination}
                  disabled={isMoving || fetchingRootId}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Choose destination folder..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="root" className="py-3">
                      <div className="flex items-center gap-3">
                        <Home className="h-4 w-4 text-blue-600" />
                        <div>
                          <div className="font-medium">Root Folder</div>
                          <div className="text-xs text-muted-foreground">
                            Move to the top level directory {rootId && `(ID: ${rootId})`}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                    {availableFolders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id} className="py-3">
                        <div className="flex items-center gap-3">
                          <FolderOpen className="h-4 w-4 text-amber-600" />
                          <div>
                            <div className="font-medium">{folder.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Folder • ID: {folder.id}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {moveDestination && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 text-sm">
                      <Move className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-800 dark:text-blue-200">
                        {moveDestination === "root" 
                          ? `Moving to Root Folder ${rootId ? `(ID: ${rootId})` : ''}` 
                          : `Moving to "${availableFolders.find(f => f.id === moveDestination)?.name}"`
                        }
                      </span>
                    </div>
                  </div>
                )}

                {/* Root ID status indicator */}
                {moveDestination === "root" && (
                  <div className={`mt-2 p-2 rounded-lg text-xs ${
                    rootId 
                      ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                      : "bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800"
                  }`}>
                    {rootId 
                      ? `✅ Root folder ready (ID: ${rootId})`
                      : "⚠️ Root folder ID not available"
                    }
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => handleMoveDialogOpen(false)}
              disabled={isMoving || fetchingRootId}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmMove}
              disabled={
                !moveDestination || 
                isMoving || 
                loadingFolders || 
                fetchingRootId ||
                (moveDestination === "root" && !rootId)
              }
              className="flex-1 flex items-center gap-2 bg-primary hover:bg-primary/90"
            >
              {(isMoving || fetchingRootId) && <Loader2 className="h-4 w-4 animate-spin" />}
              {isMoving ? "Moving..." : fetchingRootId ? "Loading..." : "Move Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    </>
  );
}