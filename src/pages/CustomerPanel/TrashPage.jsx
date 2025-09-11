import { useState, useEffect } from "react";
import {
  Trash2,
  RotateCcw,
  X,
  FileText,
  Archive,
  Image,
  Video,
  File,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiService, FileItem } from "@/services/api";

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

  useEffect(() => {
    loadTrashedFiles();
  }, []);

  const loadTrashedFiles = async () => {
    setLoading(true);
    try {
      const response = await apiService.getTrashedFiles();
      if (response.success) {
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
      const response = await apiService.restoreFile(fileId);
      if (response.success) {
        loadTrashedFiles(); // Reload to update list
        toast.success("File restored successfully");
      } else {
        toast.error("Failed to restore file");
      }
    } catch (error) {
      console.error("Error restoring file:", error);
      toast.error("Error restoring file");
    }
  };

  const handlePermanentDelete = async (fileId) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this file? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await apiService.deleteFile(fileId);
      if (response.success) {
        loadTrashedFiles(); // Reload files
        toast.success("File permanently deleted");
      } else {
        toast.error("Failed to delete file permanently");
      }
    } catch (error) {
      console.error("Error deleting file permanently:", error);
      toast.error("Error deleting file permanently");
    }
  };

  const handleEmptyTrash = async () => {
    if (
      !window.confirm(
        "Are you sure you want to empty the trash? This will permanently delete all files and cannot be undone."
      )
    ) {
      return;
    }

    try {
      // Delete all trashed files
      for (const file of trashedFiles) {
        await apiService.deleteFile(file.id);
      }
      setTrashedFiles([]);
      toast.success("Trash emptied successfully");
    } catch (error) {
      console.error("Error emptying trash:", error);
      toast.error("Error emptying trash");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trash2 className="w-6 h-6 text-panel" />
            <h1 className="text-2xl font-semibold text-foreground">Trash</h1>
          </div>
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
        </div>
        {trashedFiles.length > 0 && (
          <Button onClick={handleEmptyTrash} variant="destructive" size="sm">
            <Trash2 className="w-4 h-4 mr-2" />
            Empty Trash
          </Button>
        )}
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
            <div className="grid grid-cols-5 gap-4 text-sm font-medium text-muted-foreground">
              <div>Name</div>
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
                className="px-4 py-3 hover:bg-muted/50 cursor-pointer group"
              >
                <div className="grid grid-cols-5 gap-4 text-sm">
                  <div className="flex items-center">
                    {getFileIcon(file.type)}
                    <span className="text-foreground">{file.name}</span>
                  </div>
                  <div className="text-muted-foreground">{file.owner}</div>
                  <div className="text-muted-foreground">
                    {file.lastModified}
                  </div>
                  <div className="text-muted-foreground">{file.size}</div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestoreFile(file.id);
                      }}
                      className="h-8 w-8 p-0 text-green-600"
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
                      className="h-8 w-8 p-0 text-destructive"
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
