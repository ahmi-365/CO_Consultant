import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
  Code,
  PanelLeftClose,
  PanelLeftOpen,
  AlertCircle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const location = useLocation();
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
  const [trashedFileName, setTrashedFileName] = useState("");
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [fileToTrash, setFileToTrash] = useState(null);
  const [showTrashPopup, setShowTrashPopup] = useState(false);
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [duplicateWarning, setDuplicateWarning] = useState("");
  const [isNameValid, setIsNameValid] = useState(false);




  // Tab state
  const [activeTab, setActiveTab] = useState("file-manager");
  const [rootIframeUrl, setRootIframeUrl] = useState(null);

  // IFRAME STATES - MOVED UP BEFORE shouldShowTabs
  const [selectedItemForIframe, setSelectedItemForIframe] = useState(null);
  const [showIframePanel, setShowIframePanel] = useState(true);

  const isRootFolder = true;
  // FileItem.jsx ke top mein, imports ke neeche
  const ADMIN_ROLES = ["admin", "superadmin"];

  function can(item, action, role) {
    if (ADMIN_ROLES.includes(role)) return true;
    if (!item?.permissions) return false;
    return !!item.permissions[action];
  }

  // Determine if we should show tabs - NOW it can access selectedItemForIframe
  const shouldShowTabs = useMemo(
    () => {
      // For root iframe, just check if URL exists (no is_iframe flag check)
      if (selectedItemForIframe?.type === 'root' || selectedItemForIframe?.type === 'iframe') {
        return !!rootIframeUrl;
      }
      // For folders/files, check both URL and is_iframe flag
      return rootIframeUrl && selectedItemForIframe?.is_iframe === true;
    },
    [rootIframeUrl, selectedItemForIframe]
  );
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [searchDebounceTimer, setSearchDebounceTimer] = useState(null);

  // Mobile-specific state
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'grid'
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [selectedItemForActions, setSelectedItemForActions] = useState(null);

  const [actionLoading, setActionLoading] = useState({
    starring: {},
    downloading: {},
    trashing: {},
    refreshing: false,
  });

  const [userPermissions, setUserPermissions] = useState({
    star: false,
    trash: false,
    download: false,
    move: false,
    rename: false,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    console.log("Loaded user permissions from localStorage:", storedUser);

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const perms = Array.isArray(parsedUser.permissions)
          ? parsedUser.permissions
          : [];
        setUserPermissions(perms);
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
      }
    }
  }, []);

  // ✅ Check safely even if permissions not loaded yet
  const canToggleStar =
    Array.isArray(userPermissions) &&
    userPermissions.includes("starred-files.toggle");
  const canTrash =
    Array.isArray(userPermissions) &&
    userPermissions.includes("files.trash");
  const canMove =
    Array.isArray(userPermissions) &&
    userPermissions.includes("files.move");
  const canRename =
    Array.isArray(userPermissions) &&
    userPermissions.includes("files.rename");
  const canDownload =
    Array.isArray(userPermissions) &&
    userPermissions.includes("files.download");

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const loadCurrentFolderIframe = useCallback(async () => {
    try {
      console.log('🎯 Fetching folder metadata for iframe...', folderId);

      // Get all files data
      const response = await fileApi.listFiles(folderId || null);
      console.log('📦 Full API Response:', response);

      // If in root folder (no folderId)
      if (!folderId) {
        // Check for root-level iframe_url in response
        const rootIframe = response.iframe_url;
        if (rootIframe) { // 👈 NO is_iframe check for root
          console.log('✅ Found root iframe (no flag check for root):', rootIframe);
          setRootIframeUrl(rootIframe);
          setSelectedItemForIframe({
            id: 'root-iframe',
            name: 'Root Embedded Content',
            iframe_url: rootIframe,
            type: 'root', // 👈 Changed from 'iframe' to 'root'
            is_iframe: true
          });
          setShowIframePanel(true);
          setActiveTab("embedded-frame");
        } else {
          console.log('❌ No root iframe found');
          setRootIframeUrl(null);
          setShowIframePanel(false);
          setSelectedItemForIframe(null);
          setActiveTab("file-manager");
        }
      } else {
        // For nested folders - find current folder in the data array
        const filesData = response.data || response;
        const currentFolderData = filesData.find(
          item => item.id === parseInt(folderId) && item.type === 'folder'
        );

        console.log('🔍 Looking for folder:', folderId);
        console.log('📁 Found folder data:', currentFolderData);

        if (currentFolderData?.iframe_url && currentFolderData?.is_iframe === true) { // 👈 Add check
          console.log('✅ Found nested folder iframe:', currentFolderData.iframe_url);
          setRootIframeUrl(currentFolderData.iframe_url);
          setSelectedItemForIframe({
            id: currentFolderData.id,
            name: currentFolderData.name,
            iframe_url: currentFolderData.iframe_url,
            is_iframe: true // 👈 Add flag
          });
          setShowIframePanel(true);
          setActiveTab("embedded-frame");
        } else {
          console.log('❌ No iframe found for this folder');
          setRootIframeUrl(null);
          setShowIframePanel(false);
          setSelectedItemForIframe(null);
          setActiveTab("file-manager");
        }
      }
    } catch (error) {
      console.error('❌ Error fetching folder iframe:', error);
      setRootIframeUrl(null);
      setShowIframePanel(false);
      setSelectedItemForIframe(null);
      setActiveTab("file-manager");
    }
  }, [folderId]);

  const getCurrentFolderMetadata = useCallback(async () => {
    try {
      if (!folderId) {
        // Root folder
        const response = await fileApi.listFiles(null);
        return {
          id: 'root',
          name: 'My Files',
          iframe_url: response.iframe_url,
          type: 'root'
        };
      } else {
        // Nested folder - need to fetch parent to get current folder details
        const response = await fileApi.listFiles(null); // Get all files
        const allFiles = response.data || response;

        // Find current folder in all files
        const findFolder = (files, targetId) => {
          for (const file of files) {
            if (file.id === targetId && file.type === 'folder') {
              return file;
            }
          }
          return null;
        };

        const folderData = findFolder(allFiles, parseInt(folderId));
        return folderData;
      }
    } catch (error) {
      console.error('Error getting current folder metadata:', error);
      return null;
    }
  }, [folderId]);
  // Load files function with enhanced folder details extraction
  const loadFiles = useCallback(
    async (searchQuery = "") => {
      try {
        setLoading(true);
        const params = {};
        if (searchQuery && searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        // 🔥 CRITICAL FIX: Always fetch ALL files first to build complete hierarchy
        const allFilesResponse = await fileApi.listFiles(null, {}); // Always get all files
        const allFilesData = allFilesResponse.data || allFilesResponse;
        setAllFiles(allFilesData);

        // Build complete folder hierarchy from ALL files
        const hierarchyMap = new Map();
        allFilesData.forEach((item) => {
          if (item.type === "folder") {
            hierarchyMap.set(item.id, {
              id: item.id,
              name: item.name,
              parentId: item.parent_id,
              type: item.type,
              iframe_url: item.iframe_url,
            });
          }
        });
        setFolderHierarchy(hierarchyMap);

        console.log('📚 Built hierarchy with', hierarchyMap.size, 'folders');
        console.log('🔍 Looking for folder', folderId, ':', hierarchyMap.get(parseInt(folderId)));

        // Now handle search or filtering
        let response;
        if (searchQuery && searchQuery.trim()) {
          // If searching, get search results
          response = await fileApi.listFiles(null, { search: searchQuery.trim() });
        } else {
          // If viewing a specific folder, get its children
          response = await fileApi.listFiles(folderId, {});
        }

        const filesData = response.data || response;

        // Filter files based on folder
        let filteredFiles = filesData;
        if (!folderId) {
          // Root folder - show only root-level items
          const existingIds = new Set(allFilesData.map((item) => item.id));
          filteredFiles = allFilesData.filter(
            (item) => !existingIds.has(item.parent_id)
          );

          // Check for root-level iframe
          if (response.iframe_url) {
            console.log('✅ Root has iframe:', response.iframe_url);
            setRootIframeUrl(response.iframe_url);
            setSelectedItemForIframe({
              id: 'root-iframe',
              name: 'Root Embedded Content',
              iframe_url: response.iframe_url,
              type: 'root',
              is_iframe: true
            });
            setShowIframePanel(true);
          } else {
            setRootIframeUrl(null);
            setShowIframePanel(false);
            setSelectedItemForIframe(null);
          }
        } else {
          // Nested folder - filter children
          filteredFiles = filesData.filter(
            (item) => item.parent_id && item.parent_id.toString() === folderId
          );

          // Get current folder metadata from hierarchy
          const currentFolderData = hierarchyMap.get(parseInt(folderId));

          if (currentFolderData) {
            console.log('📁 Found folder in hierarchy:', currentFolderData);

            // Set as current folder
            setCurrentFolder(currentFolderData);

            // Check for iframe
            if (currentFolderData.iframe_url && currentFolderData.is_iframe === true) {
              console.log('✅ Folder has iframe:', currentFolderData.iframe_url);
              setRootIframeUrl(currentFolderData.iframe_url);
              setSelectedItemForIframe({
                id: currentFolderData.id,
                name: currentFolderData.name,
                iframe_url: currentFolderData.iframe_url,
                type: 'folder',
                is_iframe: true
              });
              setShowIframePanel(true);
            } else {
              console.log('❌ Folder has no iframe');
              setRootIframeUrl(null);
              setShowIframePanel(false);
              setSelectedItemForIframe(null);
            }
          } else {
            console.log('⚠️ Folder not found in hierarchy');
            setCurrentFolder(null);
            setRootIframeUrl(null);
            setShowIframePanel(false);
            setSelectedItemForIframe(null);
          }
        }

        setFiles(filteredFiles);

      } catch (error) {
        console.error("Error loading files:", error);
        toast.error("Error loading files");
        setFiles([]);
        setAllFiles([]);
      } finally {
        setLoading(false);
      }
    },
    [folderId]
  );

  // useEffect(() => {
  //   loadCurrentFolderIframe();
  // }, [folderId, location.pathname, loadCurrentFolderIframe]);
  const extractSrcFromIframe = (iframeCode) => {
    if (!iframeCode) return "";

    // If it's already a URL, return it
    if (iframeCode.startsWith("http")) {
      return iframeCode;
    }

    // Extract src from iframe tag
    const srcMatch = iframeCode.match(/src="([^"]*)"/);
    return srcMatch ? srcMatch[1] : iframeCode;
  };

  const handleIframeClick = (item) => {
    // Root items don't need is_iframe check
    if (item.type === 'root' || item.type === 'iframe') {
      if (item.iframe_url) {
        setSelectedItemForIframe(item);
        setActiveTab("embedded-frame");
      }
    } else {
      // For folders/files, check is_iframe flag
      if (item.iframe_url && item.is_iframe === true) {
        setSelectedItemForIframe(item);
        setActiveTab("embedded-frame");
      }
    }
  };

  const getPreviewUrl = () => {
    if (!selectedItemForIframe?.iframe_url) return rootIframeUrl || "";
    return extractSrcFromIframe(selectedItemForIframe.iframe_url);
  };

  const buildFolderPath = useCallback(
    (folderId, hierarchy = folderHierarchy) => {
      const path = [];
      let currentId = folderId;

      while (currentId && hierarchy.has(currentId)) {
        const folder = hierarchy.get(currentId);
        path.unshift({
          id: folder.id,
          name: folder.name,
          path: `/folder/${folder.id}`,
        });
        currentId = folder.parentId;
      }

      return path;
    },
    [folderHierarchy]
  );

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  useEffect(() => {
    const handleFileUploaded = () => loadFiles();
    const handleFilesMoved = () => loadFiles();
    const handleRefreshFileList = () => {
      console.log("Refreshing file list...");
      loadFiles();
    };

    // Fixed global search event handler
    const handleGlobalSearch = (event) => {
      console.log("Global search triggered:", event.detail);
      const { query } = event.detail || {};

      // Clear existing timer
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }

      // Set active search query immediately for UI update
      setActiveSearchQuery(query || "");

      // Debounce the actual API call
      const timer = setTimeout(() => {
        loadFiles(query || "");
      }, 500);

      setSearchDebounceTimer(timer);
    };

    window.addEventListener("fileUploaded", handleFileUploaded);
    window.addEventListener("filesMoved", handleFilesMoved);
    window.addEventListener("refreshFileList", handleRefreshFileList);
    window.addEventListener("globalSearch", handleGlobalSearch);

    return () => {
      window.removeEventListener("fileUploaded", handleFileUploaded);
      window.removeEventListener("filesMoved", handleFilesMoved);
      window.removeEventListener("refreshFileList", handleRefreshFileList);
      window.removeEventListener("globalSearch", handleGlobalSearch);
    };
  }, [loadFiles]);

  const getFileTypeFromItem = (item) => {
    if (item.type === "folder") {
      return "folder";
    }

    const filename = item.name;
    const extension = filename.toLowerCase().split(".").pop();

    const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
    const videoExtensions = ["mp4", "avi", "mkv", "mov", "wmv", "flv"];
    const documentExtensions = ["pdf", "doc", "docx", "txt", "rtf"];
    const archiveExtensions = ["zip", "rar", "7z", "tar", "gz"];

    if (imageExtensions.includes(extension)) return "image";
    if (videoExtensions.includes(extension)) return "video";
    if (documentExtensions.includes(extension)) return "document";
    if (archiveExtensions.includes(extension)) return "zip";

    return "document";
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";

    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";

    const date = new Date(dateString);
    if (isMobile) {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const getCurrentFolder = () => {
    if (!folderId) {
      return {
        id: null,
        name: "My Files",
        path: "/",
        fullPath: "My Files",
      };
    }

    const parsedFolderId = parseInt(folderId);

    // ✅ FIRST: Check folderHierarchy Map (most reliable)
    if (folderHierarchy.has(parsedFolderId)) {
      const folderInfo = folderHierarchy.get(parsedFolderId);
      const folderPath = buildFolderPath(parsedFolderId);
      const fullPath = ["My Files", ...folderPath.map((p) => p.name)].join(" / ");

      return {
        id: folderInfo.id,
        name: folderInfo.name, // ✅ "File one" from hierarchy
        path: `/folder/${folderInfo.id}`,
        fullPath: fullPath,
      };
    }

    // ✅ SECOND: Check currentFolder state
    if (currentFolder && currentFolder.id === parsedFolderId) {
      const folderPath = buildFolderPath(currentFolder.id);
      const fullPath = ["My Files", ...folderPath.map((p) => p.name)].join(" / ");

      return {
        id: currentFolder.id,
        name: currentFolder.name, // ✅ Should have "File one"
        path: `/folder/${currentFolder.id}`,
        fullPath: fullPath,
      };
    }

    // ✅ THIRD: Search in allFiles array for the folder itself
    const folderItem = allFiles.find(
      (item) => item.id === parsedFolderId && item.type === 'folder'
    );

    if (folderItem) {
      const folderPath = buildFolderPath(parsedFolderId);
      const fullPath = ["My Files", ...folderPath.map((p) => p.name)].join(" / ");

      return {
        id: parsedFolderId,
        name: folderItem.name, // ✅ "File one" from API
        path: `/folder/${parsedFolderId}`,
        fullPath: fullPath.length > "My Files".length ? fullPath : `My Files / ${folderItem.name}`,
      };
    }

    // ✅ FOURTH: Fallback - search for any item with this ID
    const anyItem = allFiles.find(item => item.id === parsedFolderId);
    if (anyItem) {
      return {
        id: parsedFolderId,
        name: anyItem.name || `Folder ${folderId}`, // ✅ Use API name
        path: `/folder/${parsedFolderId}`,
        fullPath: `My Files / ${anyItem.name || `Folder ${folderId}`}`,
      };
    }

    // ✅ Last resort fallback (only if API data is missing)
    return {
      id: parsedFolderId,
      name: `Folder ${folderId}`,
      path: `/folder/${folderId}`,
      fullPath: `My Files / Folder ${folderId}`,
    };
  };

  // Memoize current folder info for modal
  const currentFolderInfo = useMemo(
    () => getCurrentFolder(),
    [folderId, currentFolder, folderHierarchy, allFiles, buildFolderPath]
  );

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
    if (item.type === "folder") {
      navigate(`/folder/${item.id}`);
    } else if (!isMobile) {
      // Root items don't need is_iframe check
      if (item.type === 'root' || item.type === 'iframe') {
        if (item.iframe_url) {
          setSelectedItemForIframe(item);
          setActiveTab("embedded-frame");
        }
      } else if (item.iframe_url && item.is_iframe === true) {
        // For regular items, check is_iframe flag
        setSelectedItemForIframe(item);
        setActiveTab("embedded-frame");
      } else {
        handleDownloadFile(item.id, item.name);
      }
    }
  };

  const handleMobileItemClick = (item, e) => {
    e.stopPropagation();
    if (item.type === "folder") {
      navigate(`/folder/${item.id}`);
    } else {
      setSelectedItemForActions(item);
      setShowMobileActions(true);
    }
  };

  const handleStarFile = async (fileId) => {
    setActionLoading((prev) => ({
      ...prev,
      starring: { ...prev.starring, [fileId]: true },
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
      setActionLoading((prev) => ({
        ...prev,
        starring: { ...prev.starring, [fileId]: false },
      }));
    }
  };

  const handleDownloadFile = async (fileId, fileName) => {
    setActionLoading((prev) => ({
      ...prev,
      downloading: { ...prev.downloading, [fileId]: true },
    }));

    try {
      const response = await fileApi.getDownloadUrl(fileId);

      if (
        response &&
        (response.success || response.download_url || response.url)
      ) {
        const downloadUrl =
          response.download_url ||
          response.url ||
          response.data?.download_url ||
          response.data?.url;

        if (downloadUrl) {
          const link = document.createElement("a");
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
      setActionLoading((prev) => ({
        ...prev,
        downloading: { ...prev.downloading, [fileId]: false },
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
    setNameError("");
    setDuplicateWarning("");
    setIsNameValid(true); // Default valid if same name
    validateName(item.name); // ← AB VALIDATION CHALEGA!
    setRenameModalOpen(true);
  };
  const handleRenameSubmit = async () => {
    if (!selectedItemForRename || !newName.trim() || !isNameValid) return;

    setRenaming(true);

    try {
      const response = await fileApi.renameItem(selectedItemForRename.id, newName.trim());

      if (response.status === "ok" || response.success) {
        toast.success(`${selectedItemForRename.type === "folder" ? "Folder" : "File"} renamed!`);
        setRenameModalOpen(false);
        resetRenameForm();
        loadFiles();
        window.dispatchEvent(new CustomEvent("refreshSidebar"));
      } else {
        const msg = response.message?.toLowerCase() || "";
        if (msg.includes("exists") || msg.includes("duplicate")) {
          setDuplicateWarning("This name is already taken.");
        } else {
          setNameError("Server error: " + response.message);
        }
      }
    } catch (error) {
      const msg = error.response?.data?.message?.toLowerCase() || "";
      if (msg.includes("exists") || msg.includes("duplicate")) {
        setDuplicateWarning("This name is already taken.");
      } else {
        setNameError("Failed to rename. Try again.");
      }
    } finally {
      setRenaming(false);
    }
  };
  const handleRefresh = async () => {
    setActionLoading((prev) => ({ ...prev, refreshing: true }));
    try {
      await loadFiles();
      toast.success("Files refreshed");
    } catch (error) {
      toast.error("Error refreshing files");
    } finally {
      setActionLoading((prev) => ({ ...prev, refreshing: false }));
    }
  };

  const handleTrashFile = async () => {
    if (!fileToTrash) return; // no file selected

    const fileId = fileToTrash.id;

    setActionLoading((prev) => ({
      ...prev,
      trashing: { ...prev.trashing, [fileId]: true },
    }));

    try {
      const response = await trashService.moveToTrash(fileId);
      console.log("🗑️ Trash response:", response);

      if (response.success) {
        toast.success(response.message || "File moved to trash");
        setShowConfirmPopup(false);
        setShowTrashPopup(true);
        loadFiles();
        window.dispatchEvent(new CustomEvent("refreshSidebar"));
      } else {
        toast.error(response.message || "Failed to move file");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      toast.error("Error moving file to trash");
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        trashing: { ...prev.trashing, [fileId]: false },
      }));
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
      setMovingStatus((prev) => ({ ...prev, [draggedFileId]: true }));

      try {
        const response = await fileApi.moveItem(draggedFileId, targetFolderId);

        // FIX: Check for both possible success response formats
        if (
          response.status === "success" ||
          response.status === "ok" ||
          response.success
        ) {
          toast.success(response.message || "File moved successfully");
          loadFiles();
          window.dispatchEvent(new CustomEvent("filesMoved"));
          window.dispatchEvent(new CustomEvent("refreshSidebar"));
        } else {
          // FIX: Show the actual error message from response if available
          toast.error(response.message || "Failed to move file");
        }
      } catch (error) {
        console.error("Error moving file:", error);
        // FIX: Show more specific error message
        toast.error(error.response?.data?.message || "Error moving file");
      } finally {
        setMovingStatus((prev) => ({ ...prev, [draggedFileId]: false }));
      }
    }
  };

  const handleFileUploaded = () => {
    loadFiles();
    window.dispatchEvent(new CustomEvent("fileUploaded"));
    window.dispatchEvent(new CustomEvent("refreshSidebar"));
  };

  const handleFolderCreated = async (folderName) => {
    // Don't check creatingFolder here - modal already handles it
    try {
      // Just refresh the file list once
      await loadFiles();

      // Dispatch events only once
      window.dispatchEvent(new CustomEvent("refreshSidebar"));
    } catch (error) {
      console.error("Error refreshing after folder creation:", error);
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
            {/* Name + Star + Iframe indicator */}
            <div className="flex items-center gap-1 mb-1">
              <span className="font-medium text-sm line-clamp-1">
                {item.name}
              </span>
              {item.is_starred && (
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-current flex-shrink-0" />
              )}
              {/* IFRAME INDICATOR */}
              {item.iframe_url && (
                item.type === 'root' ||
                item.type === 'iframe' ||
                item.is_iframe === true
              ) && (
                  <Code
                    className="w-3 h-3 text-blue-500 flex-shrink-0"
                    title="Has embedded content - Click to view"
                  />
                )}
            </div>

            {/* Date and Size */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <span className="whitespace-nowrap text-[11px]">
                {formatDate(item.updated_at)}
              </span>
              {item.type !== "folder" && (
                <>
                  <span className="text-[11px]">•</span>
                  <span className="whitespace-nowrap text-[11px]">
                    {formatFileSize(item.size)}
                  </span>
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
                <Badge
                  variant="destructive"
                  className="text-[9px] px-1 py-0 h-4"
                >
                  Trashed
                </Badge>
              )}
              <Badge
                variant="outline"
                className="capitalize text-[9px] px-1 py-0 h-4"
              >
                {item.type}
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-1 flex-shrink-0">
            {item.type === "file" && (
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
          <div className="mt-1.5 text-[10px] text-muted-foreground">
            Moving...
          </div>
        )}
      </CardContent>
    </Card>
  );

  const validateName = (name) => {
    setNameError("");
    setDuplicateWarning("");
    setIsNameValid(false);

    if (!name.trim()) {
      setNameError("empty");
      return;
    }

    if (name.length > 100) {
      setNameError("100");
      return;
    }

    if (!/^[a-zA-Z0-9 _.-]+$/.test(name)) {
      setNameError("allowed");
      return;
    }

    // Duplicate check in current folder
    const currentFolderFiles = files.filter(f =>
      (!folderId && !f.parent_id) ||
      (f.parent_id?.toString() === folderId)
    );

    const isDuplicate = currentFolderFiles.some(f =>
      f.id !== selectedItemForRename.id &&
      f.name.toLowerCase() === name.toLowerCase()
    );

    if (isDuplicate) {
      setDuplicateWarning("An item with this name already exists in this folder.");
      return;
    }

    setIsNameValid(true);
  };

  const resetRenameForm = () => {
    setNewName("");
    setNameError("");
    setDuplicateWarning("");
    setIsNameValid(false);
    setSelectedItemForRename(null);
  };
  return (
    <div className="flex flex-col h-full">
      {/* HEADER - Mobile responsive single row */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-background">
        {/* Left side - Folder info and view toggle */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          {/* Folder info */}
          <div className="text-sm font-medium min-w-0">
            {activeSearchQuery && activeSearchQuery.trim() !== "" ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="truncate max-w-[120px] sm:max-w-xs text-xs sm:text-sm">
                  {filteredFiles.length} results for "{activeSearchQuery}"
                </span>
                <Badge
                  variant="secondary"
                  className="text-xs bg-blue-100 text-blue-800 w-fit"
                >
                  Search
                </Badge>
              </div>
            ) : (
              <span className="text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
                {files.length} items in {getCurrentFolder().name}
              </span>
            )}
          </div>

          {/* View mode toggle - Hidden on mobile, shown on sm+ */}
          {!isMobile && !shouldShowTabs && (
            <div className="flex items-center gap-1 border-l pl-4">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 w-8 p-0"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8 p-0"
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Right side - All action buttons with mobile optimization */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Mobile dropdown for actions */}
          {isMobile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={handleRefresh}
                  disabled={actionLoading.refreshing}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setShowUploadModal(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setShowNewFolderModal(true)}>
                  <FolderPlus className="w-4 h-4 mr-2" />
                  New Folder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* Desktop buttons */
            <>
              {/* Refresh button */}
              {/* <Button
                onClick={handleRefresh}
                variant="outline"
                disabled={actionLoading.refreshing}
                className="flex items-center gap-1 sm:gap-2 h-9"
                size="sm"
              >
                {actionLoading.refreshing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Refresh</span>
              </Button> */}

              {/* Upload Files button */}
              <Button
                onClick={() => setShowUploadModal(true)}
                size="sm"
                className={`
    flex items-center gap-1 sm:gap-2 h-9 px-4 rounded-md font-medium transition-colors shadow-sm
    bg-red-600 text-white hover:bg-red-700
    dark:bg-[#1e3a8a] dark:hover:bg-[#1d4ed8] dark:text-gray-100
    disabled:opacity-70 disabled:cursor-not-allowed
  `}
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Upload</span>
              </Button>


              {/* New Folder button */}
              <Button
                variant="outline"
                onClick={() => setShowNewFolderModal(true)}
                className="flex items-center gap-1 sm:gap-2 h-9"
                size="sm"
              >
                <FolderPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Folder</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* TABS - Only show in root folder with iframe */}
      {shouldShowTabs && (
        <div className="border-b bg-background px-4 py-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="file-manager" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                File Manager
              </TabsTrigger>
              <TabsTrigger value="embedded-frame" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                PowerBI Analytics
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      {shouldShowTabs ? (
        <div className="flex flex-col flex-1 overflow-auto">
          {/* FILE MANAGER TAB */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="file-manager" className="flex-1 overflow-auto m-0 p-4">
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
                      {viewMode === "grid" ? (
                        /* Desktop Grid View */
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 w-full overflow-hidden">
                          {filteredFiles.map((item) => (
                            <Card
                              key={item.id}
                              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                              onClick={() => handleItemClick(item)}
                              style={{
                                opacity: movingStatus[item.id] ? 0.5 : 1,
                              }}
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
                                      <span
                                        className="font-medium text-sm truncate max-w-full"
                                        title={item.name}
                                      >
                                        {item.name}
                                      </span>
                                      {item.is_starred && (
                                        <Star className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />
                                      )}
                                    </div>

                                    {/* File details */}
                                    <div className="text-xs text-muted-foreground space-y-1">
                                      <div>{formatDate(item.updated_at)}</div>
                                      {item.type !== "folder" && (
                                        <div>{formatFileSize(item.size)}</div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Badges */}
                                  <div className="flex flex-wrap gap-1 justify-center">
                                    {item.is_starred && (
                                      <Badge variant="outline" className="text-xs">
                                        Starred
                                      </Badge>
                                    )}
                                    {item.is_trashed && (
                                      <Badge variant="destructive" className="text-xs">
                                        Trashed
                                      </Badge>
                                    )}
                                    <Badge variant="outline" className="capitalize text-xs">
                                      {item.type}
                                    </Badge>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center justify-center sm:justify-end gap-2 flex-wrap w-full mt-1">
                                    {item.type === "file" && (
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


                                        {item.type === "file" && (
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
                                          onClick={() => {
                                            setFileToTrash(item); // 👈 store selected file
                                            setShowConfirmPopup(true); // 👈 open confirmation popup
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
                                    <div className="text-xs text-muted-foreground">
                                      Moving...
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        /* Desktop Table View */
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead className="hidden md:table-cell">
                                  Last Modified
                                </TableHead>
                                <TableHead className="hidden sm:table-cell">
                                  Size
                                </TableHead>
                                <TableHead className="hidden lg:table-cell">
                                  Type
                                </TableHead>
                                <TableHead className="w-12">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredFiles.map((item) => (
                                <TableRow
                                  key={item.id}
                                  className={`hover:bg-muted/50 ${selectedItemForIframe?.id === item.id
                                    ? "bg-blue-50"
                                    : ""
                                    }`}
                                  style={{
                                    opacity: movingStatus[item.id] ? 0.5 : 1,
                                  }}
                                >
                                  <TableCell>
                                    <div
                                      className={`flex items-center gap-2 ${item.type === "folder"
                                        ? "cursor-pointer"
                                        : "cursor-move"
                                        }`}
                                      draggable={item.type !== "folder" && !isMobile}
                                      onDragStart={(e) =>
                                        item.type !== "folder" && handleDragStart(e, item.id)
                                      }
                                      onDragOver={
                                        item.type === "folder" ? handleDragOver : undefined
                                      }
                                      onDrop={
                                        item.type === "folder"
                                          ? (e) => handleDrop(e, item.id)
                                          : undefined
                                      }
                                      onClick={() => handleItemClick(item)}
                                    >
                                      {getFileIcon(getFileTypeFromItem(item))}
                                      <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">
                                            {item.name}
                                            {movingStatus[item.id] && (
                                              <span className="ml-2 text-xs text-muted-foreground">
                                                Moving...
                                              </span>
                                            )}
                                          </span>
                                          {item.is_starred && (
                                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                          )}
                                        </div>
                                        {/* Mobile-only details */}
                                        <div className="md:hidden text-xs text-muted-foreground mt-1">
                                          {formatDate(item.updated_at)}
                                          {item.type !== "folder" && (
                                            <span className="ml-2">
                                              • {formatFileSize(item.size)}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell text-muted-foreground">
                                    {formatDate(item.updated_at)}
                                  </TableCell>
                                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                                    {item.size ? formatFileSize(item.size) : "-"}

                                  </TableCell>
                                  <TableCell className="hidden lg:table-cell">
                                    <div className="flex gap-1">
                                      {item.is_starred && (
                                        <Badge variant="outline">Starred</Badge>
                                      )}
                                      {item.is_trashed && (
                                        <Badge variant="destructive">Trashed</Badge>
                                      )}
                                      <Badge variant="outline" className="capitalize">
                                        {item.type}
                                      </Badge>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      {item.type === "file" && (
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

                                          {item.type === "file" && (
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

                                          <DropdownMenuItem
                                            onClick={() => handleRenameItem(item)}
                                          >
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
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>

          {/* EMBEDDED FRAME TAB */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full h-[calc(100vh-100px)] flex flex-col" // 👈 full screen ke close height
          >
            <TabsContent
              value="embedded-frame"
              className="flex-1 overflow-auto m-0 flex flex-col h-full"
            >
              <div className="flex-1 p-4 h-full">
                <div className="w-full h-full border rounded-lg overflow-hidden bg-white">
                  {getPreviewUrl() ? (
                    <iframe
                      src={getPreviewUrl()}
                      className="w-full h-full border-0"
                      title={`Embedded content: ${selectedItemForIframe?.name || "Content"
                        }`}
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                      loading="lazy"
                      onError={(e) => console.error("Iframe load error:", e)}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <Code className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">No embedded content available</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

        </div>
      ) : (
        /* FALLBACK: Show without tabs if no iframe */
        <div className="flex-1 overflow-auto">
          {/* Mobile Layout - Stacked vertically */}
          {isMobile ? (
            <div className="flex flex-col h-full">
              {/* IFRAME PANEL - Always show in root folder, full width, above file list */}
              {/* IFRAME PANEL - Always show in root folder, full width, above file list */}
              {showIframePanel && selectedItemForIframe?.iframe_url && (
                selectedItemForIframe?.type === 'root' ||
                selectedItemForIframe?.type === 'iframe' ||
                selectedItemForIframe?.is_iframe === true
              ) && (
                  <div className="border-b">                  <div className="flex flex-col h-64">
                    <div className="flex items-center justify-between p-3 border-b bg-muted/50">
                      <div>
                        <h3 className="font-semibold text-sm">Embedded Content</h3>
                        <p className="text-xs text-muted-foreground">
                          {selectedItemForIframe?.name || "Select an item to preview"}
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 p-2">
                      {getPreviewUrl() ? (
                        <iframe
                          src={getPreviewUrl()}
                          className="w-full h-full border-0 rounded"
                          title={`Embedded content: ${selectedItemForIframe.name}`}
                          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <div className="text-center">
                            <Code className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-sm">
                              {selectedItemForIframe
                                ? "No embedded content available"
                                : "Select an item with embedded content to preview"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  </div>
                )}

              {/* File List Panel - Always full width on mobile */}
              <div className={showIframePanel ? "flex-1" : "flex-1 p-3"}>
                <div className="space-y-4">
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-panel"></div>
                    </div>
                  ) : (
                    <>
                      {filteredFiles.length === 0 ? (
                        <EmptyState />
                      ) : (
                        <div className="space-y-3">
                          {filteredFiles.map((item) => (
                            <MobileCardView key={item.id} item={item} />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Desktop Layout - Full width iframe above file list in root folder */
            <div className="flex flex-col h-full p-4 pt-2">
              {/* IFRAME PANEL - Full width, above file list, always in root folder */}
              {/* IFRAME PANEL - Full width, above file list, always in root folder */}
              {showIframePanel && selectedItemForIframe?.iframe_url && (
                selectedItemForIframe?.type === 'root' ||
                selectedItemForIframe?.type === 'iframe' ||
                selectedItemForIframe?.is_iframe === true
              ) && (
                  <div className="mb-4 border rounded-lg flex flex-col h-96">
                    <div className="flex items-center justify-between p-4 border-b">
                      <div>
                        <h3 className="font-semibold">
                          {selectedItemForIframe?.name || "Embedded Content"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedItemForIframe?.type === 'iframe' && selectedItemForIframe?.id === 'root-iframe'
                            ? "Root embedded content"
                            : selectedItemForIframe?.type === 'folder'
                              ? "From folder"
                              : "Interactive content"}
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 p-4">
                      <iframe
                        src={getPreviewUrl()}
                        className="w-full h-full border-0 rounded"
                        title={`Embedded content: ${selectedItemForIframe?.name || 'Content'}`}
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                        loading="lazy"
                        onError={(e) => console.error('Iframe load error:', e)}
                      />
                    </div>
                  </div>
                )}

              {/* File List Panel - Full width always */}
              <div className={showIframePanel ? "flex-1" : "flex-1 rounded-md border"}>
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
                        {viewMode === "grid" ? (
                          /* Desktop Grid View */
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 w-full overflow-hidden p-4">
                            {filteredFiles.map((item) => (
                              <Card
                                key={item.id}
                                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                                onClick={() => handleItemClick(item)}
                                style={{
                                  opacity: movingStatus[item.id] ? 0.5 : 1,
                                }}
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
                                        <span
                                          className="font-medium text-sm truncate max-w-full"
                                          title={item.name}
                                        >
                                          {item.name}
                                        </span>
                                        {item.is_starred && (
                                          <Star className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />
                                        )}
                                      </div>

                                      {/* File details */}
                                      <div className="text-xs text-muted-foreground space-y-1">
                                        <div>{formatDate(item.updated_at)}</div>
                                        {item.type !== "folder" && (
                                          <div>{formatFileSize(item.size)}</div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Badges */}
                                    <div className="flex flex-wrap gap-1 justify-center">
                                      {item.is_starred && (
                                        <Badge variant="outline" className="text-xs">
                                          Starred
                                        </Badge>
                                      )}
                                      {item.is_trashed && (
                                        <Badge variant="destructive" className="text-xs">
                                          Trashed
                                        </Badge>
                                      )}
                                      <Badge variant="outline" className="capitalize text-xs">
                                        {item.type}
                                      </Badge>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-center sm:justify-end gap-2 flex-wrap w-full mt-1">
                                      {item.type === "file" && (
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

                                          {item.type === "file" && (
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
                                            onClick={() => {
                                              setFileToTrash(item); // Store selected file
                                              setShowConfirmPopup(true); // Open confirmation popup
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
                                      <div className="text-xs text-muted-foreground">
                                        Moving...
                                      </div>
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
                                <TableHead className="hidden md:table-cell">
                                  Last Modified
                                </TableHead>
                                <TableHead className="hidden sm:table-cell">
                                  Size
                                </TableHead>
                                {/* <TableHead className="hidden lg:table-cell">
                                  Type
                                </TableHead> */}
                                <TableHead className="w-12">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredFiles.map((item) => (
                                <TableRow
                                  key={item.id}
                                  className={`hover:bg-muted/50 ${selectedItemForIframe?.id === item.id
                                    ? "bg-blue-50"
                                    : ""
                                    }`}
                                  style={{
                                    opacity: movingStatus[item.id] ? 0.5 : 1,
                                  }}
                                >
                                  <TableCell>
                                    <div
                                      className={`flex items-center gap-2 ${item.type === "folder"
                                        ? "cursor-pointer"
                                        : "cursor-move"
                                        }`}
                                      draggable={item.type !== "folder" && !isMobile}
                                      onDragStart={(e) =>
                                        item.type !== "folder" && handleDragStart(e, item.id)
                                      }
                                      onDragOver={
                                        item.type === "folder" ? handleDragOver : undefined
                                      }
                                      onDrop={
                                        item.type === "folder"
                                          ? (e) => handleDrop(e, item.id)
                                          : undefined
                                      }
                                      onClick={() => handleItemClick(item)}
                                    >
                                      {getFileIcon(getFileTypeFromItem(item))}
                                      <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">
                                            {item.name}
                                            {movingStatus[item.id] && (
                                              <span className="ml-2 text-xs text-muted-foreground">
                                                Moving...
                                              </span>
                                            )}
                                          </span>
                                          {item.is_starred && (
                                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                          )}
                                        </div>
                                        {/* Mobile-only details */}
                                        <div className="md:hidden text-xs text-muted-foreground mt-1">
                                          {formatDate(item.updated_at)}
                                          {item.type !== "folder" && (
                                            <span className="ml-2">
                                              • {formatFileSize(item.size)}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell text-muted-foreground">
                                    {formatDate(item.updated_at)}
                                  </TableCell>
                                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                                    {item.size ? formatFileSize(item.size) : "-"}

                                  </TableCell>


                                  {/* <TableCell className="hidden lg:table-cell">
                                    <div className="flex gap-1">
                                      {item.is_starred && (
                                        <Badge variant="outline">Starred</Badge>
                                      )}
                                      {item.is_trashed && (
                                        <Badge variant="destructive">Trashed</Badge>
                                      )}
                                      <Badge variant="outline" className="capitalize">
                                        {item.type}
                                      </Badge>
                                    </div>
                                  </TableCell> */}
                                  <TableCell>



                                    <div className="flex items-center gap-1">
                                      {item.type === "file" && canDownload && ((
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
                                      ))}
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
                                          {canToggleStar && (
                                            <DropdownMenuItem
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if (canToggleStar) {
                                                  handleStarFile(item.id);
                                                } else {
                                                  alert("You don’t have permission to star files.");
                                                }
                                              }}
                                              disabled={!canToggleStar || actionLoading.starring[item.id]}
                                            >
                                              <Star className="w-4 h-4 mr-2" />
                                              {item.is_starred ? "Unstar" : "Star"}
                                            </DropdownMenuItem>)}

                                          {item.type === "file" && (
                                            <DropdownMenuItem
                                              onClick={() => handleDownloadFile(item.id, item.name)}
                                              disabled={actionLoading.downloading[item.id]}
                                            >
                                              <Download className="w-4 h-4 mr-2" />
                                              Download
                                            </DropdownMenuItem>
                                          )}
                                          {canTrash && (
                                            <DropdownMenuItem
                                              onClick={() => {
                                                setFileToTrash(item); // Store selected file
                                                setShowConfirmPopup(true); // Open confirmation popup
                                              }}
                                              disabled={actionLoading.trashing[item.id]}
                                              className="text-destructive focus:text-destructive"
                                            >
                                              <Trash2 className="w-4 h-4 mr-2" />
                                              Move to Trash
                                            </DropdownMenuItem>
                                          )}
                                          {canMove && (
                                            <DropdownMenuItem
                                              onClick={() => handleMoveFile(item.id, item.name)}
                                            >
                                              <ArrowRightLeft className="w-4 h-4 mr-2" />
                                              Move
                                            </DropdownMenuItem>)}
                                          {canRename && (
                                            <DropdownMenuItem
                                              onClick={() => handleRenameItem(item)}
                                            >
                                              <Edit className="w-4 h-4 mr-2" />
                                              Rename
                                            </DropdownMenuItem>
                                          )}
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
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile Actions Sheet */}
      <Sheet open={showMobileActions} onOpenChange={setShowMobileActions}>
        <SheetContent side="bottom" className="h-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {selectedItemForActions &&
                getFileIcon(getFileTypeFromItem(selectedItemForActions))}
              {selectedItemForActions?.name}
            </SheetTitle>
            <SheetDescription>
              Choose an action for this {selectedItemForActions?.type}
            </SheetDescription>
          </SheetHeader>

          <div className="grid grid-cols-2 gap-3 mt-6 pb-6">
            {canToggleStar && (
              <Button
                variant="outline"
                onClick={() => handleStarFile(selectedItemForActions?.id)}
                disabled={actionLoading.starring[selectedItemForActions?.id]}
                className="flex items-center gap-2 h-12"
              >
                <Star className="w-4 h-4" />
                {selectedItemForActions?.is_starred ? "Unstar" : "Star"}
              </Button>
            )}
            {selectedItemForActions?.type === "file" && canDownload && ((
              <Button
                variant="outline"
                onClick={() =>
                  handleDownloadFile(
                    selectedItemForActions?.id,
                    selectedItemForActions?.name
                  )
                }
                disabled={actionLoading.downloading[selectedItemForActions?.id]}
                className="flex items-center gap-2 h-12"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            ))}
            {canMove && (
              <Button
                variant="outline"
                onClick={() =>
                  handleMoveFile(
                    selectedItemForActions?.id,
                    selectedItemForActions?.name
                  )
                }
                className="flex items-center gap-2 h-12"
              >
                <ArrowRightLeft className="w-4 h-4" />
                Move
              </Button>
            )}
            {canRename && (
              <Button
                variant="outline"
                onClick={() => handleRenameItem(selectedItemForActions)}
                className="flex items-center gap-2 h-12"
              >
                <Edit className="w-4 h-4" />
                Rename
              </Button>
            )}
            {canTrash && (

              <Button
                variant="destructive"
                onClick={() => handleTrashFile(selectedItemForActions?.id)}
                disabled={actionLoading.trashing[selectedItemForActions?.id]}
                className="flex items-center gap-2 h-12 col-span-2"
              >
                <Trash2 className="w-4 h-4" />
                Move to Trash
              </Button>)}
          </div>
        </SheetContent>
      </Sheet>

      {/* Rename Modal - Mobile optimized */}
      {/* Rename Modal - FULL VALIDATION + MESSAGES IN POPUP */}
      <Dialog open={renameModalOpen} onOpenChange={setRenameModalOpen}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg">
              Rename {selectedItemForRename?.type === "folder" ? "Folder" : "File"}
            </DialogTitle>
            <DialogDescription>
              Enter a new name for "<span className="font-medium">{selectedItemForRename?.name}</span>"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                value={newName}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewName(value);
                  validateName(value);
                }}
                placeholder="Enter new name..."
                onKeyPress={(e) => e.key === "Enter" && isNameValid && !renaming && handleRenameSubmit()}
                className={`text-base ${nameError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                autoFocus
              />

              {/* ALL VALIDATION MESSAGES - ONE BY ONE */}
              {nameError && (
                <div className="text-sm text-red-600 space-y-1">
                  {nameError.includes("empty") && (
                    <p className="flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" /> Name cannot be empty.
                    </p>
                  )}
                  {nameError.includes("100") && (
                    <p className="flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" /> Name too long (max 100 characters).
                    </p>
                  )}
                  {nameError.includes("allowed") && (
                    <p className="flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" /> Only letters, numbers, space, <code className="bg-red-100 px-1 rounded">_</code>, <code className="bg-red-100 px-1 rounded">-</code>, <code className="bg-red-100 px-1 rounded">.</code> allowed.
                    </p>
                  )}
                </div>
              )}

              {duplicateWarning && (
                <p className="text-sm text-orange-600 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> {duplicateWarning}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setRenameModalOpen(false);
                resetRenameForm();
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenameSubmit}
              disabled={renaming || !!nameError || !newName.trim() || !!duplicateWarning}
              className="w-full sm:w-auto flex items-center justify-center"
            >
              {renaming ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Renaming...
                </>
              ) : (
                "Rename"
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
        onFolderCreated={(newFolder) => {
          loadFiles();
          window.dispatchEvent(new CustomEvent("refreshSidebar"));
        }}
        currentPath={currentFolderInfo.fullPath}
        parentId={currentFolderInfo.id}
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





      {showConfirmPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-[90%] max-w-sm text-center relative animate-fadeIn">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
              Move to Trash?
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to move{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {fileToTrash?.name}
              </span>{" "}
              to Trash?
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={handleTrashFile}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Yes, Move
              </button>
              <button
                onClick={() => setShowConfirmPopup(false)}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


      {showConfirmPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-[90%] max-w-sm text-center relative animate-fadeIn">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
              Move to Trash?
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to move{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {fileToTrash?.name}
              </span>{" "}
              to Trash?
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={handleTrashFile}
                disabled={actionLoading.trashing[fileToTrash?.id]}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
              >
                {actionLoading.trashing[fileToTrash?.id] ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Moving...
                  </>
                ) : (
                  "Yes, Move"
                )}
              </button>
              <button
                onClick={() => setShowConfirmPopup(false)}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}