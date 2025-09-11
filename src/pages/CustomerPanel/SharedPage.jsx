import { useState, useEffect } from "react";
import {
  Users,
  Download,
  Star,
  Trash2,
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

export default function SharedPage() {
  const [sharedFiles, setSharedFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSharedFiles();
  }, []);

  const loadSharedFiles = async () => {
    setLoading(true);
    try {
      const response = await apiService.getSharedFiles();
      if (response.success) {
        setSharedFiles(response.data);
      } else {
        toast.error("Failed to load shared files");
      }
    } catch (error) {
      console.error("Error loading shared files:", error);
      toast.error("Error loading shared files");
    } finally {
      setLoading(false);
    }
  };

  const handleStarFile = async (fileId) => {
    try {
      const response = await apiService.starFile(fileId);
      if (response.success) {
        loadSharedFiles(); // Reload to get updated star status
        toast.success("File starred successfully");
      } else {
        toast.error("Failed to star file");
      }
    } catch (error) {
      console.error("Error starring file:", error);
      toast.error("Error starring file");
    }
  };

  const handleMoveToTrash = async (fileId) => {
    try {
      const response = await apiService.moveToTrash(fileId);
      if (response.success) {
        loadSharedFiles(); // Reload files
        toast.success("File moved to trash");
      } else {
        toast.error("Failed to move file to trash");
      }
    } catch (error) {
      console.error("Error moving file to trash:", error);
      toast.error("Error moving file to trash");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-panel" />
          <h1 className="text-2xl font-semibold text-foreground">
            Shared with me
          </h1>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          Loading shared files...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="w-6 h-6 text-panel" />
        <h1 className="text-2xl font-semibold text-foreground">
          Shared with me
        </h1>
      </div>

      {sharedFiles.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No shared files
          </h3>
          <p className="text-muted-foreground">
            Files shared with you by others will appear here.
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
            {sharedFiles.map((file) => (
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
                        toast.info("Download functionality coming soon");
                      }}
                      className="h-8 w-8 p-0"
                      title="Download"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStarFile(file.id);
                      }}
                      className="h-8 w-8 p-0"
                      title="Star"
                    >
                      <Star className="h-3 w-3" />
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
