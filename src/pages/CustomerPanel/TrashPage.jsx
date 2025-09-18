import { useState, useEffect, useCallback } from "react";
import {
  Trash2,
  RotateCcw,
  X,
  FileText,
  Archive,
  Image,
  Video,
  File,
  CheckSquare,
  Square,
  Folder,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trashService } from "@/services/trashService";

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

export default function TrashPage() {
  const [trashedFiles, setTrashedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  useEffect(() => {
    loadTrashedFiles();
  }, []);

  const loadTrashedFiles = async () => {
    setLoading(true);
    try {
      const response = await trashService.getTrashedFiles();
      console.log("Trashed files response:", response);

      if (response.status === "ok" && Array.isArray(response.data)) {
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
      const response = await trashService.restoreFile(fileId);

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

  const handleBulkRestore = async () => {
    if (selectedFiles.size === 0) {
      toast.error("Please select files to restore");
      return;
    }

    setBulkLoading(true);
    try {
      const fileIds = Array.from(selectedFiles);
      const response = await trashService.bulkRestoreFiles(fileIds);

      // Fix: Check for the correct response structure
      if (response.success || response.status === "success" || response.original?.status === "ok") {
        loadTrashedFiles();
        setSelectedFiles(new Set());
        setIsSelectionMode(false);
        // Use the message from the nested original object if available
        const successMessage = response.original?.message || response.message || `${fileIds.length} file(s) restored successfully`;
        toast.success(successMessage);
      } else {
        const errorMessage = response.original?.message || response.error || "Failed to restore files";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error in bulk restore:", error);
      toast.error("Error restoring files");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) {
      toast.error("Please select files to delete");
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete ${selectedFiles.size} selected file(s)? This cannot be undone.`)) {
      return;
    }

    setBulkDeleteLoading(true);
    try {
      const fileIds = Array.from(selectedFiles);
      const response = await trashService.bulkPermanentDelete(fileIds);

      if (response.success || response.status === "success" || response.original?.status === "ok") {
        loadTrashedFiles();
        setSelectedFiles(new Set());
        setIsSelectionMode(false);
        const successMessage = response.original?.message || response.message || `${fileIds.length} file(s) permanently deleted`;
        toast.success(successMessage);
      } else {
        const errorMessage = response.original?.message || response.error || "Failed to delete files";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error in bulk delete:", error);
      toast.error("Error deleting files");
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  const toggleFileSelection = useCallback((fileId) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedFiles.size === trashedFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(trashedFiles.map(f => f.id)));
    }
  }, [selectedFiles.size, trashedFiles]);

  const enterSelectionMode = () => {
    setIsSelectionMode(true);
    setSelectedFiles(new Set());
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedFiles(new Set());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-pink-400 rounded-full animate-spin" style={{animationDirection: 'reverse'}}></div>
            </div>
            <span className="ml-4 text-lg text-gray-600 dark:text-gray-300">Loading trashed files...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Trash2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trash</h1>
              <p className="text-gray-600 dark:text-gray-300">
                {trashedFiles.length > 0 ? `${trashedFiles.length} files in trash` : "Manage your deleted files"}
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {isSelectionMode ? (
              <>
                <div className="text-sm text-gray-600 dark:text-gray-300 px-3 py-2 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
                  {selectedFiles.size} selected
                </div>
                <Button
                  onClick={handleBulkRestore}
                  disabled={selectedFiles.size === 0 || bulkLoading}
                  variant="outline"
                  size="sm"
                  className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300 rounded-full px-6"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {bulkLoading ? "Restoring..." : "Restore Selected"}
                </Button>
                <Button
                  onClick={handleBulkDelete}
                  disabled={selectedFiles.size === 0 || bulkDeleteLoading}
                  variant="destructive"
                  size="sm"
                  className="rounded-full px-6"
                >
                  <X className="w-4 h-4 mr-2" />
                  {bulkDeleteLoading ? "Deleting..." : "Delete Selected"}
                </Button>
                <Button
                  onClick={exitSelectionMode}
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                >
                  Cancel
                </Button>
              </>
            ) : (
              trashedFiles.length > 0 && (
                <>
                  <Button
                    onClick={enterSelectionMode}
                    variant="outline"
                    size="sm"
                    className="rounded-full px-6"
                  >
                    Select Files
                  </Button>
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
                    className="rounded-full px-6"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> 
                    Empty Trash
                  </Button>
                </>
              )
            )}
          </div>
        </div>

        {trashedFiles.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative inline-flex items-center justify-center w-24 h-24 mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-500 rounded-full opacity-20 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-red-400 to-pink-500 rounded-2xl p-6 shadow-xl">
                <Trash2 className="h-12 w-12 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Trash is empty</h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              Files you delete will appear here before being permanently removed.
            </p>
          </div>
        ) : (
          <div className="w-full">
            {/* Table Headers */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl mb-4 px-6 py-4 border border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-12 lg:grid-cols-6 gap-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <div className="col-span-6 lg:col-span-1 flex items-center gap-2">
                  {isSelectionMode && (
                    <button
                      onClick={toggleSelectAll}
                      className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-colors"
                      title={selectedFiles.size === trashedFiles.length ? "Deselect All" : "Select All"}
                    >
                      {selectedFiles.size === trashedFiles.length ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  )}
                  <FileText className="w-4 h-4 mr-2 text-blue-500" />
                  Name
                </div>
                <div className="col-span-3 lg:col-span-1 hidden sm:block"></div>
                <div className="col-span-3 lg:col-span-1 hidden md:block">Owner</div>
                <div className="col-span-3 lg:col-span-1 hidden lg:block">File Size</div>
                <div className="col-span-3 lg:col-span-2 text-right">Actions</div>
              </div>
            </div>

            {/* File List */}
            <div className="space-y-3">
              {trashedFiles.map((file, index) => (
                <div
                  key={file.id}
                  className={`relative bg-white dark:bg-gray-900 rounded-xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group overflow-hidden ${
                    isSelectionMode && selectedFiles.has(file.id)
                      ? "border-blue-400 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-md"
                      : "border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600"
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: 'fadeInUp 0.5s ease-out forwards'
                  }}
                  onClick={() => isSelectionMode && toggleFileSelection(file.id)}
                >
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative px-6 py-4">
                    <div className="grid grid-cols-12 lg:grid-cols-6 gap-4 text-sm items-center">
                      {/* File Name */}
                      <div className="col-span-6 lg:col-span-1 flex items-center min-w-0">
                        <div className="flex items-center space-x-3">
                          {isSelectionMode && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFileSelection(file.id);
                              }}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                            >
                              {selectedFiles.has(file.id) ? (
                                <CheckSquare className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Square className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          )}
                          <div className="flex-shrink-0">
                            {getFileIcon(file.type)}
                          </div>
                          <span className="text-foreground font-medium truncate group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors duration-200">
                            {file.name}
                          </span>
                        </div>
                      </div>

                      {/* Owner - Hidden on mobile */}
                      <div className="col-span-3 lg:col-span-1 text-muted-foreground font-medium hidden sm:block truncate">
                      </div>

                      {/* Deleted Date - Hidden on mobile and tablet */}
                      <div className="col-span-3 lg:col-span-1 text-muted-foreground hidden md:block">
                        {file.user_id}
                      </div>

                      {/* Size - Hidden on mobile, tablet, and small desktop */}
                      <div className="col-span-3 lg:col-span-1 hidden lg:block">
                        <span className="text-muted-foreground font-mono text-xs bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md inline-block">
                          {file.size}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="col-span-6 lg:col-span-2 flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestoreFile(file.id);
                          }}
                          className="h-9 w-9 p-0 rounded-full hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400 transition-all duration-200 hover:scale-110"
                          title="Restore"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePermanentDelete(file.id);
                          }}
                          className="h-9 w-9 p-0 rounded-full hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all duration-200 hover:scale-110"
                          title="Delete Permanently"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Mobile Info Row - Only visible on small screens */}
                    <div className="sm:hidden mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>By {file.user_id}</span>
                        <span>Deleted {file.deleted_at}</span>
                        <span className="font-mono bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                          {file.size}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom border accent */}
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r transition-transform duration-300 origin-left ${
                    selectedFiles.has(file.id) 
                      ? 'from-blue-500 to-purple-500 scale-x-100' 
                      : 'from-red-500 to-pink-500 scale-x-0 group-hover:scale-x-100'
                  }`}></div>
                </div>
              ))}
            </div>
          </div>
        )}
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
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-reverse {
          animation-direction: reverse;
        }
      `}</style>
    </div>
  );
}