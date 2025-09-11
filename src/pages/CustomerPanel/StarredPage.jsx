import { useState, useEffect } from "react";
import {
  Star,
  Download,
  Trash2,
  Share2,
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

export default function StarredPage() {
  const [starredFiles, setStarredFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStarredFiles();
  }, []);

  const loadStarredFiles = async () => {
    setLoading(true);
    try {
      const response = await apiService.getStarredFiles();
      if (response.success) {
        setStarredFiles(response.data);
      } else {
        toast.error("Failed to load starred files");
      }
    } catch (error) {
      console.error("Error loading starred files:", error);
      toast.error("Error loading starred files");
    } finally {
      setLoading(false);
    }
  };

  const handleUnstarFile = async (fileId) => {
    try {
      const response = await apiService.starFile(fileId); // Toggle star
      if (response.success) {
        loadStarredFiles(); // Reload to update list
        toast.success("File unstarred");
      } else {
        toast.error("Failed to unstar file");
      }
    } catch (error) {
      console.error("Error unstarring file:", error);
      toast.error("Error unstarring file");
    }
  };

  const handleMoveToTrash = async (fileId) => {
    try {
      const response = await apiService.moveToTrash(fileId);
      if (response.success) {
        loadStarredFiles(); // Reload files
        toast.success("File moved to trash");
      } else {
        toast.error("Failed to move file to trash");
      }
    } catch (error) {
      console.error("Error moving file to trash:", error);
      toast.error("Error moving file to trash");
    }
  };

  const handleShareFile = async (fileId) => {
    const email = prompt("Enter email address to share with:");
    if (!email) return;

    try {
      const response = await apiService.shareFile(fileId, email);
      if (response.success) {
        toast.success("File shared successfully");
      } else {
        toast.error("Failed to share file");
      }
    } catch (error) {
      console.error("Error sharing file:", error);
      toast.error("Error sharing file");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Star className="w-6 h-6 text-panel" />
          <h1 className="text-2xl font-semibold text-foreground">
            Starred Files
          </h1>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          Loading starred files...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Star className="w-6 h-6 text-panel" />
        <h1 className="text-2xl font-semibold text-foreground">
          Starred Files
        </h1>
      </div>

      {starredFiles.length === 0 ? (
        <div className="text-center py-12">
          <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No starred files
          </h3>
          <p className="text-muted-foreground">
            Files you star will appear here for quick access.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="bg-muted px-4 py-3 border-b border-border">
            <div className="grid grid-cols-5 gap-4 text-sm font-medium text-muted-foreground">
              <div>Name</div>
              <div>Owner</div>
              <div>Last Modified</div>
              <div>File Size</div>
              <div>Actions</div>
            </div>
          </div>

          <div className="divide-y divide-border">
            {starredFiles.map((file) => (
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
                        handleUnstarFile(file.id);
                      }}
                      className="h-8 w-8 p-0 text-panel"
                      title="Unstar"
                    >
                      <Star className="h-3 w-3 fill-current" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShareFile(file.id);
                      }}
                      className="h-8 w-8 p-0"
                      title="Share"
                    >
                      <Share2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveToTrash(file.id);
                      }}
                      className="h-8 w-8 p-0 text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
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
