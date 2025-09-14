import { useState } from "react";
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

// Removed TypeScript interface as this is a JS file

export default function NewFolderModal({
  isOpen,
  onClose,
  onFolderCreated,
  currentPath,
}) {
  const [folderName, setFolderName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

const handleCreate = async () => {
  if (!folderName.trim()) {
    toast.error("Please enter a folder name");
    return;
  }

    setIsCreating(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    onFolderCreated(folderName.trim());
    toast.success(`Folder "${folderName}" created successfully!`);

    // Trigger sidebar refresh
    window.dispatchEvent(new CustomEvent("folderCreated"));

    setFolderName("");
    setIsCreating(false);
    onClose();
  };

  const handleClose = () => {
    setFolderName("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-">
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
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Location: {currentPath}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!folderName.trim() || isCreating}
            varient="variant" 
          >
            {isCreating ? "Creating..." : "Create Folder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
