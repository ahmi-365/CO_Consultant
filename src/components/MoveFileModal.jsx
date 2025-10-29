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
import { Folder, FolderOpen } from "lucide-react";
import { fileApi } from "../services/FileService";
import { toast } from "sonner";

export default function MoveFileModal({
  isOpen,
  onClose,
  fileId,
  fileName,
  currentFolderId,
  onFileMoved,
}) {
  const [folders, setFolders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadFolders();
    }
  }, [isOpen]);

  const loadFolders = async () => {
    try {
      const response = await fileApi.listFiles();
      if (Array.isArray(response)) {
        const foldersWithState = response
          .filter(
            (item) =>
              item.type === "folder" &&
              item.id !== currentFolderId &&
              item.id !== fileId
          )
          .map((folder) => ({
            ...folder,
            children: [],
            isExpanded: false,
            isLoading: false,
          }));
        setFolders(foldersWithState);
      }
    } catch (error) {
      console.error("❌ Error loading folders:", error);
      toast.error("Error loading folders");
    }
  };

  const loadSubfolders = async (folderId) => {
    try {
      const response = await fileApi.listFiles(folderId);
      if (Array.isArray(response)) {
        setFolders((prevFolders) =>
          updateFolderInTree(prevFolders, folderId, {
            children: response
              .filter(
                (item) =>
                  item.type === "folder" &&
                  item.id !== currentFolderId &&
                  item.id !== fileId
              )
              .map((folder) => ({
                ...folder,
                children: [],
                isExpanded: false,
                isLoading: false,
              })),
            isLoading: false,
          })
        );
      }
    } catch (error) {
      console.error(`❌ Error loading subfolders for ${folderId}:`, error);
      toast.error("Error loading subfolders");
    }
  };

  const updateFolderInTree = (folders, folderId, updates) => {
    return folders.map((folder) => {
      if (folder.id === folderId) {
        return { ...folder, ...updates };
      }
      if (folder.children && folder.children.length > 0) {
        return {
          ...folder,
          children: updateFolderInTree(folder.children, folderId, updates),
        };
      }
      return folder;
    });
  };

  const toggleFolder = async (folderId) => {
    const newExpanded = new Set(expandedFolders);
    const isCurrentlyExpanded = newExpanded.has(folderId);

    if (isCurrentlyExpanded) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
      setFolders((prevFolders) =>
        updateFolderInTree(prevFolders, folderId, { isLoading: true })
      );
      await loadSubfolders(folderId);
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
      if (response.status === "success") {
        toast.success(response.message || "File moved successfully");
        onFileMoved();
        onClose();
      } else {
        toast.error(response.message || "Failed to move file");
      }
    } catch (error) {
      console.error("❌ Error moving file:", error);
      toast.error("Error moving file");
    } finally {
      setIsMoving(false);
    }
  };

  const renderFolder = (folder, level = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolderId === folder.id;

    return (
      <div key={folder.id} className="space-y-1">
        <div
          className={`flex items-center gap-2 px-2 py-1 text-sm w-full text-left rounded transition-colors cursor-pointer ${
            isSelected ? "bg-panel text-panel-foreground" : "hover:bg-muted"
          }`}
          style={{ marginLeft: `${level * 16}px` }}
          onClick={() => setSelectedFolderId(folder.id)}
        >
          {isExpanded ? (
            <FolderOpen className="w-4 h-4" />
          ) : (
            <Folder className="w-4 h-4" />
          )}
          <span className="truncate">{folder.name}</span>
        </div>

        {isExpanded &&
          folder.children &&
          folder.children.map((child) => renderFolder(child, level + 1))}
      </div>
    );
  };

  // 🔍 Filter folders by search
  const filterFolders = (folders) => {
    return folders
      .filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
      .map((f) => ({
        ...f,
        children: filterFolders(f.children || []),
      }));
  };

  const handleClose = () => {
    setSelectedFolderId("");
    setExpandedFolders(new Set());
    setSearchQuery("");
    onClose();
  };

  const filteredFolders = searchQuery ? filterFolders(folders) : folders;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move File</DialogTitle>
          <DialogDescription>
            Select a destination folder for "{fileName}"
          </DialogDescription>
        </DialogHeader>

        {/* 🔎 Search Bar */}
        <Input
          type="text"
          placeholder="Search folder..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-3"
        />

        <ScrollArea className="h-64 w-full border rounded-md p-2">
          <div className="space-y-1">
            {filteredFolders.length > 0 ? (
              filteredFolders.map((folder) => renderFolder(folder))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                No folders found.
              </p>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleMove} disabled={!selectedFolderId || isMoving}>
            {isMoving ? "Moving..." : "Move File"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
