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
import { trashService } from "../../services/trashservice";

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
  const [emptyTrashLoading, setEmptyTrashLoading] = useState(false);

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

  // ✅ Updated to use bulkPermanentDelete for single file deletion
  const handlePermanentDelete = async (fileId) => {
    if (
      !window.confirm("Are you sure you want to permanently delete this file?")
    )
      return;
    
    try {
      // Use bulkPermanentDelete with single file ID
      const response = await trashService.bulkPermanentDelete([fileId]);
      
      if (response.success || response.original?.status === "ok") {
        loadTrashedFiles();
        const successMessage = response.original?.message || response.message || "File permanently deleted";
        toast.success(successMessage);
      } else {
        const errorMessage = response.original?.message || response.error || "Failed to delete file";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error deleting file:", error);
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

      if (response.success || response.status === "success" || response.original?.status === "ok") {
        loadTrashedFiles();
        setSelectedFiles(new Set());
        setIsSelectionMode(false);
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

  // ✅ Updated Empty Trash to use bulkPermanentDelete
  const handleEmptyTrash = async () => {
    if (!window.confirm("Empty the trash? This cannot be undone.")) {
      return;
    }

    if (trashedFiles.length === 0) {
      toast.info("Trash is already empty");
      return;
    }

    setEmptyTrashLoading(true);
    try {
      // Get all file IDs and use bulkPermanentDelete
      const allFileIds = trashedFiles.map(file => file.id);
      const response = await trashService.bulkPermanentDelete(allFileIds);

      if (response.success || response.original?.status === "ok") {
        loadTrashedFiles(); // Refresh the list
        const successMessage = response.original?.message || response.message || "Trash emptied successfully";
        toast.success(successMessage);
      } else {
        const errorMessage = response.original?.message || response.error || "Failed to empty trash";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error emptying trash:", error);
      toast.error("Error emptying trash");
    } finally {
      setEmptyTrashLoading(false);
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
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        {/* Single ring loader */}
        <div className="w-10 h-10 border-4 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin"></div>

        {/* Loader text */}
        <div className="text-center text-muted-foreground font-medium tracking-wide">
          Loading Trashed files...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        

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
            {/* ✅ Fixed Table Headers - Using proper grid structure */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl mb-4 px-6 py-4 border border-gray-200 dark:border-gray-600">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-4">
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
                  {/* ✅ Updated Empty Trash button */}
                  <Button
                    onClick={handleEmptyTrash}
                    disabled={emptyTrashLoading}
                    variant="destructive"
                    size="sm"
                    className="rounded-full px-6"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> 
                    {emptyTrashLoading ? "Emptying..." : "Empty Trash"}
                  </Button>
                </>
              )
            )}
          </div>
        </div>
              <div className="hidden sm:grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700 dark:text-gray-300 items-center">
                {/* Selection + Name Column - 6 cols */}
                <div className="col-span-6 flex items-center gap-2">
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
                
                {/* Owner Column - 2 cols */}
                <div className="col-span-2 hidden md:block">Owner</div>
                
                {/* File Size Column - 2 cols */}
                <div className="col-span-2 hidden lg:block">File Size</div>
                
                {/* Actions Column - 2 cols */}
                <div className="col-span-2 text-right">Actions</div>
              </div>
            </div>

            {/* ✅ Fixed File List - Matching grid structure */}
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
                    animation: "fadeInUp 0.5s ease-out forwards",
                  }}
                  onClick={() => isSelectionMode && toggleFileSelection(file.id)}
                >
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative px-6 py-4">
                    {/* ✅ Desktop Grid Layout - Fixed column alignment */}
                    <div className="hidden sm:grid grid-cols-12 gap-4 text-sm items-center">
                      {/* Name Column - 6 cols (same as header) */}
                      <div className="col-span-6 flex items-center min-w-0">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          {isSelectionMode && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFileSelection(file.id);
                              }}
                              className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                            >
                              {selectedFiles.has(file.id) ? (
                                <CheckSquare className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Square className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          )}
                          <div className="flex-shrink-0">{getFileIcon(file.type)}</div>
                          <span 
                            className="text-foreground font-medium group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors duration-200 min-w-0 flex-1"
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              wordBreak: 'break-all',
                              lineHeight: '1.4'
                            }}
                            title={file.name}
                          >
                            {file.name}
                          </span>
                        </div>
                      </div>

                      {/* Owner Column - 2 cols (same as header) */}
                      <div className="col-span-2 text-muted-foreground font-medium hidden md:block">
                        <span className="truncate block" title={file.user_id}>
                          {file.user_id}
                        </span>
                      </div>

                      {/* File Size Column - 2 cols (same as header) */}
                      <div className="col-span-2 hidden lg:block">
                        <span className="text-muted-foreground font-mono text-xs bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md inline-block">
                          {file.size}
                        </span>
                      </div>

                      {/* Actions Column - 2 cols (same as header) */}
                      <div className="col-span-2 flex items-center justify-end gap-2">
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

                    {/* ✅ Mobile Layout */}
                    <div className="sm:hidden flex flex-col space-y-3">
                      {/* Top Row: Icon + Name */}
                      <div className="flex items-start space-x-3">
                        {isSelectionMode && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFileSelection(file.id);
                            }}
                            className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors mt-1"
                          >
                            {selectedFiles.has(file.id) ? (
                              <CheckSquare className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                        )}
                        <div className="flex-shrink-0 mt-1">{getFileIcon(file.type)}</div>
                        <span 
                          className="text-foreground font-medium flex-1 min-w-0"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            wordBreak: 'break-all',
                            lineHeight: '1.4'
                          }}
                          title={file.name}
                        >
                          {file.name}
                        </span>
                      </div>

                      {/* Info Row */}
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>By {file.user_id}</span>
                        <span>{file.size}</span>
                      </div>

                      {/* Actions Row */}
                      <div className="flex justify-end gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestoreFile(file.id);
                          }}
                          className="h-10 w-10 p-0 rounded-full hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400"
                        >
                          <RotateCcw className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePermanentDelete(file.id);
                          }}
                          className="h-10 w-10 p-0 rounded-full hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
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