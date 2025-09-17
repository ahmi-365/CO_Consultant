import { useState, useEffect } from "react";
import { Star, Share2, FileText, Archive, Image, Video, File, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { starService } from "@/services/Starredservice"; // Your API service

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
      return <Folder className={iconClass} />;
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
      const response = await starService.getStarredFiles();
      if (response.status === "ok") {
        setStarredFiles(response.data || []);
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

  const handleToggleStar = async (fileId) => {
    try {
      const response = await starService.toggleStar(fileId); // toggle star/unstar
      if (response.status === "ok") {
        loadStarredFiles();
        toast.success(response.data?.message || "Action successful");
      } else {
        toast.error("Failed to perform action");
      }
    } catch (error) {
      console.error("Error toggling star:", error);
      toast.error("Error performing action");
    }
  };

  const handleShareFile = async (fileId) => {
    const email = prompt("Enter email to share with:");
    if (!email) return;

    try {
      const response = await starService.shareFile(fileId, email);
      if (response.status === "ok") {
        toast.success(response.data?.message || "File shared successfully");
      } else {
        toast.error("Failed to share file");
      }
    } catch (error) {
      console.error("Error sharing file:", error);
      toast.error("Error sharing file");
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading starred files...</div>;
  }

  if (starredFiles.length === 0) {
    return (
      <div className="text-center py-12">
        <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No starred files</h3>
        <p className="text-muted-foreground">Files you star will appear here for quick access.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {starredFiles.map((file) => (
        <div key={file.id} className="px-4 py-3 hover:bg-muted/50 cursor-pointer group">
          <div className="grid grid-cols-5 gap-4 text-sm items-center">
            <div className="flex items-center">
              {getFileIcon(file.type)}
              <span className="text-foreground">{file.name}</span>
            </div>
            <div className="text-muted-foreground">{file.user_id}</div>
            <div className="text-muted-foreground">{file.updated_at}</div>
            <div className="text-muted-foreground">{file.size}</div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); handleToggleStar(file.id); }}
                title="Unstar"
                className="h-8 w-8 p-0 text-panel"
              >
                <Star className="h-3 w-3 fill-current" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); handleShareFile(file.id); }}
                title="Share"
                className="h-8 w-8 p-0"
              >
                <Share2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
