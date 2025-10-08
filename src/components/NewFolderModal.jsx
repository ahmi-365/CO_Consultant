import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Folder } from "lucide-react";
import { toast } from "sonner";
import { fileApi } from "../services/FileService";

export default function NewFolderModal({
  isOpen,
  onClose,
  onFolderCreated,
  currentPath,
  parentId
}) {
  const [folderName, setFolderName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [hasCreated, setHasCreated] = useState(false);

  // Reset states when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      // Reset everything when modal closes
      setFolderName("");
      setIsCreating(false);
      setHasCreated(false);
    }
  }, [isOpen]);

  const handleCreate = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (!folderName.trim() || isCreating || hasCreated) return;

    setIsCreating(true);
    setHasCreated(true);

    try {
      const newFolder = await fileApi.createFolder(folderName.trim(), parentId || null);
      toast.success(`Folder "${newFolder?.name || folderName}" created successfully!`);
      
      // Pass the new folder data to parent
      if (onFolderCreated) {
        onFolderCreated(newFolder);
      }
      
      // Close modal (useEffect will handle cleanup)
      onClose();
      
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error(error.message || "Failed to create folder");
      setHasCreated(false);
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isCreating && folderName.trim()) {
      handleCreate(e);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-panel" />
            Create New Folder
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              placeholder="Enter folder name..."
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isCreating}
              autoFocus
            />
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Location: {currentPath}</p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose} 
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!folderName.trim() || isCreating}
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              "Create Folder"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}