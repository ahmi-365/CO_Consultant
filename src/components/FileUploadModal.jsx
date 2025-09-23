import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, File, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { fileApi } from "../services/FileService";

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

  // Unified upload handler for both single and multiple files
  const handleUpload = async (files) => {
    const fileArray = Array.from(files);
    
    // Create upload tracking objects
    const uploadingFilesList = fileArray.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      progress: 0,
      status: "uploading",
      file: file // Keep reference to original file
    }));

    setUploadingFiles(prev => [...prev, ...uploadingFilesList]);

    try {
      // Start progress simulation for all files
      const progressInterval = setInterval(() => {
        setUploadingFiles((prev) =>
          prev.map((f) => {
            if (f.status === "uploading" && uploadingFilesList.some(uf => uf.id === f.id)) {
              const newProgress = Math.min(f.progress + Math.random() * 10, 85);
              return { ...f, progress: newProgress };
            }
            return f;
          })
        );
      }, 300);

      // Use the unified uploadFile method (handles both single and multiple files)
      const uploadedFiles = await fileApi.uploadFile(fileArray, currentFolder?.id);

      clearInterval(progressInterval);

      // Mark all files as completed
      setUploadingFiles((prev) =>
        prev.map((f) => {
          if (uploadingFilesList.some(uf => uf.id === f.id)) {
            return { ...f, progress: 100, status: "completed" };
          }
          return f;
        })
      );

      // Show success message
      toast.success(`${fileArray.length} file${fileArray.length > 1 ? 's' : ''} uploaded successfully!`);
      
      // Notify parent component
      setTimeout(() => {
        onFileUploaded(uploadedFiles);
        onClose();
      }, 1000);

    } catch (error) {
      console.error("Upload error:", error);
      
      // Mark all files in this batch as failed
      setUploadingFiles((prev) =>
        prev.map((f) => {
          if (uploadingFilesList.some(uf => uf.id === f.id)) {
            return { ...f, status: "error" };
          }
          return f;
        })
      );
      
      toast.error(`Error uploading files: ${error.message}`);
    }
  };

  const handleFileSelect = (files) => {
    if (!files || files.length === 0) return;
    handleUpload(files);
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

  const retryUpload = (fileId) => {
    const failedFile = uploadingFiles.find(f => f.id === fileId);
    if (failedFile && failedFile.file) {
      // Remove the failed upload from list
      setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
      // Retry upload with single file
      handleUpload([failedFile.file]);
    }
  };

  const removeUpload = (fileId) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <File className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          {currentFolder && (
            <p className="text-sm text-muted-foreground">
              Uploading to: {currentFolder.name}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
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
              Support for multiple file uploads. Select multiple files at once for faster batch processing.
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
                <h3 className="text-sm font-medium">
                  Upload Progress ({uploadingFiles.filter(f => f.status === "completed").length}/{uploadingFiles.length} completed)
                </h3>
                <div className="flex gap-2">
                  {uploadingFiles.some((f) => f.status === "completed") && (
                    <Button variant="ghost" size="sm" onClick={clearCompletedUploads}>
                      Clear completed
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {uploadingFiles.map((file) => (
                  <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      {getStatusIcon(file.status)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Progress 
                          value={file.progress} 
                          className={`flex-1 h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 ${
                            file.status === "error" 
                              ? "[&>div]:bg-red-500" 
                              : file.status === "completed" 
                                ? "[&>div]:bg-green-500" 
                                : "[&>div]:bg-blue-500"
                          }`}
                        />
                        <span className="text-xs min-w-0">
                          {file.status === "error" ? "Failed" : 
                           file.status === "completed" ? "Done" : 
                           `${Math.round(file.progress)}%`}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      {file.status === "error" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="bg-blue-100 hover:bg-blue-200 text-blue-600 px-2 py-1 h-auto text-xs"
                          onClick={() => retryUpload(file.id)}
                        >
                          Retry
                        </Button>
                      )}
                      
                      {(file.status === "uploading" || file.status === "error") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="bg-gray-200 hover:bg-gray-300 text-gray-600"
                          onClick={() => removeUpload(file.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
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