import { useState, useEffect, useCallback } from "react";
import {
  Trash2,
  RotateCcw,
  X,
  FileText,
  Archive,
  Image,
  Video,
  File,
  CheckSquare,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trashService } from "@/services/trashService";

const getFileIcon = (type) => {
  const iconClass = "w-4 h-4 text-muted-foreground mr-2";
  switch (type) {
    case "document":
      return <FileText className={iconClass} />;
    case "zip":
      return <Archive className={iconClass} />;
    case "image":
      return <Image className={iconClass} />;
    case "video":
      return <Video className={iconClass} />;
    case "folder":
      return <File className={iconClass} />;
    default:
      return <File className={iconClass} />;
  }
};

export default function TrashPage() {
  const [trashedFiles, setTrashedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  useEffect(() => {
    loadTrashedFiles();
  }, []);

  const loadTrashedFiles = async () => {
    setLoading(true);
    try {
      const response = await trashService.getTrashedFiles();
      console.log("Trashed files response:", response);

      if (response.status === "ok" && Array.isArray(response.data)) {
        setTrashedFiles(response.data);
      } else {
        toast.error("Failed to load trashed files");
      }
    } catch (error) {
      console.error("Error loading trashed files:", error);
      toast.error("Error loading trashed files");
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreFile = async (fileId) => {
    try {
      const response = await trashService.restoreFile(fileId);

      if (response.status === "success") {
        loadTrashedFiles();
        toast.success(
          response.original?.message || "File restored successfully"
        );
      } else {
        toast.error(response.original?.message || "Failed to restore file");
      }
    } catch (error) {
      console.error("Error restoring file:", error);
      toast.error("Error restoring file");
    }
  };

  const handlePermanentDelete = async (fileId) => {
    if (
      !window.confirm("Are you sure you want to permanently delete this file?")
    )
      return;
    try {
      const response = await trashService.permanentDelete(fileId);
      if (response.success) {
        loadTrashedFiles();
        toast.success("File permanently deleted");
      } else {
        toast.error("Failed to delete file");
      }
    } catch {
      toast.error("Error deleting file");
    }
  };

  const handleBulkRestore = async () => {
    if (selectedFiles.size === 0) {
      toast.error("Please select files to restore");
      return;
    }

    setBulkLoading(true);
    try {
      const fileIds = Array.from(selectedFiles);
      const response = await trashService.bulkRestoreFiles(fileIds);

      // Fix: Check for the correct response structure
      if (response.success || response.status === "success" || response.original?.status === "ok") {
        loadTrashedFiles();
        setSelectedFiles(new Set());
        setIsSelectionMode(false);
        // Use the message from the nested original object if available
        const successMessage = response.original?.message || response.message || `${fileIds.length} file(s) restored successfully`;
        toast.success(successMessage);
      } else {
        const errorMessage = response.original?.message || response.error || "Failed to restore files";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error in bulk restore:", error);
      toast.error("Error restoring files");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) {
      toast.error("Please select files to delete");
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete ${selectedFiles.size} selected file(s)? This cannot be undone.`)) {
      return;
    }

    setBulkDeleteLoading(true);
    try {
      const fileIds = Array.from(selectedFiles);
      const response = await trashService.bulkPermanentDelete(fileIds);

      if (response.success || response.status === "success" || response.original?.status === "ok") {
        loadTrashedFiles();
        setSelectedFiles(new Set());
        setIsSelectionMode(false);
        const successMessage = response.original?.message || response.message || `${fileIds.length} file(s) permanently deleted`;
        toast.success(successMessage);
      } else {
        const errorMessage = response.original?.message || response.error || "Failed to delete files";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error in bulk delete:", error);
      toast.error("Error deleting files");
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  const toggleFileSelection = useCallback((fileId) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedFiles.size === trashedFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(trashedFiles.map(f => f.id)));
    }
  }, [selectedFiles.size, trashedFiles]);

  const enterSelectionMode = () => {
    setIsSelectionMode(true);
    setSelectedFiles(new Set());
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedFiles(new Set());
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Trash2 className="w-6 h-6 text-panel" />
          <h1 className="text-2xl font-semibold text-foreground">Trash</h1>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          Loading trashed files...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trash2 className="w-6 h-6 text-panel" />
          <h1 className="text-2xl font-semibold text-foreground">Trash</h1>
          {trashedFiles.length > 0 && (
            <span className="text-sm text-muted-foreground">
              ({trashedFiles.length} files)
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {isSelectionMode ? (
            <>
              <span className="text-sm text-muted-foreground">
                {selectedFiles.size} selected
              </span>
              <Button
                onClick={handleBulkRestore}
                disabled={selectedFiles.size === 0 || bulkLoading}
                variant="outline"
                size="sm"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {bulkLoading ? "Restoring..." : "Restore Selected"}
              </Button>
              <Button
                onClick={handleBulkDelete}
                disabled={selectedFiles.size === 0 || bulkDeleteLoading}
                variant="destructive"
                size="sm"
              >
                <X className="w-4 h-4 mr-2" />
                {bulkDeleteLoading ? "Deleting..." : "Delete Selected"}
              </Button>
              <Button
                onClick={exitSelectionMode}
                variant="ghost"
                size="sm"
              >
                Cancel
              </Button>
            </>
          ) : (
            trashedFiles.length > 0 && (
              <>
                <Button
                  onClick={enterSelectionMode}
                  variant="outline"
                  size="sm"
                >
                  Select Files
                </Button>
                <Button
                  onClick={() => {
                    if (window.confirm("Empty the trash? This cannot be undone.")) {
                      trashedFiles.forEach((f) => trashService.permanentDelete(f.id));
                      setTrashedFiles([]);
                      toast.success("Trash emptied successfully");
                    }
                  }}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Empty Trash
                </Button>
              </>
            )
          )}
        </div>
      </div>

      {trashedFiles.length === 0 ? (
        <div className="text-center py-12">
          <Trash2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Trash is empty
          </h3>
          <p className="text-muted-foreground">
            Files you delete will appear here before being permanently removed.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="bg-muted px-4 py-3 border-b border-border">
            <div className="grid grid-cols-6 gap-4 text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                {isSelectionMode && (
                  <button
                    onClick={toggleSelectAll}
                    className="p-1 hover:bg-background rounded"
                    title={selectedFiles.size === trashedFiles.length ? "Deselect All" : "Select All"}
                  >
                    {selectedFiles.size === trashedFiles.length ? (
                      <CheckSquare className="w-4 h-4 text-primary" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                )}
                Name
              </div>
              <div>Owner</div>
              <div>Deleted</div>
              <div>File Size</div>
              <div>Actions</div>
            </div>
          </div>

          <div className="divide-y divide-border">
            {trashedFiles.map((file) => (
              <div
                key={file.id}
                className={`px-4 py-3 cursor-pointer transition-colors ${
                  isSelectionMode
                    ? selectedFiles.has(file.id)
                      ? "bg-primary/5 border-l-2 border-l-primary"
                      : "hover:bg-muted/30"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => isSelectionMode && toggleFileSelection(file.id)}
              >
                <div className="grid grid-cols-6 gap-4 text-sm items-center">
                  <div className="flex items-center gap-2">
                    {isSelectionMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFileSelection(file.id);
                        }}
                        className="p-1 hover:bg-background rounded"
                      >
                        {selectedFiles.has(file.id) ? (
                          <CheckSquare className="w-4 h-4 text-primary" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    {getFileIcon(file.type)}
                    <span className="text-foreground truncate">{file.name}</span>
                  </div>
                  <div className="text-muted-foreground truncate">{file.user_id}</div>
                  <div className="text-muted-foreground">{file.deleted_at}</div>
                  <div className="text-muted-foreground">{file.size}</div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestoreFile(file.id);
                      }}
                      className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                      title="Restore"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePermanentDelete(file.id);
                      }}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      title="Delete Permanently"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}