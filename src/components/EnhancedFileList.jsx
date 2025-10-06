import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MoreHorizontal,
  Star,
  Download,
  Trash2,
  Share2,
  FileText,
  Image,
  Video,
  Archive,
  Folder,
  ArrowRightLeft,
  Edit,
  Plus,
  Upload,
  FolderPlus,
  RefreshCw,
  Grid,
  List,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { fileApi } from "../services/FileService";
import { toast } from "sonner";
import MoveFileModal from "./MoveFileModal";
import FileUploadModal from "./FileUploadModal";
import NewFolderModal from "./NewFolderModal";
import { starService } from "../services/Starredservice";
import { trashService } from "../services/trashservice";
import EmptyState from "@/components/ui/EmptyState";

export default function EnhancedFileList({ searchQuery, onRefresh }) {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [allFiles, setAllFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [selectedFileForMove, setSelectedFileForMove] = useState(null);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [selectedItemForRename, setSelectedItemForRename] = useState(null);
  const [newName, setNewName] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [movingStatus, setMovingStatus] = useState({});
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderHierarchy, setFolderHierarchy] = useState(new Map());

  // ADD THESE TWO LINES:
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [searchDebounceTimer, setSearchDebounceTimer] = useState(null);
  // Mobile-specific state
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [selectedItemForActions, setSelectedItemForActions] = useState(null);

  const [actionLoading, setActionLoading] = useState({
    starring: {},
    downloading: {},
    trashing: {},
    refreshing: false
  });

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Load files function with enhanced folder details extraction
  const loadFiles = useCallback(async (searchQuery = '') => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery && searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      const response = await fileApi.listFiles(
        searchQuery ? null : folderId,
        params
      );
      if (response.status === 'ok' && Array.isArray(response.data)) {
        let filesData = response.data;

        setAllFiles(filesData);

        const hierarchyMap = new Map();
        filesData.forEach(item => {
          if (item.type === 'folder') {
            hierarchyMap.set(item.id, {
              id: item.id,
              name: item.name,
              parentId: item.parent_id,
              type: item.type
            });
          }
        });
        setFolderHierarchy(hierarchyMap);

        if (!folderId) {
          const existingIds = new Set(filesData.map(item => item.id));
          filesData = filesData.filter(item => !existingIds.has(item.parent_id));
        } else {
          filesData = filesData.filter(item =>
            item.parent_id && item.parent_id.toString() === folderId
          );
        }

        if (folderId && hierarchyMap.has(parseInt(folderId))) {
          const folderInfo = hierarchyMap.get(parseInt(folderId));
          setCurrentFolder(folderInfo);
        } else if (folderId) {
          const childItem = response.data.find(item => item.parent_id && item.parent_id.toString() === folderId);
          if (childItem) {
            setCurrentFolder({
              id: parseInt(folderId),
              name: `Folder ${folderId}`,
              parentId: null,
              type: 'folder'
            });
          }
        } else {
          setCurrentFolder(null);
        }

        setFiles(filesData);

        if (folderId && currentFolder) {
          window.dispatchEvent(new CustomEvent("folderDetailsLoaded", {
            detail: {
              folderId: parseInt(folderId),
              folderInfo: hierarchyMap.get(parseInt(folderId)),
              hierarchy: hierarchyMap
            }
          }));
        }

      } else if (Array.isArray(response)) {
        let filesData = response;
        setAllFiles(filesData);

        if (!folderId) {
          const existingIds = new Set(filesData.map(item => item.id));
          filesData = filesData.filter(item => !existingIds.has(item.parent_id));
        } else {
          filesData = filesData.filter(item =>
            item.parent_id && item.parent_id.toString() === folderId
          );
        }

        setFiles(filesData);
      } else {
        console.error("API response is not in expected format:", response);
        setFiles([]);
        setAllFiles([]);
        toast.error("Received an unexpected response from the server.");
      }

    } catch (error) {
      console.error("Error loading files:", error);
      toast.error("Error loading files");
    } finally {
      setLoading(false);
    }
  }, [folderId, currentFolder]);

  const buildFolderPath = useCallback((folderId, hierarchy = folderHierarchy) => {
    const path = [];
    let currentId = folderId;

    while (currentId && hierarchy.has(currentId)) {
      const folder = hierarchy.get(currentId);
      path.unshift({
        id: folder.id,
        name: folder.name,
        path: `/folder/${folder.id}`
      });
      currentId = folder.parentId;
    }

    return path;
  }, [folderHierarchy]);

  // Fixed getFilteredFiles function with proper global search

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  useEffect(() => {
    const handleFileUploaded = () => loadFiles();
    const handleFolderCreated = () => loadFiles();
    const handleFilesMoved = () => loadFiles();
    const handleRefreshFileList = () => {
      console.log('Refreshing file list...');
      loadFiles();
    };

    // Fixed global search event handler
    const handleGlobalSearch = (event) => {
      console.log('Global search triggered:', event.detail);
      const { query } = event.detail || {};

      // Clear existing timer
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }

      // Set active search query immediately for UI update
      setActiveSearchQuery(query || '');

      // Debounce the actual API call
      const timer = setTimeout(() => {
        loadFiles(query || '');
      }, 500);

      setSearchDebounceTimer(timer);
    };

    window.addEventListener("fileUploaded", handleFileUploaded);
    window.addEventListener("folderCreated", handleFolderCreated);
    window.addEventListener("filesMoved", handleFilesMoved);
    window.addEventListener("refreshFileList", handleRefreshFileList);
    window.addEventListener("globalSearch", handleGlobalSearch);

    return () => {
      window.removeEventListener("fileUploaded", handleFileUploaded);
      window.removeEventListener("folderCreated", handleFolderCreated);
      window.removeEventListener("filesMoved", handleFilesMoved);
      window.removeEventListener("refreshFileList", handleRefreshFileList);
      window.removeEventListener("globalSearch", handleGlobalSearch);
    };
  }, [loadFiles]);

  const getFileTypeFromItem = (item) => {
    if (item.type === 'folder') {
      return 'folder';
    }

    const filename = item.name;
    const extension = filename.toLowerCase().split('.').pop();

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const videoExtensions = ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv'];
    const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
    const archiveExtensions = ['zip', 'rar', '7z', 'tar', 'gz'];

    if (imageExtensions.includes(extension)) return 'image';
    if (videoExtensions.includes(extension)) return 'video';
    if (documentExtensions.includes(extension)) return 'document';
    if (archiveExtensions.includes(extension)) return 'zip';

    return 'document';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';

    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';

    const date = new Date(dateString);
    if (isMobile) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getCurrentFolder = () => {
    if (!folderId) {
      return {
        id: null,
        name: "My Files",
        path: "/",
        fullPath: "My Files"
      };
    }

    if (currentFolder) {
      const folderPath = buildFolderPath(currentFolder.id);
      const fullPath = ['My Files', ...folderPath.map(p => p.name)].join(' / ');

      return {
        id: currentFolder.id,
        name: currentFolder.name,
        path: `/folder/${currentFolder.id}`,
        fullPath: fullPath
      };
    }

    return {
      id: parseInt(folderId),
      name: `Folder ${folderId}`,
      path: `/folder/${folderId}`,
      fullPath: `My Files / Folder ${folderId}`
    };
  };

  const filteredFiles = files;

  const getFileIcon = (type) => {
    switch (type) {
      case "document":
        return <FileText className="w-4 h-4 text-blue-500" />;
      case "image":
        return <Image className="w-4 h-4 text-green-500" />;
      case "video":
        return <Video className="w-4 h-4 text-purple-500" />;
      case "zip":
        return <Archive className="w-4 h-4 text-orange-500" />;
      case "folder":
        return <Folder className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleItemClick = (item) => {
    if (item.type === 'folder') {
      navigate(`/folder/${item.id}`);
    } else if (!isMobile) {
      handleDownloadFile(item.id, item.name);
    }
  };

  const handleMobileItemClick = (item, e) => {
    e.stopPropagation();
    if (item.type === 'folder') {
      navigate(`/folder/${item.id}`);
    } else {
      setSelectedItemForActions(item);
      setShowMobileActions(true);
    }
  };

  const handleStarFile = async (fileId) => {
    setActionLoading(prev => ({
      ...prev,
      starring: { ...prev.starring, [fileId]: true }
    }));

    try {
      const response = await starService.toggleStar(fileId);
      if (response.status === "ok") {
        toast.success(response.message || "File starred");
        loadFiles();
      } else {
        toast.error(response.message || "Failed to star file");
      }
    } catch (error) {
      console.error("Error starring file:", error);
      toast.error("Error starring file");
    } finally {
      setActionLoading(prev => ({
        ...prev,
        starring: { ...prev.starring, [fileId]: false }
      }));
    }
  };

  const handleDownloadFile = async (fileId, fileName) => {
    setActionLoading(prev => ({
      ...prev,
      downloading: { ...prev.downloading, [fileId]: true }
    }));

    try {
      const response = await fileApi.getDownloadUrl(fileId);

      if (response && (response.success || response.download_url || response.url)) {
        const downloadUrl = response.download_url || response.url || response.data?.download_url || response.data?.url;

        if (downloadUrl) {
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast.success(`Downloaded ${fileName}`);
        } else {
          console.error("No download URL found in response:", response);
          toast.error("Download URL not available");
        }
      } else {
        console.error("Invalid response format:", response);
        toast.error("Failed to get download URL");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Error downloading file");
    } finally {
      setActionLoading(prev => ({
        ...prev,
        downloading: { ...prev.downloading, [fileId]: false }
      }));
    }

    if (isMobile) {
      setShowMobileActions(false);
    }
  };

  const handleMoveFile = (fileId, fileName) => {
    setSelectedFileForMove({ id: fileId, name: fileName });
    setMoveModalOpen(true);
    if (isMobile) {
      setShowMobileActions(false);
    }
  };

  const handleRenameItem = (item) => {
    setSelectedItemForRename(item);
    setNewName(item.name);
    setRenameModalOpen(true);
    if (isMobile) {
      setShowMobileActions(false);
    }
  };

  const handleRenameSubmit = async () => {
    if (!selectedItemForRename || !newName.trim()) {
      toast.error("Please enter a valid name");
      return;
    }

    setRenaming(true);
    try {
      const response = await fileApi.renameItem(selectedItemForRename.id, newName.trim());
      if (response.status === 'ok') {
        toast.success(`${selectedItemForRename.type === 'folder' ? 'Folder' : 'File'} renamed successfully`);
        setRenameModalOpen(false);
        setSelectedItemForRename(null);
        setNewName("");
        loadFiles();
        window.dispatchEvent(new CustomEvent("refreshSidebar"));
      } else {
        toast.error("Failed to rename item");
      }
    } catch (error) {
      console.error("Error renaming item:", error);
      toast.error("Error renaming item");
    } finally {
      setRenaming(false);
    }
  };

  const handleRefresh = async () => {
    setActionLoading(prev => ({ ...prev, refreshing: true }));
    try {
      await loadFiles();
      toast.success("Files refreshed");
    } catch (error) {
      toast.error("Error refreshing files");
    } finally {
      setActionLoading(prev => ({ ...prev, refreshing: false }));
    }
  };

  const handleTrashFile = async (fileId) => {
    setActionLoading((prev) => ({
      ...prev,
      trashing: { ...prev.trashing, [fileId]: true },
    }));

    try {
      const response = await trashService.moveToTrash(fileId);

      if (response.success) {
        toast.success(response.message);
        loadFiles();
        window.dispatchEvent(new CustomEvent("refreshSidebar"));
      } else {
        toast.error(response.message || "Failed to move file to trash");
      }
    } catch (error) {
      console.error("❌ Error moving file to trash:", error);
      toast.error("Error moving file to trash");
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        trashing: { ...prev.trashing, [fileId]: false },
      }));
    }

    if (isMobile) {
      setShowMobileActions(false);
    }
  };

  const handleDragStart = (e, fileId) => {
    if (isMobile) return; // Disable drag on mobile
    e.dataTransfer.setData("text/plain", fileId);
  };

  const handleDragOver = (e) => {
    if (isMobile) return;
    e.preventDefault();
  };

  const handleDrop = async (e, targetFolderId) => {
    if (isMobile) return;
    e.preventDefault();
    const draggedFileId = e.dataTransfer.getData("text/plain");

    if (draggedFileId && draggedFileId !== targetFolderId.toString()) {
      setMovingStatus(prev => ({ ...prev, [draggedFileId]: true }));

      try {
        const response = await fileApi.moveFile(draggedFileId, targetFolderId);
        if (response.status === 'ok' || response.success) {
          toast.success("File moved successfully");
          loadFiles();
          window.dispatchEvent(new CustomEvent("filesMoved"));
          window.dispatchEvent(new CustomEvent("refreshSidebar"));
        } else {
          toast.error("Failed to move file");
        }
      } catch (error) {
        console.error("Error moving file:", error);
        toast.error("Error moving file");
      } finally {
        setMovingStatus(prev => ({ ...prev, [draggedFileId]: false }));
      }
    }
  };

  const handleFileUploaded = () => {
    loadFiles();
    window.dispatchEvent(new CustomEvent("fileUploaded"));
    window.dispatchEvent(new CustomEvent("refreshSidebar"));
  };

  const handleFolderCreated = async (folderName) => {
    setCreatingFolder(true);
    try {
      const response = await fileApi.createFolder({
        name: folderName,
        parent_id: folderId || null
      });

      if (response.status === 'ok' || response.success) {
        toast.success(`Folder "${folderName}" created successfully!`);
        loadFiles();
        window.dispatchEvent(new CustomEvent("folderCreated"));
        window.dispatchEvent(new CustomEvent("refreshSidebar"));
      } else {
        toast.error("Failed to create folder");
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Error creating folder");
    } finally {
      setCreatingFolder(false);
    }
  };

  // Mobile Card View Component
const MobileCardView = ({ item }) => (
  <Card
    className="hover:shadow-md transition-shadow cursor-pointer"
    onClick={(e) => handleMobileItemClick(item, e)}
    style={{ opacity: movingStatus[item.id] ? 0.5 : 1 }}
  >
    <CardContent className="p-2.5">
      <div className="flex items-start gap-2">
        {/* Icon */}
        <div className="flex-shrink-0">
          {getFileIcon(getFileTypeFromItem(item))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name + Star */}
          <div className="flex items-center gap-1 mb-1">
            <span className="font-medium text-sm line-clamp-1">
              {item.name}
            </span>
            {item.is_starred && (
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-current flex-shrink-0" />
            )}
          </div>

          {/* Date and Size */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <span className="whitespace-nowrap text-[11px]">{formatDate(item.updated_at)}</span>
            {item.type !== 'folder' && (
              <>
                <span className="text-[11px]">•</span>
                <span className="whitespace-nowrap text-[11px]">{formatFileSize(item.size)}</span>
              </>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1">
            {item.is_starred && (
              <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                Starred
              </Badge>
            )}
            {item.is_trashed && (
              <Badge variant="destructive" className="text-[9px] px-1 py-0 h-4">
                Trashed
              </Badge>
            )}
            <Badge variant="outline" className="capitalize text-[9px] px-1 py-0 h-4">
              {item.type}
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-1 flex-shrink-0">
          {item.type === 'file' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadFile(item.id, item.name);
              }}
              disabled={actionLoading.downloading[item.id]}
              className="h-7 w-7 p-0"
            >
              {actionLoading.downloading[item.id] ? (
                <div className="animate-spin rounded-full h-2.5 w-2.5 border-b-2 border-current" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedItemForActions(item);
              setShowMobileActions(true);
            }}
            className="h-7 w-7 p-0"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Moving Status */}
      {movingStatus[item.id] && (
        <div className="mt-1.5 text-[10px] text-muted-foreground">Moving...</div>
      )}
    </CardContent>
  </Card>
);
  return (
    <div className="space-y-4">
      {/* Header with action buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="text-sm text-muted-foreground">
          {activeSearchQuery && activeSearchQuery.trim() !== '' ? (
            <span>
              Showing {filteredFiles.length} results for "{activeSearchQuery}"
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Global Search
              </span>
            </span>
          ) : (
            <span>
              {files.length} items in {getCurrentFolder().name}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* View mode toggle for larger screens */}
          {!isMobile && (
            <div className="flex items-center gap-1 mr-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8 p-0"
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={actionLoading.refreshing}
              className="flex items-center gap-2 text-xs sm:text-sm"
              size={isMobile ? "sm" : "default"}
            >
              {actionLoading.refreshing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 text-xs sm:text-sm"
              size={isMobile ? "sm" : "default"}
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload Files</span>
              <span className="sm:hidden">Upload</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowNewFolderModal(true)}
              className="flex items-center gap-2 text-xs sm:text-sm"
              size={isMobile ? "sm" : "default"}
            >
              <FolderPlus className="w-4 h-4" />
              <span className="hidden sm:inline">New Folder</span>
              <span className="sm:hidden">Folder</span>
            </Button>
          </div>
        </div>
      </div>

      <div className={isMobile ? "" : "rounded-md border"}>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-panel"></div>
          </div>
        ) : (
          <>
            {filteredFiles.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {isMobile ? (
  <div className="space-y-3">
    {filteredFiles.map((item) => (
      <MobileCardView key={item.id} item={item} />
    ))}
  </div>
                ) : (
                  /* Desktop: Toggle between grid and table view */
                  <>
                    {viewMode === 'grid' ? (
                      /* Desktop Grid View */
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 w-full overflow-hidden">


                        {filteredFiles.map((item) => (
                          <Card
                            key={item.id}
                            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 "
                            onClick={() => handleItemClick(item)}
                            style={{ opacity: movingStatus[item.id] ? 0.5 : 1 }}
                          >
                            <CardContent className="p-2 sm:p-3">
                              <div className="flex flex-col items-center sm:items-start text-center sm:text-left justify-between gap-2 w-full">

                                {/* Large colored icon */}
                                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-muted/50">
                                  {(() => {
                                    const fileType = getFileTypeFromItem(item);
                                    switch (fileType) {
                                      case "document":
                                        return <FileText className="w-8 h-8 text-blue-500" />;
                                      case "image":
                                        return <Image className="w-8 h-8 text-green-500" />;
                                      case "video":
                                        return <Video className="w-8 h-8 text-purple-500" />;
                                      case "zip":
                                        return <Archive className="w-8 h-8 text-orange-500" />;
                                      case "folder":
                                        return <Folder className="w-8 h-8 text-red-500" />;
                                      default:
                                        return <FileText className="w-8 h-8 text-gray-500" />;
                                    }
                                  })()}
                                </div>

                                {/* File name */}
                                <div className="w-full">
                                  <div className="flex items-center justify-center gap-1 mb-1">
                                    <span className="font-medium text-sm truncate max-w-full" title={item.name}>
                                      {item.name}
                                    </span>
                                    {item.is_starred && (
                                      <Star className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />
                                    )}
                                  </div>

                                  {/* File details */}
                                  <div className="text-xs text-muted-foreground space-y-1">
                                    <div>{formatDate(item.updated_at)}</div>
                                    {item.type !== 'folder' && (
                                      <div>{formatFileSize(item.size)}</div>
                                    )}
                                  </div>
                                </div>

                                {/* Badges */}
                                <div className="flex flex-wrap gap-1 justify-center">
                                  {item.is_starred && <Badge variant="outline" className="text-xs">Starred</Badge>}
                                  {item.is_trashed && <Badge variant="destructive" className="text-xs">Trashed</Badge>}
                                  <Badge variant="outline" className="capitalize text-xs">
                                    {item.type}
                                  </Badge>
                                </div>

                                {/* Actions */}
                                  <div className="flex items-center justify-center sm:justify-end gap-2 flex-wrap w-full mt-1">

                                  {item.type === 'file' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownloadFile(item.id, item.name);
                                      }}
                                      disabled={actionLoading.downloading[item.id]}
                                      className="h-8 w-8 p-0"
                                    >
                                      {actionLoading.downloading[item.id] ? (
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                                      ) : (
                                        <Download className="w-4 h-4" />
                                      )}
                                    </Button>
                                  )}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <MoreHorizontal className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align="end"
                                      className="w-48 bg-popover border border-border"
                                    >
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleStarFile(item.id);
                                        }}
                                        disabled={actionLoading.starring[item.id]}
                                      >
                                        <Star className="w-4 h-4 mr-2" />
                                        {item.is_starred ? "Unstar" : "Star"}
                                      </DropdownMenuItem>

                                      {item.type === 'file' && (
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownloadFile(item.id, item.name);
                                          }}
                                          disabled={actionLoading.downloading[item.id]}
                                        >
                                          <Download className="w-4 h-4 mr-2" />
                                          Download
                                        </DropdownMenuItem>
                                      )}

                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleTrashFile(item.id);
                                        }}
                                        disabled={actionLoading.trashing[item.id]}
                                        className="text-destructive focus:text-destructive"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Move to Trash
                                      </DropdownMenuItem>

                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleMoveFile(item.id, item.name);
                                        }}
                                      >
                                        <ArrowRightLeft className="w-4 h-4 mr-2" />
                                        Move
                                      </DropdownMenuItem>

                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRenameItem(item);
                                        }}
                                      >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Rename
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>

                                {movingStatus[item.id] && (
                                  <div className="text-xs text-muted-foreground">Moving...</div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      /* Desktop Table View */
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="hidden md:table-cell">Last Modified</TableHead>
                            <TableHead className="hidden sm:table-cell">Size</TableHead>
                            <TableHead className="hidden lg:table-cell">Type</TableHead>
                            <TableHead className="w-12">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredFiles.map((item) => (
                            <TableRow
                              key={item.id}
                              className="hover:bg-muted/50"
                              style={{ opacity: movingStatus[item.id] ? 0.5 : 1 }}
                            >
                              <TableCell>
                                <div
                                  className={`flex items-center gap-2 ${item.type === 'folder'
                                    ? 'cursor-pointer'
                                    : 'cursor-move'
                                    }`}
                                  draggable={item.type !== 'folder' && !isMobile}
                                  onDragStart={(e) => item.type !== 'folder' && handleDragStart(e, item.id)}
                                  onDragOver={item.type === 'folder' ? handleDragOver : undefined}
                                  onDrop={item.type === 'folder' ? (e) => handleDrop(e, item.id) : undefined}
                                  onClick={() => handleItemClick(item)}
                                >
                                  {getFileIcon(getFileTypeFromItem(item))}
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">
                                        {item.name}
                                        {movingStatus[item.id] && (
                                          <span className="ml-2 text-xs text-muted-foreground">Moving...</span>
                                        )}
                                      </span>
                                      {item.is_starred && (
                                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                      )}
                                    </div>
                                    {/* Mobile-only details */}
                                    <div className="md:hidden text-xs text-muted-foreground mt-1">
                                      {formatDate(item.updated_at)}
                                      {item.type !== 'folder' && (
                                        <span className="ml-2">• {formatFileSize(item.size)}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-muted-foreground">
                                {formatDate(item.updated_at)}
                              </TableCell>
                              <TableCell className="hidden sm:table-cell text-muted-foreground">
                                {item.type === 'folder' ? '-' : formatFileSize(item.size)}
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <div className="flex gap-1">
                                  {item.is_starred && <Badge variant="outline">Starred</Badge>}
                                  {item.is_trashed && <Badge variant="destructive">Trashed</Badge>}
                                  <Badge variant="outline" className="capitalize">
                                    {item.type}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  {item.type === 'file' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDownloadFile(item.id, item.name)}
                                      disabled={actionLoading.downloading[item.id]}
                                      className="h-8 w-8 p-0"
                                    >
                                      {actionLoading.downloading[item.id] ? (
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                                      ) : (
                                        <Download className="w-4 h-4" />
                                      )}
                                    </Button>
                                  )}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align="end"
                                      className="w-48 bg-popover border border-border"
                                    >
                                      <DropdownMenuItem
                                        onClick={() => handleStarFile(item.id)}
                                        disabled={actionLoading.starring[item.id]}
                                      >
                                        <Star className="w-4 h-4 mr-2" />
                                        {item.is_starred ? "Unstar" : "Star"}
                                      </DropdownMenuItem>

                                      {item.type === 'file' && (
                                        <DropdownMenuItem
                                          onClick={() => handleDownloadFile(item.id, item.name)}
                                          disabled={actionLoading.downloading[item.id]}
                                        >
                                          <Download className="w-4 h-4 mr-2" />
                                          Download
                                        </DropdownMenuItem>
                                      )}

                                      <DropdownMenuItem
                                        onClick={() => handleTrashFile(item.id)}
                                        disabled={actionLoading.trashing[item.id]}
                                        className="text-destructive focus:text-destructive"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Move to Trash
                                      </DropdownMenuItem>

                                      <DropdownMenuItem
                                        onClick={() => handleMoveFile(item.id, item.name)}
                                      >
                                        <ArrowRightLeft className="w-4 h-4 mr-2" />
                                        Move
                                      </DropdownMenuItem>

                                      <DropdownMenuItem onClick={() => handleRenameItem(item)}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Rename
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Mobile Actions Sheet */}
      <Sheet open={showMobileActions} onOpenChange={setShowMobileActions}>
        <SheetContent side="bottom" className="h-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {selectedItemForActions && getFileIcon(getFileTypeFromItem(selectedItemForActions))}
              {selectedItemForActions?.name}
            </SheetTitle>
            <SheetDescription>
              Choose an action for this {selectedItemForActions?.type}
            </SheetDescription>
          </SheetHeader>

          <div className="grid grid-cols-2 gap-3 mt-6 pb-6">
            <Button
              variant="outline"
              onClick={() => handleStarFile(selectedItemForActions?.id)}
              disabled={actionLoading.starring[selectedItemForActions?.id]}
              className="flex items-center gap-2 h-12"
            >
              <Star className="w-4 h-4" />
              {selectedItemForActions?.is_starred ? "Unstar" : "Star"}
            </Button>

            {selectedItemForActions?.type === 'file' && (
              <Button
                variant="outline"
                onClick={() => handleDownloadFile(selectedItemForActions?.id, selectedItemForActions?.name)}
                disabled={actionLoading.downloading[selectedItemForActions?.id]}
                className="flex items-center gap-2 h-12"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => handleMoveFile(selectedItemForActions?.id, selectedItemForActions?.name)}
              className="flex items-center gap-2 h-12"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Move
            </Button>

            <Button
              variant="outline"
              onClick={() => handleRenameItem(selectedItemForActions)}
              className="flex items-center gap-2 h-12"
            >
              <Edit className="w-4 h-4" />
              Rename
            </Button>

            <Button
              variant="destructive"
              onClick={() => handleTrashFile(selectedItemForActions?.id)}
              disabled={actionLoading.trashing[selectedItemForActions?.id]}
              className="flex items-center gap-2 h-12 col-span-2"
            >
              <Trash2 className="w-4 h-4" />
              Move to Trash
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Rename Modal - Mobile optimized */}
      <Dialog open={renameModalOpen} onOpenChange={setRenameModalOpen}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg">
              Rename {selectedItemForRename?.type === 'folder' ? 'Folder' : 'File'}
            </DialogTitle>
            <DialogDescription>
              Enter a new name for "{selectedItemForRename?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new name..."
              onKeyPress={(e) => e.key === 'Enter' && handleRenameSubmit()}
              className="text-base" // Better for mobile
            />
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setRenameModalOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenameSubmit}
              disabled={renaming}
              className="w-full sm:w-auto"
            >
              {renaming ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Renaming...
                </>
              ) : (
                'Rename'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onFileUploaded={handleFileUploaded}
        currentFolder={getCurrentFolder()}
      />

      <NewFolderModal
        isOpen={showNewFolderModal}
        onClose={() => setShowNewFolderModal(false)}
        onFolderCreated={handleFolderCreated}
        currentPath={getCurrentFolder().fullPath}
        parentId={getCurrentFolder().id}
      />

      {/* Move Modal */}
      {selectedFileForMove && (
        <MoveFileModal
          isOpen={moveModalOpen}
          onClose={() => {
            setMoveModalOpen(false);
            setSelectedFileForMove(null);
          }}
          fileId={selectedFileForMove.id}
          fileName={selectedFileForMove.name}
          onFileMoved={() => {
            loadFiles();
            window.dispatchEvent(new CustomEvent("filesMoved"));
            window.dispatchEvent(new CustomEvent("refreshSidebar"));
          }}
        />
      )}
    </div>
  );
}