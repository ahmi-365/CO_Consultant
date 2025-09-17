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
import { Move, FolderOpen, Loader2 } from "lucide-react";
import UserPermissions from "@/components/Customer/UserPermissions";
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

  try {
    setIsMoving(true); // ⬅️ Start loading

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

    // wait for files to reload before indexing
    await loadFiles({ force: true });

    console.log("🔍 Refreshing search index...");
    await searchService.clearIndex();
    await searchService.indexAllFiles(true);
    console.log("🔍 Index refresh done");
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
    setIsMoving(false); // ⬅️ Stop loading (whether success or error)
  }
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
                <span className="ml-2 text-muted-foreground">
                  Loading folders...
                </span>
              </div>
            ) : (
              <Select
                value={moveDestination}
                onValueChange={setMoveDestination}
                disabled={isMoving}
              >
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
              {isMoving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isMoving ? "Moving..." : "Move"}
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