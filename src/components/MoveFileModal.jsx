import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Folder, FolderOpen, ChevronRight, ChevronDown, Loader2 } from "lucide-react";
import { fileApi } from "../services/FileService";
import { toast } from "sonner";

export default function MoveFileModal({
  isOpen,
  onClose,
  fileId,
  fileName,
  currentFolderId, // The folder where the file is currently located
  onFileMoved,
}) {
  const [folders, setFolders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [isMoving, setIsMoving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadFolders();
      setSelectedFolderId("");
      setExpandedFolders(new Set());
      setSearchQuery("");
    }
  }, [isOpen]);

  const loadFolders = async () => {
    try {
      setIsLoading(true);
      const response = await fileApi.getFolderTree();
      
      console.log('MoveModal - Folder tree response:', response);
      
      if (response.status === "ok" && Array.isArray(response.data)) {
        // Process the folder tree and exclude the current folder
        const processedFolders = processFolderTree(response.data, currentFolderId);
        setFolders(processedFolders);
      } else if (Array.isArray(response)) {
        const processedFolders = processFolderTree(response, currentFolderId);
        setFolders(processedFolders);
      } else {
        console.error('Unexpected response format:', response);
        toast.error("Unexpected folder structure format");
      }
    } catch (error) {
      console.error("❌ Error loading folders:", error);
      toast.error("Error loading folders");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to process the folder tree and exclude the current folder
  const processFolderTree = (folders, excludeFolderId) => {
    const filterFolders = (folderList) => {
      return folderList
        .filter(folder => folder.id !== excludeFolderId) // Exclude current folder
        .map(folder => ({
          ...folder,
          type: folder.type || "folder",
          children: folder.children ? filterFolders(folder.children) : []
        }))
        .filter(folder => {
          // Also exclude any folders that have the fileId (in case it's a folder being moved)
          return folder.id !== fileId;
        });
    };

    return filterFolders(folders);
  };

  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleMove = async () => {
    if (!selectedFolderId) {
      toast.error("Please select a destination folder");
      return;
    }

    setIsMoving(true);
    try {
      const response = await fileApi.moveItem(fileId, selectedFolderId);
      
      // Check for various success response formats
      const isSuccess = response.status === 'success' || 
                       response.status === 'ok' || 
                       response.success === true;

      if (isSuccess) {
        toast.success(response.message || "File moved successfully");
        onFileMoved();
        onClose();
      } else {
        toast.error(response.message || "Failed to move file");
      }
    } catch (error) {
      console.error("❌ Error moving file:", error);
      toast.error(error.response?.data?.message || "Error moving file");
    } finally {
      setIsMoving(false);
    }
  };

  const renderFolder = (folder, level = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolderId === folder.id;
    const hasChildren = folder.children && folder.children.length > 0;

    return (
      <div key={folder.id} className="space-y-1">
        <div className="flex items-center">
          {/* Indentation for hierarchy level */}
          <div style={{ width: `${level * 16}px` }} className="flex-shrink-0" />

          {/* Expand/Collapse button */}
          <button
            onClick={() => toggleFolder(folder.id)}
            className="p-0.5 hover:bg-accent rounded transition-colors flex-shrink-0 mr-1"
            disabled={!hasChildren}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
              )
            ) : (
              <div className="w-3 h-3" />
            )}
          </button>

          {/* Folder button */}
          <button
            onClick={() => setSelectedFolderId(folder.id)}
            className={`flex items-center gap-2 px-2 py-1 text-sm flex-1 text-left rounded transition-colors ${
              isSelected 
                ? "bg-primary text-primary-foreground font-medium" 
                : "hover:bg-accent"
            }`}
          >
            {isExpanded && hasChildren ? (
              <FolderOpen className="w-4 h-4 flex-shrink-0" />
            ) : (
              <Folder className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="truncate" title={folder.name}>
              {folder.name}
            </span>
          </button>
        </div>

        {/* Render children if folder is expanded and has children */}
        {isExpanded && hasChildren && (
          <div className="space-y-1">
            {folder.children.map((child) => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Filter folders by search query
  const filterFolders = (folders, query) => {
    if (!query) return folders;

    const filterRecursive = (folderList) => {
      return folderList
        .map(folder => {
          const matches = folder.name.toLowerCase().includes(query.toLowerCase());
          const childrenMatches = filterRecursive(folder.children || []);
          
          // If this folder matches or has children that match, include it
          if (matches || childrenMatches.length > 0) {
            return {
              ...folder,
              children: childrenMatches
            };
          }
          return null;
        })
        .filter(Boolean);
    };

    return filterRecursive(folders);
  };

  const handleClose = () => {
    setSelectedFolderId("");
    setExpandedFolders(new Set());
    setSearchQuery("");
    onClose();
  };

  const filteredFolders = searchQuery ? filterFolders(folders, searchQuery) : folders;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move File</DialogTitle>
          <DialogDescription>
            Select a destination folder for "{fileName}"
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        <Input
          type="text"
          placeholder="Search folders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-3"
        />

        <ScrollArea className="h-64 w-full border rounded-md p-2">
          <div className="space-y-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Loading folders...</span>
              </div>
            ) : filteredFolders.length > 0 ? (
              filteredFolders.map((folder) => renderFolder(folder))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                {searchQuery ? "No matching folders found." : "No folders available."}
              </p>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleMove} 
            disabled={!selectedFolderId || isMoving}
          >
            {isMoving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Moving...
              </>
            ) : (
              "Move File"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}