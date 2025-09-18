import { useState, useEffect } from "react";
import { Star, Share2, FileText, Archive, Image, Video, File, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { starService } from "@/services/Starredservice"; // Your API service

const getFileIcon = (type) => {
  const iconClass = "w-5 h-5 mr-3 transition-colors duration-200";
  switch (type) {
    case "document":
      return <FileText className={`${iconClass} text-blue-500`} />;
    case "zip":
      return <Archive className={`${iconClass} text-orange-500`} />;
    case "image":
      return <Image className={`${iconClass} text-green-500`} />;
    case "video":
      return <Video className={`${iconClass} text-purple-500`} />;
    case "folder":
      return <Folder className={`${iconClass} text-yellow-500`} />;
    default:
      return <File className={`${iconClass} text-gray-500`} />;
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
      const response = await starService.toggleStar(fileId);
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
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="relative">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-8 h-8 border-4 border-transparent border-t-purple-400 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
        </div>
        <div className="text-center text-muted-foreground font-medium">Loading starred files...</div>
      </div>
    );
  }

  if (starredFiles.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-20 animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-4 shadow-lg">
            <Star className="h-8 w-8 text-white" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-3">No starred files</h3>
        <p className="text-muted-foreground text-lg">Files you star will appear here for quick access.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Starred</h1>
            <p className="text-gray-600 dark:text-gray-300">
              {starredFiles.length} {starredFiles.length === 1 ? "file" : "files"} starred
            </p>
          </div>
        </div>


      </div>
      {/* Desktop Table Headers */}
      <div className="hidden sm:block bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl mb-4 px-6 py-4 border border-gray-200 dark:border-gray-600">
        <div className="grid grid-cols-12 lg:grid-cols-5 gap-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <div className="col-span-6 lg:col-span-1 flex items-center">
            <FileText className="w-4 h-4 mr-2 text-blue-500" />
            File Name
          </div>
          <div className="col-span-3 lg:col-span-1">Owner</div>
          <div className="col-span-3 lg:col-span-1 hidden md:block">Modified</div>
          <div className="col-span-3 lg:col-span-1 hidden lg:block">Size</div>
          <div className="col-span-3 lg:col-span-1 text-right">Actions</div>
        </div>
      </div>

      {/* File List */}
      <div className="space-y-3">
        {starredFiles.map((file, index) => (
          <div
            key={file.id}
            className="relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer group overflow-hidden"
            style={{
              animationDelay: `${index * 50}ms`,
              animation: "fadeInUp 0.5s ease-out forwards",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative px-6 py-4">
              {/* ✅ Desktop Layout */}
              <div className="hidden sm:grid grid-cols-12 lg:grid-cols-5 gap-4 text-sm items-center">
                <div className="col-span-6 lg:col-span-1 flex items-center min-w-0">
                  <div className="flex-shrink-0">{getFileIcon(file.type)}</div>
                  <span className="text-foreground font-medium truncate group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200">
                    {file.name}
                  </span>
                </div>
                <div className="col-span-3 lg:col-span-1 text-muted-foreground font-medium">{file.user_id}</div>
                <div className="col-span-3 lg:col-span-1 hidden md:block text-muted-foreground">{file.updated_at}</div>
                <div className="col-span-3 lg:col-span-1 hidden lg:block">
                  <span className="text-muted-foreground font-mono text-xs bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md inline-block">{file.size}</span>
                </div>
                <div className="col-span-6 lg:col-span-1 flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); handleToggleStar(file.id); }}
                    className="h-9 w-9 p-0 rounded-full hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                  >
                    <Star className="h-4 w-4 fill-current text-yellow-500" />
                  </Button>
                  
                </div>
              </div>

              {/* ✅ Mobile Layout */}
              <div className="sm:hidden flex flex-col space-y-3">
                {/* Top Row */}
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">{getFileIcon(file.type)}</div>
                  <span className="text-foreground font-medium truncate">{file.name}</span>
                </div>

                {/* Info Row */}
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>By {file.user_id}</span>
                  <span>{file.updated_at}</span>
                  <span className="font-mono bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">{file.size}</span>
                </div>

                {/* Actions Row */}
                <div className="flex justify-end gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); handleToggleStar(file.id); }}
                    className="h-10 w-10 p-0 rounded-full hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                  >
                    <Star className="h-5 w-5 fill-current text-yellow-500" />
                  </Button>
                 
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-0.5  transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
