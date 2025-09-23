import React, { useState, useEffect } from 'react';
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
import { Button } from "@/components/ui/button";
import { 
  Move, 
  Loader2, 
  FolderOpen, 
  Home, 
  File,
  Folder,
  ChevronRight 
} from "lucide-react";
import { fileApi } from "@/services/FileService";
import { useToast } from "@/hooks/use-toast";

const MoveFileDialog = ({ 
  isOpen, 
  onClose, 
  itemToMove, 
  onMoveSuccess,
  currentPath = []
}) => {
  const [availableFolders, setAvailableFolders] = useState([]);
  const [moveDestination, setMoveDestination] = useState("");
  const [isMoving, setIsMoving] = useState(false);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [allFolders, setAllFolders] = useState([]);
  const [selectedPath, setSelectedPath] = useState([]);
  
  const { toast } = useToast();

  // Load all folders recursively to build folder tree
  const loadAllFolders = async () => {
    setLoadingFolders(true);
    try {
      const folders = await fetchFoldersRecursively(null, []);
      setAllFolders(folders);
      setAvailableFolders(folders);
    } catch (error) {
      console.error("Failed to load folders:", error);
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

  // Recursively fetch folders to build complete tree
  const fetchFoldersRecursively = async (parentId, path = []) => {
    try {
      const data = await fileApi.listFiles(parentId);
      const folders = Array.isArray(data) 
        ? data.filter(item => item.type === "folder") 
        : [];
      
      const folderTree = [];
      
      for (const folder of folders) {
        // Skip the folder we're trying to move (prevent moving into itself)
        if (itemToMove && folder.id === itemToMove.id) {
          continue;
        }
        
        const currentPath = [...path, { id: folder.id, name: folder.name }];
        
        folderTree.push({
          ...folder,
          path: currentPath,
          pathString: currentPath.map(p => p.name).join(' / '),
          depth: currentPath.length
        });
        
        // Recursively get subfolders
        const subfolders = await fetchFoldersRecursively(folder.id, currentPath);
        folderTree.push(...subfolders);
      }
      
      return folderTree;
    } catch (error) {
      console.error(`Failed to load folders for parent ${parentId}:`, error);
      return [];
    }
  };

  // Load folders when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadAllFolders();
      setMoveDestination("");
      setSelectedPath([]);
    }
  }, [isOpen, itemToMove]);

const handleMove = async () => {
  console.log("handleMove started with:", {
    itemToMove,
    moveDestination,
    hasItemToMove: !!itemToMove,
    itemId: itemToMove?.id,
    itemName: itemToMove?.name
  });

  if (!itemToMove) {
    console.error("No itemToMove provided");
    toast({
      title: "Error",
      description: "No item selected to move",
      variant: "destructive",
    });
    return;
  }

  if (!itemToMove.id) {
    console.error("itemToMove missing id:", itemToMove);
    toast({
      title: "Error",
      description: "Selected item has no ID",
      variant: "destructive",
    });
    return;
  }

  if (!moveDestination && moveDestination !== "root") {
    console.error("No destination selected");
    toast({
      title: "Error",
      description: "Please select a destination folder",
      variant: "destructive",
    });
    return;
  }

  setIsMoving(true);
  try {
    const new_parent_id = moveDestination === "root" ? null : moveDestination;
    const file_id = itemToMove.id;
    
    console.log("Calling moveItem with:", {
      file_id,
      new_parent_id,
      file_id_type: typeof file_id,
      new_parent_id_type: typeof new_parent_id
    });
    
    const result = await fileApi.moveItem(file_id, new_parent_id);
    console.log("Move successful:", result);
    
    toast({
      title: "Success",
      description: `${itemToMove.name} moved successfully`,
    });
    
    // Call success callback if provided
    if (onMoveSuccess) {
      onMoveSuccess(itemToMove, new_parent_id);
    }
    
    onClose();
  } catch (error) {
    console.error("Move failed:", error);
    toast({
      title: "Error",
      description: `Failed to move item: ${error.message}`,
      variant: "destructive",
    });
  } finally {
    setIsMoving(false);
  }
};
  const handleCancel = () => {
    setMoveDestination("");
    setSelectedPath([]);
    onClose();
  };

  const getItemIcon = (item) => {
    if (!item) return <File className="h-4 w-4" />;
    
    switch (item.type) {
      case 'folder':
        return <Folder className="h-4 w-4 text-blue-500" />;
      case 'file':
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDestinationPath = () => {
    if (!moveDestination) return "";
    if (moveDestination === "root") return "Root";
    
    const selectedFolder = allFolders.find(f => f.id === moveDestination);
    return selectedFolder ? selectedFolder.pathString : "Unknown";
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="bg-card shadow-lg max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Move className="h-5 w-5 text-blue-500" />
            Move Item
            {isMoving && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose where to move this item
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Item being moved */}
          {itemToMove && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Moving:</span>
                <div className="flex items-center gap-2 font-medium">
                  {getItemIcon(itemToMove)}
                  {itemToMove.name}
                </div>
              </div>
            </div>
          )}

          {/* Current location */}
          {currentPath && currentPath.length > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">From:</span>
                <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                  <Home className="h-3 w-3" />
                  {currentPath.map((folder, index) => (
                    <React.Fragment key={folder.id}>
                      <ChevronRight className="h-3 w-3" />
                      <span>{folder.name}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Destination selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Move to:
            </label>
            
            {loadingFolders ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
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
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select destination folder" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="root">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-gray-500" />
                      <span>Root Folder</span>
                    </div>
                  </SelectItem>
                  
                  {availableFolders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="flex items-center gap-1"
                          style={{ paddingLeft: `${folder.depth * 12}px` }}
                        >
                          <FolderOpen className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          <span className="truncate">{folder.name}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Selected destination preview */}
          {moveDestination && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">To:</span>
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                  {moveDestination === "root" ? (
                    <Home className="h-4 w-4" />
                  ) : (
                    <FolderOpen className="h-4 w-4" />
                  )}
                  {getDestinationPath()}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isMoving}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            disabled={!moveDestination || isMoving || loadingFolders}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isMoving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Moving...
              </>
            ) : (
              <>
                <Move className="h-4 w-4 mr-2" />
                Move
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MoveFileDialog;