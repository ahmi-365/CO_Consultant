import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, File, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/api";

export default function FileUploadModal({ isOpen, onClose, onFileUploaded, currentFolder }) {
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileType = (fileName) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")) return "image";
    if (["mp4", "avi", "mov", "wmv"].includes(extension || "")) return "video";
    if (["zip", "rar", "7z"].includes(extension || "")) return "zip";
    return "document";
  };

  const handleUpload = async (file) => {
    const uploadId = Math.random().toString(36).substr(2, 9);
    const newFile = {
      id: uploadId,
      name: file.name,
      size: file.size,
      progress: 0,
      status: "uploading",
    };

    setUploadingFiles((prev) => [...prev, newFile]);

    try {
      const progressInterval = setInterval(() => {
        setUploadingFiles((prev) =>
          prev.map((f) => {
            if (f.id === uploadId && f.status === "uploading") {
              const newProgress = Math.min(f.progress + Math.random() * 15, 90);
              return { ...f, progress: newProgress };
            }
            return f;
          })
        );
      }, 200);

      const response = await apiService.uploadFile(file);

      clearInterval(progressInterval);

      if (response.success) {
        setUploadingFiles((prev) =>
          prev.map((f) => (f.id === uploadId ? { ...f, progress: 100, status: "completed" } : f))
        );
        setTimeout(() => {
          onFileUploaded(file);
          toast.success(`${file.name} uploaded successfully!`);
        }, 500);
      } else {
        setUploadingFiles((prev) =>
          prev.map((f) => (f.id === uploadId ? { ...f, status: "error" } : f))
        );
        toast.error(`Failed to upload ${file.name}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadingFiles((prev) =>
        prev.map((f) => (f.id === uploadId ? { ...f, status: "error" } : f))
      );
      toast.error(`Error uploading ${file.name}`);
    }
  };

  const handleFileSelect = (files) => {
    if (!files) return;
    Array.from(files).forEach((file) => handleUpload(file));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const clearCompletedUploads = () => {
    setUploadingFiles((prev) => prev.filter((f) => f.status !== "completed"));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver ? "border-panel bg-panel/5" : "border-muted-foreground/25 hover:border-panel/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Drop files here or click to browse</p>
            <p className="text-sm text-muted-foreground">
              Support for a single or bulk upload. Strictly prohibit from uploading company data or other banned files
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>

          {/* Uploading Files */}
          {uploadingFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Uploading Files</h3>
                {uploadingFiles.some((f) => f.status === "completed") && (
                  <Button variant="ghost" size="sm" onClick={clearCompletedUploads}>
                    Clear completed
                  </Button>
                )}
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {uploadingFiles.map((file) => (
                  <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      {file.status === "completed" ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <File className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Progress value={file.progress} className="flex-1 h-2 [&>div]:bg-panel" />
                        <span className="text-xs text-muted-foreground min-w-0">{Math.round(file.progress)}%</span>
                      </div>
                    </div>

                    {file.status === "uploading" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-panel"
                        onClick={() => setUploadingFiles((prev) => prev.filter((f) => f.id !== file.id))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
