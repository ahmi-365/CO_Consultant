import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [moveDestination, setMoveDestination] = useState("root"); // Default to root
  const [files, setFiles] = useState([]);
  const [isMoving, setIsMoving] = useState(false);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allFolders, setAllFolders] = useState([]);
  const [selectedPath, setSelectedPath] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { toast } = useToast();

const loadAllFolders = async () => {
  setLoadingFolders(true);
  try {
    const folders = await loadFiles({});
    
    // ✅ UPDATED: Filter only folders (all folders, regardless of parent_id)
    const onlyFolders = folders.filter(item => item.type === 'folder');
    
    // ✅ UPDATED: Build proper hierarchy with depth calculation
    const buildHierarchy = (folderId, depth = 0) => {
      return onlyFolders
        .filter(f => {
          // Root level: parent_id is 1, null, or 2
          if (folderId === null) {
            return f.parent_id === 1 || f.parent_id === null || f.parent_id === 2 || f.parent_id === "1" || f.parent_id === "2";
          }
          return f.parent_id === folderId || f.parent_id === String(folderId);
        })
        .map(folder => ({
          ...folder,
          depth: depth,
          pathString: folder.name
        }));
    };
    
    // Get all folders flattened with proper depth
    const allFoldersFlat = [];
    const processFolder = (folderId, depth) => {
      const children = buildHierarchy(folderId, depth);
      children.forEach(child => {
        allFoldersFlat.push(child);
        // Recursively process children
        processFolder(child.id, depth + 1);
      });
    };
    
    // Start from root (null)
    processFolder(null, 0);
    
    console.log("📁 All folders loaded:", allFoldersFlat);
    
    setAllFolders(allFoldersFlat);
    setAvailableFolders(allFoldersFlat);
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

 const loadFiles = async (opts = {}) => {
  console.log("🔄 loadFiles called with opts:", opts);
  setLoading(true);

  try {
    // ✅ CHANGED: Don't pass currentParentId for move dialog - we want ALL folders
    const params = {
      ...(opts.search ? { search: opts.search } : {}),
    };

    const options = {
      force: opts.force || !!opts.search,
    };

    console.log("📡 API call params:", { params, options });

    // ✅ CHANGED: Pass null to get all files/folders
    const response = await fileApi.listFiles(null, params, options);
    console.log("✅ Full API Response:", response);

    // SIMPLIFIED response handling
    let data = [];
    if (Array.isArray(response)) {
      data = response;
    } else if (response?.data) {
      data = Array.isArray(response.data) ? response.data : [response.data];
    } else if (response?.files) {
      data = Array.isArray(response.files) ? response.files : [response.files];
    }

    console.log("📊 Extracted data:", data);
    console.log("📊 Data length:", data.length);

    // ✅ REMOVED: No filtering - use all data from backend
    const safeData = data;

    console.log("🎯 Final files to display:", safeData);
    setFiles(safeData);
    
    // Return the data for loadAllFolders to use
    return safeData;

  } catch (error) {
    console.error("❌ Failed to load files:", error);
    toast({
      title: "Error",
      description: "Failed to load files",
      variant: "destructive",
    });
    setFiles([]);
    return []; // Return empty array on error
  } finally {
    setLoading(false);
  }
};

  // Load folders when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadAllFolders();
      setMoveDestination("root"); // Default to root when dialog opens
      setSelectedPath([]);
    }
  }, [isOpen, itemToMove]);
const handleMove = async () => {
  console.log("handleMove started with:", {
    itemToMove,
    moveDestination,
  });

  if (!itemToMove || !itemToMove.id) {
    toast({
      title: "Error",
      description: "No item selected to move",
      variant: "destructive",
    });
    return;
  }

  // ✅ UPDATED: Use 1 for root instead of null
  const currentParentId = itemToMove.parent_id;
  const newParentId = moveDestination === "root" ? 1 : moveDestination; // Changed from null to 1

  // Check if trying to move to same location
  if (currentParentId === newParentId) {
    toast({
      title: "Invalid Move",
      description: "Item is already in this location",
      variant: "destructive",
    });
    return;
  }

  // Prevent moving folder into itself
  if (itemToMove.type === 'folder' && moveDestination === itemToMove.id) {
    toast({
      title: "Invalid Move",
      description: "Cannot move a folder into itself",
      variant: "destructive",
    });
    return;
  }

  // Prevent moving folder into its own child
  if (itemToMove.type === 'folder') {
    const isMovingIntoChild = await checkIfDestinationIsChild(itemToMove.id, newParentId);
    if (isMovingIntoChild) {
      toast({
        title: "Invalid Move",
        description: "Cannot move a folder into its own subfolder",
        variant: "destructive",
      });
      return;
    }
  }

  setIsMoving(true);
  try {
    const result = await fileApi.moveItem(itemToMove.id, newParentId);
    
    toast({
      title: "Success",
      description: `${itemToMove.name} moved successfully`,
    });

    if (onMoveSuccess) {
      await onMoveSuccess(itemToMove, newParentId);
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
const isMoveDisabled = () => {
  if (isMoving || loadingFolders) return true;
  
  const currentParentId = itemToMove?.parent_id;
  const newParentId = moveDestination === "root" ? 1 : moveDestination;
  
  // ✅ UPDATED: Use == for loose comparison (handles string vs number)
  if (currentParentId == newParentId) return true;
  
  if (itemToMove?.type === 'folder' && moveDestination == itemToMove.id) return true;
  
  return false;
};
const checkIfDestinationIsChild = async (sourceFolderId, destinationFolderId) => {
  // Root (ID 1) is never a child
  if (!destinationFolderId || destinationFolderId === 1 || destinationFolderId === "1") return false;
  
  let currentId = destinationFolderId;
  const checkedIds = new Set();
  
  while (currentId && !checkedIds.has(currentId)) {
    // ✅ UPDATED: Compare both as strings and numbers
    if (currentId == sourceFolderId) { // Use == for loose comparison
      return true;
    }
    
    checkedIds.add(currentId);
    const folder = allFolders.find(f => f.id == currentId); // Use == for loose comparison
    currentId = folder?.parent_id;
    
    // Stop if we reach root (1, "1", 2, "2", or null)
    if (currentId === 1 || currentId === "1" || currentId === 2 || currentId === "2" || currentId === null) break;
  }
  
  return false;
};

  const handleCancel = () => {
    setMoveDestination("root"); // Reset to root on cancel
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
    if (moveDestination === "root") return "Root";

    const selectedFolder = allFolders.find(f => f.id === moveDestination);
    // Use 'name' instead of 'pathString' which doesn't exist
    return selectedFolder ? selectedFolder.name : "Unknown";
  };

  // Determine move button text based on destination
  const getMoveButtonText = () => {
    if (moveDestination === "root") {
      return "Move to Root";
    } else {
      return "Move to Folder";
    }
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
            <label className="text-sm font-medium text-foreground">Move to:</label>

            {/* 🔍 Search bar */}
            <Input
              type="text"
              placeholder="Search folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />

            {loadingFolders ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                <span className="ml-2 text-muted-foreground">Loading folders...</span>
              </div>
            ) : (
              <ScrollArea className="h-60 border rounded-md p-2">
                {/* Root Folder Option - Always visible and pre-selected */}
                <div
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent ${
                    moveDestination === "root" ? "bg-accent border border-blue-300" : ""
                  }`}
                  onClick={() => setMoveDestination("root")}
                >
                  <Home className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Root Folder</span>
                </div>

                {/* Available Folders */}
{(availableFolders || [])
  .filter((folder) => {
    // Filter by search query
    const matchesSearch = folder?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // ✅ NEW: Exclude the item being moved if it's a folder
    const isNotSelf = itemToMove?.type !== 'folder' || folder.id !== itemToMove.id;
    
    return matchesSearch && isNotSelf;
  })
  .map((folder) => (
    <div
      key={folder.id}
      className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent ${
        moveDestination === folder.id ? "bg-accent border border-blue-300" : ""
      }`}
      onClick={() => setMoveDestination(folder.id)}
      style={{ paddingLeft: `${folder.depth * 12}px` }}
    >
      <FolderOpen className="h-4 w-4 text-blue-500 flex-shrink-0" />
      <span className="truncate">{folder.name}</span>
    </div>
  ))}
                
                {(availableFolders || []).filter((folder) =>
                  folder?.name?.toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0 && !loadingFolders && (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No folders found.
                  </div>
                )}
              </ScrollArea>
            )}
          </div>

          {/* Selected destination preview */}
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Destination:</span>
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                {moveDestination === "root" ? (
                  <Home className="h-4 w-4" />
                ) : (
                  <FolderOpen className="h-4 w-4" />
                )}
                {getDestinationPath()}
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {moveDestination === "root" 
                ? "Item will be moved to the root folder" 
                : "Item will be moved to the selected folder"}
            </div>
          </div>
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
            
  disabled={isMoveDisabled()}
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
                {getMoveButtonText()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MoveFileDialog;