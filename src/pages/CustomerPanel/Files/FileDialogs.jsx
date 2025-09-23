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
import { Loader2 } from "lucide-react";
import UserPermissions from "@/components/Customer/UserPermissions";
import MoveFileDialog from "../../../components/MoveFileDialog"; // Import the better move dialog
import { fileApi } from "@/services/FileService";
import { searchService } from "@/services/SearchService";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

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
  itemForPermissions,
  isCreating,
  isUploading,
  handleCreateFolder,
  loadFiles,
  currentPath
}) {
  const { toast } = useToast();

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

  // Handle successful move from the MoveFileDialog
  const handleMoveSuccess = async (movedItem, newParentId) => {
    // Reset dialog state
    setIsMoveDialogOpen(false);
    setItemToMove(null);

    // Refresh the file list
    await loadFiles({ force: true });

    // Refresh search index
    await searchService.clearIndex();
    await searchService.indexAllFiles(true);
  };

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

      {/* Replace the old move dialog with the better MoveFileDialog component */}
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
    </>
  );
}