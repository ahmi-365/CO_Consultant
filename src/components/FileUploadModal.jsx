import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, File, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { fileApi } from "../services/FileService";

export default function FileUploadModal({ isOpen, onClose, onFileUploaded, currentFolder }) {
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [userPermissions, setUserPermissions] = useState([]);
  const [hasUploadPermission, setHasUploadPermission] = useState(false);
  const fileInputRef = useRef(null);

  // Check user permissions on mount and when modal opens
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const perms = Array.isArray(parsedUser.permissions)
          ? parsedUser.permissions
          : [];
        setUserPermissions(perms);
        setHasUploadPermission(perms.includes("files.upload"));
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        setHasUploadPermission(false);
      }
    } else {
      setHasUploadPermission(false);
    }
  }, [isOpen]);

  // ✅ File rules
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
  const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/plain",
  ];

  // ✅ Format file size helper
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // ✅ Validate file type & size
  const validateFiles = (files) => {
    const validFiles = [];
    const invalidFiles = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push({
          file,
          reason: `File size too large (${formatFileSize(file.size)}). Max allowed is 50 MB.`,
        });
      } else if (!ALLOWED_TYPES.includes(file.type)) {
        invalidFiles.push({
          file,
          reason: `File format not supported (${file.type || "unknown"}).`,
        });
      } else {
        validFiles.push(file);
      }
    }

    invalidFiles.forEach(({ file, reason }) => {
      toast.error(`❌ ${file.name} - ${reason}`);
    });

    return validFiles;
  };

  // ✅ Unified upload handler for single & multiple files
  const handleUpload = async (files) => {
    // Check upload permission before starting upload
    if (!hasUploadPermission) {
      toast.error("❌ You don't have permission to upload files. Please contact your administrator.");
      return;
    }

    const fileArray = Array.from(files);

    const uploadingFilesList = fileArray.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      progress: 0,
      status: "uploading",
      file: file,
      controller: new AbortController(),
    }));

    setUploadingFiles((prev) => [...prev, ...uploadingFilesList]);

    // Create upload promises for each file with individual cancellation
    const uploadPromises = uploadingFilesList.map(async (uploadingFile) => {
      try {
        // Simulate progress for this specific file
        const progressInterval = setInterval(() => {
          setUploadingFiles((prev) =>
            prev.map((f) => {
              if (f.id === uploadingFile.id && f.status === "uploading") {
                const newProgress = Math.min(f.progress + Math.random() * 10, 85);
                return { ...f, progress: newProgress };
              }
              return f;
            })
          );
        }, 300);

        // Call API for this specific file
        const uploadedFile = await fileApi.uploadFile([uploadingFile.file], currentFolder?.id, {
          signal: uploadingFile.controller.signal,
        });

        clearInterval(progressInterval);

        // Mark this file as completed
        setUploadingFiles((prev) =>
          prev.map((f) => {
            if (f.id === uploadingFile.id) {
              return { ...f, progress: 100, status: "completed" };
            }
            return f;
          })
        );

        return uploadedFile;
      } catch (error) {
        clearInterval(progressInterval);

        if (error.name === "AbortError") {
          console.log(`✅ Upload cancelled: ${uploadingFile.name}`);
          setUploadingFiles((prev) =>
            prev.map((f) => {
              if (f.id === uploadingFile.id) {
                return { ...f, status: "cancelled" };
              }
              return f;
            })
          );
          return null;
        }

        console.error(`Upload error for ${uploadingFile.name}:`, error);
        setUploadingFiles((prev) =>
          prev.map((f) => {
            if (f.id === uploadingFile.id) {
              return { ...f, status: "error" };
            }
            return f;
          })
        );
        throw error;
      }
    });

    try {
      // Wait for all uploads to complete
      const results = await Promise.allSettled(uploadPromises);

      // Filter out successful uploads (excluding cancelled ones)
      const successfulUploads = results
        .filter(result => result.status === 'fulfilled' && result.value !== null)
        .map(result => result.value)
        .flat();

      // Count completed vs cancelled
      const completedCount = uploadingFilesList.filter(f =>
        !f.controller.signal.aborted
      ).length;
      const cancelledCount = uploadingFilesList.filter(f =>
        f.controller.signal.aborted
      ).length;

      if (completedCount > 0) {
        toast.success(`${completedCount} file${completedCount > 1 ? "s" : ""} uploaded successfully!`);
      }

      if (cancelledCount > 0) {
        toast.info(`${cancelledCount} upload${cancelledCount > 1 ? "s" : ""} cancelled.`);
      }

      // Only call callback if there are successful uploads
      if (successfulUploads.length > 0) {
        setTimeout(() => {
          onFileUploaded(successfulUploads);
        }, 1000);
      }
    } catch (error) {
      console.error("Overall upload error:", error);
      toast.error(`Error uploading files: ${error.message}`);
    }
  };

  // ✅ File select with validation
  const handleFileSelect = (files) => {
    if (!files || files.length === 0) return;
    
    // Check permission first
    if (!hasUploadPermission) {
      toast.error("❌ You don't have permission to upload files. Please contact your administrator.");
      return;
    }
    
    const validFiles = validateFiles(Array.from(files));
    if (validFiles.length > 0) handleUpload(validFiles);
  };

  // ✅ Drag & drop handlers
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
    
    // Check permission first
    if (!hasUploadPermission) {
      toast.error("❌ You don't have permission to upload files. Please contact your administrator.");
      return;
    }
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  // ✅ Misc actions
  const clearCompletedUploads = () => {
    setUploadingFiles((prev) => prev.filter((f) => f.status !== "completed" && f.status !== "cancelled"));
  };

  const retryUpload = (fileId) => {
    const failedFile = uploadingFiles.find((f) => f.id === fileId);
    if (failedFile && failedFile.file) {
      setUploadingFiles((prev) => prev.filter((f) => f.id !== fileId));
      handleUpload([failedFile.file]);
    }
  };

  const removeUpload = (fileId) => {
    setUploadingFiles((prev) => {
      const fileToCancel = prev.find((f) => f.id === fileId);
      if (fileToCancel?.controller) {
        fileToCancel.controller.abort(); // ✅ cancel upload
        console.log(`Cancelling upload: ${fileToCancel.name}`);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  };

  // ✅ File status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "cancelled":
        return <X className="h-5 w-5 text-gray-500" />;
      default:
        return <File className="h-5 w-5 text-muted-foreground" />;
    }
  };

  // ✅ UI Render
  return (
    <Dialog open={isOpen} onOpenChange={(open) => open || onClose()}>
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
          {!hasUploadPermission ? (
            <div className="border-2 border-dashed rounded-lg p-8 text-center bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <p className="text-lg font-medium mb-2 text-red-700 dark:text-red-400">
                Upload Permission Required
              </p>
              <p className="text-sm text-red-600 dark:text-red-300">
                You don't have permission to upload files. Please contact your administrator to request upload access.
              </p>
            </div>
          ) : (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${isDragOver
                  ? "border-panel bg-panel/5"
                  : "border-muted-foreground/25 hover:border-panel/50"
                }`}
              onDragOver={hasUploadPermission ? handleDragOver : undefined}
              onDragLeave={hasUploadPermission ? handleDragLeave : undefined}
              onDrop={hasUploadPermission ? handleDrop : undefined}
              onClick={hasUploadPermission ? () => fileInputRef.current?.click() : undefined}
            >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-muted-foreground">
              Support for multiple file uploads. Select multiple files at once for faster batch processing.
            </p>
            <p className="text-xs text-muted-foreground mt-3">
              Allowed file types: JPG, PNG, PDF, DOCX, TXT <br />
              Maximum size per file: 50 MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
              disabled={!hasUploadPermission}
            />
          </div>
          )}

          {/* Upload Progress */}
          {uploadingFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">
                  Upload Progress (
                  {
                    uploadingFiles.filter((f) => f.status === "completed")
                      .length
                  }
                  /{uploadingFiles.length} completed)
                </h3>
                <div className="flex gap-2">
                  {uploadingFiles.some((f) => f.status === "completed" || f.status === "cancelled") && (
                    <Button variant="ghost" size="sm" onClick={clearCompletedUploads}>
                      Clear completed
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {uploadingFiles.map((file) => (
                  <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">{getStatusIcon(file.status)}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)} •{" "}
                          {file.file?.type?.split("/")[1]?.toUpperCase() ||
                            "UNKNOWN"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Progress
                          value={file.progress}
                          className={`flex-1 h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 ${file.status === "error"
                              ? "[&>div]:bg-red-500"
                              : file.status === "completed"
                                ? "[&>div]:bg-green-500"
                                : file.status === "cancelled"
                                  ? "[&>div]:bg-gray-500"
                                  : "[&>div]:bg-blue-500"
                            }`}
                        />
                        <span className="text-xs min-w-0">
                          {file.status === "error"
                            ? "Failed"
                            : file.status === "completed"
                              ? "Done"
                              : file.status === "cancelled"
                                ? "Cancelled"
                                : `${Math.round(file.progress)}%`}
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

                      {file.status === "error" && (
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
        {/* <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div> */}
      </DialogContent>
    </Dialog>
  );
}