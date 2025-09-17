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

  useEffect(() => {
    loadTrashedFiles();
  }, []);

  const loadTrashedFiles = async () => {
    setLoading(true);
    try {
      const response = await trashService.getTrashedFiles();
      if (response.status === "ok" && response.data?.original?.files) {
        setTrashedFiles(response.data.original.files);
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

      // check top-level status
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
        </div>
        {trashedFiles.length > 0 && (
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
                  <div className="text-muted-foreground">{file.user_id}</div>
                  <div className="text-muted-foreground">{file.deleted_at}</div>
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
