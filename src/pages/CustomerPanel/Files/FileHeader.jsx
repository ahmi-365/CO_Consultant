import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FolderPlus, Upload, RefreshCw, Loader2 } from "lucide-react";
import FileUploadModal from "../../../components/FileUploadModal";

export default function FileHeader({
  recentFiles,
  isUploading,
  isCreating,
  isRefreshing,
  user,
  hasPermission,
  setIsCreateFolderOpen,
  handleRefresh,
}) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const getFileIcon = (fileName) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    const iconMap = {
      pdf: "📄",
      doc: "📝",
      docx: "📝",
      ppt: "📊",
      pptx: "📊",
      xls: "📈",
      xlsx: "📈",
      jpg: "🖼️",
      jpeg: "🖼️",
      png: "🖼️",
      gif: "🖼️",
      mp4: "🎥",
      mp3: "🎵",
      zip: "📦",
      rar: "📦",
    };
    return iconMap[ext || ""] || "📄";
  };

  const handleFileUploaded = (file) => {
    console.log("Uploaded:", file);
    // Optionally refresh recent files here
  };

  return (
    <div className="mb-8">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">
            File Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize and manage your team's files with ease
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        
     <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
  <h2 className="text-lg font-medium text-foreground">Quick Actions:</h2>

  <div className="flex flex-wrap gap-2">
    {hasPermission(user, "files.upload") && (
      <Button
        onClick={() => setIsUploadOpen(true)}
        disabled={isUploading}
        className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1 px-3 py-1.5 h-8 text-sm"
      >
        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        Upload
      </Button>
    )}

    {(hasPermission(user, "files.create") || hasPermission(user, "files.upload")) && (
      <Button
        onClick={() => setIsCreateFolderOpen(true)}
        disabled={isCreating}
        variant="outline"
        className="flex items-center gap-1 px-3 py-1.5 h-8 text-sm border-2"
      >
        {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderPlus className="h-4 w-4" />}
        New Folder
      </Button>
    )}

    <Button
      onClick={handleRefresh}
      disabled={isRefreshing}
      variant="outline"
      className="flex items-center gap-1 px-3 py-1.5 h-8 text-sm border-2"
    >
      {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
      Refresh
    </Button>
  </div>
</div>

      </div>

      {/* Recent Files */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-foreground mb-4">Recent Files</h2>
        {recentFiles.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {recentFiles.map((file) => (
              <div
                key={file.id}
                className="flex flex-col items-center cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
onClick={() => window.open(file.web_url, "_blank")}
              >
                <div className="w-28 h-28 rounded-lg bg-muted flex items-center justify-center mb-2">
                  <div className="text-4xl">{getFileIcon(file.file?.name)}</div>
                </div>

                <h3 className="text-sm font-semibold text-center line-clamp-1 w-28">
{file.name}                </h3>

                <p className="text-xs text-muted-foreground">
{file.type?.toUpperCase() || "FILE"}                </p>

                <p className="text-xs text-blue-500 mt-1">
                  Action: {file.action}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No recent files</p>
        )}
      </div>

      {/* Upload Modal */}
      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onFileUploaded={handleFileUploaded}
      />
    </div>
  );
}
