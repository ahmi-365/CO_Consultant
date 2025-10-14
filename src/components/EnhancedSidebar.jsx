import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Home,
  Star,
  Trash2,
  Upload,
  User,
  FileText,
  Loader2,
  BarChart3,
  Search,
  LogOut,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fileApi } from "../services/FileService";
import { toast } from "sonner";
import FileUploadModal from "./FileUploadModal";

export default function EnhancedSidebar({ onUploadClick, isMobileView }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { folderId } = useParams();
  const currentPath = location.pathname;

  // User state
  const [user, setUser] = useState(null);

  // Search state - CONTROLLED input value
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [allItems, setAllItems] = useState([]);
  const [folders, setFolders] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Drag and drop state
  const [dragOverFolder, setDragOverFolder] = useState(null);
  const [movingStatus, setMovingStatus] = useState({});

  // Debounce timer ref
  const searchTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    // Focus on input when search results change or when the search value is changed
    if (searchValue && document.activeElement !== searchInputRef.current) {
      searchInputRef.current?.focus();
    }
  }, [searchResults, searchValue]);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await getUserData();
        setUser(userData);
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, []);

  const [uploadTargetFolder, setUploadTargetFolder] = useState({
    id: null,
    name: "Root",
    path: "/",
  });

  const isActive = (path) => currentPath === path;

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    loadAllItems();
  }, []);

  useEffect(() => {
    let targetFolder = {
      id: null,
      name: "Root",
      path: "/",
    };
    if (folderId) {
      const folderItem = allItems.find((item) => item.id.toString() === folderId);
      if (folderItem) {
        targetFolder = {
          id: folderItem.id,
          name: folderItem.name,
          path: `/folder/${folderItem.id}`,
          fullPath: "Root / " + folderItem.name,
        };
      }
    }
    setUploadTargetFolder(targetFolder);
  }, [folderId, allItems]);

  // Function to get user initials
  const getUserInitials = (user) => {
    if (!user) return "CV";

    const firstName = user.name || "";
    const lastName = user.last_name || "";

    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }

    return "CV";
  };

  // Function to get user display name
  const getUserDisplayName = (user) => {
    if (!user) return "CloudVault";

    if (user.name && user.last_name) {
      return `${user.name} ${user.last_name}`;
    } else if (user.name) {
      return user.name;
    } else if (user.email) {
      return user.email.split('@')[0];
    }

    return "CloudVault";
  };

  // DRAG AND DROP HANDLERS
  const handleDragOver = (e, folderId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolder(folderId);
  };

  const handleDragLeave = (e, folderId) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragOverFolder === folderId) {
      setDragOverFolder(null);
    }
  };

  const handleDrop = async (e, targetFolderId) => {
    e.preventDefault();
    e.stopPropagation();

    const draggedItemId = e.dataTransfer.getData("text/plain");
    setDragOverFolder(null);

    if (!draggedItemId || draggedItemId === targetFolderId.toString()) {
      return;
    }

    // Show moving status
    setMovingStatus(prev => ({ ...prev, [draggedItemId]: true }));

    try {
      const response = await fileApi.moveItem(draggedItemId, targetFolderId);

      // Check for various success response formats
      const isSuccess = response.status === 'success' ||
        response.status === 'ok' ||
        response.success === true;

      if (isSuccess) {
        toast.success(response.message || "Item moved successfully");
        loadAllItems();
        window.dispatchEvent(new CustomEvent("filesMoved"));
        window.dispatchEvent(new CustomEvent("refreshFileList"));
      } else {
        toast.error(response.message || "Failed to move item");
      }
    } catch (error) {
      console.error("Error moving item:", error);
      toast.error(error.response?.data?.message || "Error moving item");
    } finally {
      setMovingStatus(prev => ({ ...prev, [draggedItemId]: false }));
    }
  };

  const loadAllItems = async () => {
    try {
      setIsLoading(true);
      const response = await fileApi.listFiles();
      if (Array.isArray(response)) {
        setAllItems(response);
        const organizedFolders = organizeItemsHierarchically(response);
        setFolders(organizedFolders);
      } else if (response.status === "ok" && Array.isArray(response.data)) {
        setAllItems(response.data);
        const organizedFolders = organizeItemsHierarchically(response.data);
        setFolders(organizedFolders);
      }
    } catch (error) {
      console.error("Error loading items:", error);
      toast.error("Error loading folders");
    } finally {
      setIsLoading(false);
    }
  };

  const performBackendSearch = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.trim() === "") {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const results = await fileApi.listFiles(null, { search: searchQuery });
      setSearchResults(Array.isArray(results) ? results : []);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchValue(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!value || value.trim() === "") {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    searchTimeoutRef.current = setTimeout(() => {
      performBackendSearch(value);
    }, 500);
  }, [performBackendSearch]);

  const handleClearSearch = useCallback(() => {
    setSearchValue("");
    setSearchResults([]);
    setIsSearching(false);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFolderClick = (folderId) => {
    navigate(`/folder/${folderId}`);
  };

  const handleFileUploaded = () => {
    loadAllItems();
    window.dispatchEvent(new CustomEvent("fileUploaded"));
  };

  const handleUploadClick = () => {
    setShowUploadModal(true);
    onUploadClick(uploadTargetFolder.id);
  };

  const handleNavigationClick = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const renderFolder = (folder, level = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isCurrentFolder = currentPath === `/folder/${folder.id}`;
    const hasChildren = folder.children && folder.children.length > 0;
    const isDragOver = dragOverFolder === folder.id;

    return (
      <div key={folder.id} className="space-y-1">
        <div className="flex items-center">
          {/* Indentation for hierarchy level */}
          <div style={{ width: `${level * 16}px` }} className="flex-shrink-0" />

          {/* Expand/Collapse button */}
          {hasChildren ? (
            <button
              onClick={() => toggleFolder(folder.id)}
              className="p-0.5 hover:bg-sidebar-accent rounded transition-colors flex-shrink-0 mr-1"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-sidebar-foreground/60" />
              ) : (
                <ChevronRight className="w-3 h-3 text-sidebar-foreground/60" />
              )}
            </button>
          ) : (
            <div className="w-5 flex-shrink-0" />
          )}

          {/* Folder button with drag and drop */}
          <button
            onClick={() => handleFolderClick(folder.id)}
            onDragOver={(e) => handleDragOver(e, folder.id)}
            onDragLeave={(e) => handleDragLeave(e, folder.id)}
            onDrop={(e) => handleDrop(e, folder.id)}
            className={`flex items-center gap-2 px-2 py-1 text-sm flex-1 text-left rounded transition-colors group ${isCurrentFolder
              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              : isDragOver
                ? "bg-blue-100 border border-blue-300 text-sidebar-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            style={{
              border: isDragOver ? '2px dashed #3b82f6' : 'none',
            }}
          >
            {isExpanded ? (
              <FolderOpen className="w-4 h-4 text-panel flex-shrink-0 mt-0.5 self-start" />
            ) : (
              <Folder className="w-4 h-4 text-panel flex-shrink-0 mt-0.5 self-start" />
            )}
            <span
              className="break-words line-clamp-2 leading-tight"
              title={folder.name}
              style={{
                wordBreak: 'break-word',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {folder.name}
              {movingStatus[folder.id] && (
                <span className="ml-1 text-xs text-muted-foreground">(Moving...)</span>
              )}
            </span>
            {folder.is_starred && (
              <Star className="w-3 h-3 text-yellow-400 fill-current flex-shrink-0 mt-0.5 self-start" />
            )}
          </button>
        </div>

        {isExpanded && hasChildren && (
          <div className="space-y-1">
            {folder.children.map((child) => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderSearchResultItem = (item) => {
    const isFolder = item.type === "folder";

    if (!isFolder) return null;

    const isDragOver = dragOverFolder === item.id;

    return (
      <div key={item.id} className="flex items-center">
        <button className="p-0.5 flex-shrink-0 mr-1">
          <ChevronRight className="w-3 h-3 text-sidebar-foreground/60" />
        </button>

        <button
          onClick={() => handleFolderClick(item.id)}
          onDragOver={(e) => handleDragOver(e, item.id)}
          onDragLeave={(e) => handleDragLeave(e, item.id)}
          onDrop={(e) => handleDrop(e, item.id)}
          className={`flex items-center gap-2 px-2 py-1 text-sm flex-1 text-left rounded transition-colors ${isDragOver
            ? "bg-blue-100 border border-blue-300 text-sidebar-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            }`}
          style={{
            border: isDragOver ? '2px dashed #3b82f6' : 'none',
          }}
        >
          <Folder className="w-4 h-4 text-panel flex-shrink-0 mt-0.5 self-start" />
          <span
            className="break-words line-clamp-2 leading-tight"
            title={item.name}
            style={{
              wordBreak: 'break-word',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {item.name}
          </span>
          {item.is_starred && (
            <Star className="w-3 h-3 text-yellow-400 fill-current flex-shrink-0 mt-0.5 self-start" />
          )}
        </button>
      </div>
    );
  };

  const organizeItemsHierarchically = (items) => {
    const itemMap = new Map();
    const rootFolders = [];

    const folderItems = items.filter(item => item.type === "folder");

    folderItems.forEach((item) => {
      itemMap.set(item.id, {
        ...item,
        children: [],
        isLoaded: true,
      });

      if (
        (item.parent_id === 1 || item.parent_id === 2 || item.parent_id === null) &&
        item.type === "folder"
      ) {
        rootFolders.push(item.id);
      }
    });

    folderItems.forEach((item) => {
      if (item.parent_id && itemMap.has(item.parent_id)) {
        const parent = itemMap.get(item.parent_id);
        parent.children.push(itemMap.get(item.id));
      }
    });

    return rootFolders.map((id) => itemMap.get(id)).filter(Boolean);
  };

  const getTotalItems = () => {
    const totalFolders = allItems.filter((item) => item.type === "folder").length;
    const totalFiles = allItems.filter((item) => item.type === "file").length;
    return { totalFolders, totalFiles, total: totalFolders };
  };

  useEffect(() => {
    const handleFolderCreated = () => loadAllItems();
    const handleFilesMoved = () => loadAllItems();
    const handleFilesUploaded = () => loadAllItems();
    const handleRefreshSidebar = () => loadAllItems();

    window.addEventListener("folderCreated", handleFolderCreated);
    window.addEventListener("filesMoved", handleFilesMoved);
    window.addEventListener("filesUploaded", handleFilesUploaded);
    window.addEventListener("refreshSidebar", handleRefreshSidebar);

    return () => {
      window.removeEventListener("folderCreated", handleFolderCreated);
      window.removeEventListener("filesMoved", handleFilesMoved);
      window.removeEventListener("filesUploaded", handleFilesUploaded);
      window.removeEventListener("refreshSidebar", handleRefreshSidebar);
    };
  }, []);

  const stats = getTotalItems();

  const SidebarContent = ({ isMobileViewProp }) => (
    <div
      className={`
        ${isMobileViewProp ? "h-full w-full" : "fixed left-0 top-0 h-screen w-60"}
        bg-sidebar border-r border-sidebar-border flex flex-col
      `}
    >
      {/* Updated Header with Profile Photo and User Name */}
      <div
        className={`p-3 border-b border-gray-200 dark:border-gray-700 
              bg-white dark:bg-[#0f172a] transition-colors ${isMobileViewProp ? "px-4" : ""
          }`}
      >
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8 border border-gray-200 dark:border-gray-700">
            {user?.profile_photo ? (
              <AvatarImage
                src={user.profile_photo}
                alt={getUserDisplayName(user)}
                className="object-cover"
              />
            ) : null}
            <AvatarFallback className="bg-red-600 text-white dark:bg-[#1e40af] dark:text-gray-100 font-medium text-sm">
              {getUserInitials(user)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
              {getUserDisplayName(user)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {user?.email || "Loading..."}
            </div>
          </div>

          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-gray-500 dark:text-gray-400 flex-shrink-0" />
          )}
        </div>

        <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
          {isLoading
            ? "Loading..."
            : `${stats.total} items (${stats.totalFolders} folders, ${stats.totalFiles} files)`}
        </div>
      </div>


      <div className="flex-1 flex flex-col min-h-0 dark:border-gray-700 
              bg-white dark:bg-[#0f172a] transition-colors">
        <div className="sticky top-0 bg-sidebar border-b border-sidebar-border z-10 dark:border-gray-700 
              bg-white dark:bg-[#0f172a] transition-colors">
          <nav className="space-y-1 p-2">
            <button
              onClick={() => handleNavigationClick("/dashboard")}
              className={`flex items-center gap-2 px-3 py-2 w-full text-left rounded-md transition-colors ${isActive("/dashboard")
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm">Dashboard</span>
            </button>

            <button
              onClick={() => handleNavigationClick("/filemanager")}
              className={`flex items-center gap-2 px-3 py-2 w-full text-left rounded-md transition-colors ${isActive("/filemanager")
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
            >
              <Home className="w-4 h-4" />
              <span className="text-sm">Home</span>
            </button>
          </nav>

          <div className="px-2 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search files and folders..."
                value={searchValue}
                onChange={handleSearchChange}
                className="pl-10 pr-8 py-1.5 h-9 w-full bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
              />

              {searchValue && !isSearching && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded transition-colors"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              )}

              {isSearching && (
                <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>

        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          <nav className="space-y-1">
            {searchValue ? (
              <div className="space-y-1">
                {isSearching ? (
                  <div className="px-2 py-1 text-sm text-sidebar-foreground/60 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Searching...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="px-2 py-1 text-sm text-sidebar-foreground/60">
                    No results found
                  </div>
                ) : (
                  <>
                    <div className="px-2 py-1 text-xs text-sidebar-foreground/60 font-medium">
                      {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
                    </div>
                    {searchResults.map((item) => renderSearchResultItem(item))}
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {isLoading ? (
                  <div className="px-2 py-1 text-sm text-sidebar-foreground/60 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading folders...
                  </div>
                ) : folders.length === 0 ? (
                  <div className="px-2 py-1 text-sm text-sidebar-foreground/60">
                    No folders found
                  </div>
                ) : (
                  folders.map((folder) => renderFolder(folder))
                )}
              </div>
            )}


          </nav>
        </div>

        {/* Updated Footer with Upload and Logout in one row */}
        <div className="p-3 border-t border-sidebar-border bg-sidebar dark:border-gray-700 
              bg-white dark:bg-[#0f172a] transition-colors">
          <div className=" gap-10 mb-3">
            <button
              onClick={() => handleNavigationClick("/starred")}
              className={`flex items-center gap-2 px-3 py-2 text-sm w-full rounded-md transition-colors ${isActive("/starred")
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
            >
              <Star className="w-4 h-4" />
              <span>Starred</span>
            </button>

            <button
              onClick={() => handleNavigationClick("/trash")}
              className={`flex items-center gap-2 px-3 py-2 text-sm w-full rounded-md transition-colors ${isActive("/trash")
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>Trash</span>
            </button>

            <button
              onClick={() => handleNavigationClick("/customerprofile")}
              className={`flex items-center gap-2 px-3 py-2 text-sm w-full rounded-md transition-colors ${isActive("/customerprofile")
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>
          </div>
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white 
             dark:bg-[#1e40af] dark:hover:bg-[#1d4ed8] dark:text-white 
             transition-all duration-200 shadow-sm dark:shadow-md"
              onClick={handleUploadClick}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>

            <Button
              variant="ghost"
              size="icon"
              title="Logout"
              onClick={handleLogout}
              className={`
                     flex-shrink-0 transition-colors rounded-md
                     text-gray-600 hover:text-red-600 hover:bg-red-50
                     dark:text-gray-300 dark:hover:text-[#60a5fa] dark:hover:bg-[#1e3a8a]/20
  `}
            >
              <LogOut className="w-4 h-4" />
            </Button>

          </div>
        </div>
      </div>
    </div>
  );

  const isCurrentlyMobile = isMobile || isMobileView;

  if (isCurrentlyMobile) {
    return (
      <>
        {/* Mobile Sidebar (icon-only) */}
        <div className="fixed top-0 left-0 h-full w-16 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-4 space-y-6 z-50 dark:border-gray-700 
              bg-white dark:bg-[#0f172a] transition-colors">
          {/* Profile Photo / Avatar (Top) */}
          <Avatar className="w-9 h-9 border border-sidebar-border">
            {user?.profile_photo ? (
              <AvatarImage
                src={user.profile_photo}
                alt={getUserDisplayName(user)}
                className="object-cover"
              />
            ) : null}
            <AvatarFallback className="bg-panel text-panel-foreground font-medium text-xs">
              {getUserInitials(user)}
            </AvatarFallback>
          </Avatar>

          {/* Dashboard */}
          <button
            onClick={() => handleNavigationClick("/dashboard")}
            className={`p-2 rounded-md transition-colors ${isActive("/dashboard")
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
          >
            <BarChart3 className="w-5 h-5" />
          </button>

          {/* Home */}
          <button
            onClick={() => handleNavigationClick("/filemanager")}
            className={`p-2 rounded-md transition-colors ${isActive("/filemanager")
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
          >
            <Home className="w-5 h-5" />
          </button>

          {/* Starred */}
          <button
            onClick={() => handleNavigationClick("/starred")}
            className={`p-2 rounded-md transition-colors ${isActive("/starred")
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
          >
            <Star className="w-5 h-5" />
          </button>

          {/* Trash */}
          <button
            onClick={() => handleNavigationClick("/trash")}
            className={`p-2 rounded-md transition-colors ${isActive("/trash")
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
          >
            <Trash2 className="w-5 h-5" />
          </button>

          {/* Profile */}
          <button
            onClick={() => handleNavigationClick("/customerprofile")}
            className={`p-2 rounded-md transition-colors ${isActive("/customerprofile")
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
          >
            <User className="w-5 h-5" />
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom Section - Updated to one row */}
          <div className="flex flex-col items-center space-y-2 mt-auto w-full px-2">
            {/* Upload and Logout in one row */}
            <div className="flex gap-2 w-full">
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex-1 p-2 rounded-md transition-colors bg-panel text-panel-foreground hover:bg-panel/90 flex items-center justify-center"
              >
                <Upload className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent/50 flex items-center justify-center"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Upload Modal */}

      </>
    );
  }

  return (
    <>
      <SidebarContent isMobileViewProp={false} />
      <FileUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onFileUploaded={handleFileUploaded}
        currentFolder={uploadTargetFolder}
      />
    </>
  );
}

// You'll need to implement this function based on how you get user data
async function getUserData() {
  // This could be from localStorage, context, or an API call
  // Example from localStorage:
  const userData = localStorage.getItem('user');
  if (userData) {
    return JSON.parse(userData);
  }

  // Or from an API call:
  // return await authApi.getCurrentUser();

  return null;
}