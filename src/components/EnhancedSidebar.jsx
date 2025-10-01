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
import { fileApi } from "../services/FileService";
import { toast } from "sonner";
import FileUploadModal from "./FileUploadModal";

export default function EnhancedSidebar({ onUploadClick, isMobileView }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { folderId } = useParams();
  const currentPath = location.pathname;
  
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
  
  // Debounce timer ref
  const searchTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);
useEffect(() => {
  // Focus on input when search results change or when the search value is changed
  if (searchValue && document.activeElement !== searchInputRef.current) {
    searchInputRef.current?.focus();
  }
}, [searchResults, searchValue]); // Trigger whenever search results or searchValue changes

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
  setSearchValue(value); // Update displayed value immediately

  // Clear previous timeout
  if (searchTimeoutRef.current) {
    clearTimeout(searchTimeoutRef.current);
  }

  if (!value || value.trim() === "") {
    setSearchResults([]);
    setIsSearching(false);
    return;
  }

  // Show searching state immediately
  setIsSearching(true);

  // Debounce the actual API call
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
    // Focus back on input
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

  const organizeItemsHierarchically = (items) => {
    const itemMap = new Map();
    const rootFolders = [];

    items.forEach((item) => {
      itemMap.set(item.id, {
        ...item,
        children: [],
        files: [],
        isLoaded: true,
      });

      if (
        (item.parent_id === 1 || item.parent_id === 2 || item.parent_id === null) &&
        item.type === "folder"
      ) {
        rootFolders.push(item.id);
      }
    });

    items.forEach((item) => {
      if (item.parent_id && itemMap.has(item.parent_id)) {
        const parent = itemMap.get(item.parent_id);
        if (item.type === "folder") {
          parent.children.push(itemMap.get(item.id));
        } else {
          parent.files.push(item);
        }
      }
    });

    return rootFolders.map((id) => itemMap.get(id)).filter(Boolean);
  };

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

  const handleFileClick = (fileId, parentId) => {
    if (parentId) {
      navigate(`/folder/${parentId}`);
    } else {
      navigate("/filemanager");
    }
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

  const renderSearchResultItem = (item) => {
    const isFolder = item.type === "folder";

    if (isFolder) {
      return (
        <div key={item.id} className="flex items-center gap-1">
          <button className="p-0.5 flex-shrink-0 invisible">
            <ChevronRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => handleFolderClick(item.id)}
            className="flex items-center gap-2 px-2 py-1 text-sm w-full text-left rounded transition-colors text-sidebar-foreground hover:bg-sidebar-accent/50"
          >
            <Folder className="w-4 h-4 text-panel flex-shrink-0" />
            <span className="truncate flex-1" title={item.name}>
              {item.name}
            </span>
            {item.is_starred && (
              <Star className="w-3 h-3 text-yellow-400 fill-current flex-shrink-0" />
            )}
          </button>
        </div>
      );
    } else {
      return (
        <div key={item.id} className="flex items-center gap-1" style={{ marginLeft: "16px" }}>
          <div className="w-3 h-3" />
          <button
            onClick={() => handleFileClick(item.id, item.parent_id)}
            className="flex items-center gap-2 px-2 py-1 text-sm w-full text-left rounded transition-colors text-sidebar-foreground hover:bg-sidebar-accent/50 group"
          >
            <FileText className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <span className="truncate flex-1" title={item.name}>
              {item.name}
            </span>
            {item.is_starred && (
              <Star className="w-3 h-3 text-yellow-400 fill-current flex-shrink-0" />
            )}
          </button>
        </div>
      );
    }
  };

  const renderFile = (file, level) => {
    return (
      <div
        key={file.id}
        className="flex items-center gap-1"
        style={{ marginLeft: `${(level + 1) * (isMobile ? 12 : 16)}px` }}
      >
        <div className="w-3 h-3" />
        <button
          onClick={() => handleFileClick(file.id, file.parent_id)}
          className="flex items-center gap-2 px-2 py-1 text-sm w-full text-left rounded transition-colors text-sidebar-foreground hover:bg-sidebar-accent/50 group"
        >
          <FileText className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          <span className="truncate flex-1" title={file.name}>
            {file.name}
          </span>
          {file.is_starred && (
            <Star className="w-3 h-3 text-yellow-400 fill-current flex-shrink-0" />
          )}
        </button>
      </div>
    );
  };

  const renderFolder = (folder, level = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isCurrentFolder = currentPath === `/folder/${folder.id}`;
    const hasChildren = folder.children && folder.children.length > 0;
    const hasFiles = folder.files && folder.files.length > 0;

    return (
      <div key={folder.id} className="space-y-1">
        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleFolder(folder.id)}
            className="p-0.5 hover:bg-sidebar-accent rounded transition-colors flex-shrink-0"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-sidebar-foreground/60" />
            ) : (
              <ChevronRight className="w-3 h-3 text-sidebar-foreground/60" />
            )}
          </button>
          <button
            onClick={() => handleFolderClick(folder.id)}
            className={`flex items-center gap-2 px-2 py-1 text-sm w-full text-left rounded transition-colors group ${
              isCurrentFolder
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            }`}
            style={{ marginLeft: `${level * (isMobile || isMobileView ? 12 : 16)}px` }}
          >
            {isExpanded ? (
              <FolderOpen className="w-4 h-4 text-panel flex-shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-panel flex-shrink-0" />
            )}
            <span className="truncate flex-1" title={folder.name}>
              {folder.name}
            </span>
            {folder.is_starred && (
              <Star className="w-3 h-3 text-yellow-400 fill-current flex-shrink-0" />
            )}
          </button>
        </div>

        {isExpanded && (
          <div className="space-y-1">
            {hasChildren && folder.children.map((child) => renderFolder(child, level + 1))}
            {hasFiles && folder.files.map((file) => renderFile(file, level))}
            {!hasChildren && !hasFiles && (
              <div
                className="text-xs text-sidebar-foreground/60 px-2 py-1"
                style={{
                  marginLeft: `${(level + 1) * (isMobile || isMobileView ? 12 : 16)}px`,
                }}
              >
                Empty folder
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const getTotalItems = () => {
    const totalFolders = allItems.filter((item) => item.type === "folder").length;
    const totalFiles = allItems.filter((item) => item.type === "file").length;
    return { totalFolders, totalFiles, total: totalFolders + totalFiles };
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
      <div className={`p-3 border-b border-sidebar-border ${isMobileViewProp ? "px-4" : ""}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-panel rounded-full flex items-center justify-center text-panel-foreground font-bold text-sm">
            CV
          </div>
          <span className="font-semibold text-sidebar-foreground text-base">CloudVault</span>
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-sidebar-foreground/60" />}
        </div>
        <div className="text-xs text-sidebar-foreground/60 mt-1">
          {isLoading
            ? "Loading..."
            : `${stats.total} items (${stats.totalFolders} folders, ${stats.totalFiles} files)`}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="sticky top-0 bg-sidebar border-b border-sidebar-border z-10">
          <nav className="space-y-1 p-2">
            <button
              onClick={() => handleNavigationClick("/dashboard")}
              className={`flex items-center gap-2 px-3 py-2 w-full text-left rounded-md transition-colors ${
                isActive("/dashboard")
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm">Dashboard</span>
            </button>

            <button
              onClick={() => handleNavigationClick("/filemanager")}
              className={`flex items-center gap-2 px-3 py-2 w-full text-left rounded-md transition-colors ${
                isActive("/filemanager")
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
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sidebar-foreground/60" />
      <Input
        ref={searchInputRef}
        type="text"
        placeholder="Search files and folders..."
        value={searchValue}
        onChange={handleSearchChange}
        className="pl-9 pr-8 py-1.5 h-9 w-full bg-sidebar-input border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/60 focus:ring-1 focus:ring-sidebar-accent focus:border-sidebar-accent"
      />
      {searchValue && !isSearching && (
        <button
          onClick={handleClearSearch}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-sidebar-accent rounded"
        >
          <X className="w-3 h-3 text-sidebar-foreground/60" />
        </button>
      )}
      {isSearching && (
        <Loader2 className="absolute right-2 top-1/3 w-3 h-3 animate-spin text-sidebar-foreground/60" />
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

            <div className="mt-4 border-t border-sidebar-border pt-2 space-y-1">
              <button
                onClick={() => handleNavigationClick("/starred")}
                className={`flex items-center gap-2 px-3 py-2 text-sm w-full rounded-md transition-colors ${
                  isActive("/starred")
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <Star className="w-4 h-4" />
                <span>Starred</span>
              </button>

              <button
                onClick={() => handleNavigationClick("/trash")}
                className={`flex items-center gap-2 px-3 py-2 text-sm w-full rounded-md transition-colors ${
                  isActive("/trash")
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>Trash</span>
              </button>

              <button
                onClick={() => handleNavigationClick("/customerprofile")}
                className={`flex items-center gap-2 px-3 py-2 text-sm w-full rounded-md transition-colors ${
                  isActive("/customerprofile")
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>
            </div>
          </nav>
        </div>

        <div className="p-3 border-t border-sidebar-border bg-sidebar">
          <Button
            className="w-full bg-panel mb-2 hover:bg-panel/90 text-panel-foreground"
            onClick={handleUploadClick}
          >
            <Upload className="w-4 h-4 mr-2" />
            New Upload
          </Button>
          <Button
            variant="ghost"
            className="w-full text-sm justify-start text-sidebar-foreground hover:bg-sidebar-accent/50"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );

  const isCurrentlyMobile = isMobile || isMobileView;

  if (isCurrentlyMobile) {
    return (
      <>
        <SidebarContent isMobileViewProp={true} />
        <FileUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onFileUploaded={handleFileUploaded}
          currentFolder={uploadTargetFolder}
        />
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