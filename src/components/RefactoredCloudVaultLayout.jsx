import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Search, ChevronRight, Folder, Upload, RefreshCw, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import AvatarImage
import EnhancedSidebar from "./EnhancedSidebar";
import EnhancedFileList from "./EnhancedFileList";
import FileUploadModal from "./FileUploadModal";
import NewFolderModal from "./NewFolderModal";
import NotificationDropdown from "./NotificationDropdown";
import { fileApi } from "../services/FileService";
import { toast } from "sonner";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

export default function RefactoredCloudVaultLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { folderId } = useParams();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Add user state
  const [user, setUser] = useState(null);

  // LIFTED SEARCH STATE: This state now controls both search inputs
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadParentId, setUploadParentId] = useState(null);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [folderPath, setFolderPath] = useState([]);
  const [isLoadingPath, setIsLoadingPath] = useState(false);
  const [allItems, setAllItems] = useState([]);

  const currentPath = location.pathname;

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Replace this with your actual user data fetching logic
        // This could be from context, localStorage, or an API call
        const userData = await getUserData(); // You'll need to implement this
        setUser(userData);
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, []);

  // Function to get user initials
  const getUserInitials = (user) => {
    if (!user) return "U";
    
    const firstName = user.name || "";
    const lastName = user.last_name || "";
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    
    return "U";
  };

  // Function to get user display name
  const getUserDisplayName = (user) => {
    if (!user) return "User";
    
    if (user.name && user.last_name) {
      return `${user.name} ${user.last_name}`;
    } else if (user.name) {
      return user.name;
    } else if (user.email) {
      return user.email.split('@')[0];
    }
    
    return "User";
  };

  // Load all items for breadcrumb building
  const loadAllItems = useCallback(async () => {
    try {
      const response = await fileApi.listFiles();
      let items = [];

      if (response.status === 'ok' && Array.isArray(response.data)) {
        items = response.data;
      } else if (Array.isArray(response)) {
        items = response;
      }

      setAllItems(items);
      return items;
    } catch (error) {
      console.error("Error loading items:", error);
      return [];
    }
  }, []);

  // Function to build folder path using listFiles API
  const buildFolderPath = useCallback(async (currentFolderId) => {
    if (!currentFolderId) {
      setFolderPath([]);
      return;
    }

    setIsLoadingPath(true);
    try {
      let items = allItems.length > 0 ? allItems : await loadAllItems();

      const folderMap = new Map();
      items.forEach(item => {
        if (item.type === 'folder') {
          folderMap.set(item.id, {
            id: item.id,
            name: item.name,
            parentId: item.parent_id
          });
        }
      });

      const path = [];
      let currentId = parseInt(currentFolderId);

      while (currentId && folderMap.has(currentId)) {
        const folder = folderMap.get(currentId);
        path.unshift({
          id: folder.id,
          name: folder.name,
          path: `/folder/${folder.id}`
        });

        currentId = folder.parentId;

        if (path.length > 10) break;
      }

      setFolderPath(path);
    } catch (error) {
      console.error("Error building folder path:", error);
      setFolderPath([]);
    } finally {
      setIsLoadingPath(false);
    }
  }, [allItems, loadAllItems]);

  // Update folder path when folderId changes
  useEffect(() => {
    if (currentPath.startsWith("/folder/") && folderId) {
      buildFolderPath(folderId);
    } else {
      setFolderPath([]);
    }
  }, [folderId, currentPath, buildFolderPath]);

  // Load all items on component mount
  useEffect(() => {
    loadAllItems();
  }, [loadAllItems]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    toast.success("Logged out successfully");

    if (isMobileSidebarOpen) { 
      setIsMobileSidebarOpen(false);
    }
  };

  const getBreadcrumbPath = () => {
    switch (currentPath) {
      case "/starred":
        return [{ name: "Starred", path: "/starred" }];
      case "/shared":
        return [{ name: "Shared with me", path: "/shared" }];
      case "/trash":
        return [{ name: "Trash", path: "/trash" }];
      case "/profile":
        return [{ name: "Profile", path: "/profile" }];
      case "/filemanager":
        return [{ name: "My Files", path: "/filemanager" }];
      default:
        if (currentPath.startsWith("/folder/")) {
          const basePath = [{ name: "My Files", path: "/filemanager" }];
          return [...basePath, ...folderPath];
        }
        return [{ name: "My Files", path: "/filemanager" }];
    }
  };

  const handleRefreshClick = useCallback(async () => {
    setIsRefreshing(true);

    try {
      await loadAllItems();

      window.dispatchEvent(new CustomEvent("refreshSidebar"));
      window.dispatchEvent(new CustomEvent("refreshFileList"));

      if (currentPath.startsWith("/folder/") && folderId) {
        await buildFolderPath(folderId);
      }

      toast.success("Content refreshed successfully");
    } catch (error) {
      console.error("Error refreshing content:", error);
      toast.error("Failed to refresh content");
    } finally {
      setIsRefreshing(false);
    }
  }, [currentPath, folderId, buildFolderPath, loadAllItems]);

  const handleFileUpload = async (file, parentId) => {
    try {
      const response = await fileApi.uploadFile(file, parentId);
      if (response.success) {
        toast.success("File uploaded successfully");
        await loadAllItems();
        window.dispatchEvent(new CustomEvent("fileUploaded"));
        window.dispatchEvent(new CustomEvent("refreshSidebar"));
        window.dispatchEvent(new CustomEvent("refreshFileList"));
      } else {
        toast.error("Failed to upload file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Error uploading file");
    }
  };

  const handleSidebarUploadClick = (id) => {
    setUploadParentId(id);
    setIsUploadModalOpen(true);
  };

  const handleProfileClick = () => {
    navigate("/customerprofile");
  };

  // FIX: Stable handler for ALL search inputs
  const handleSearchChange = useCallback((e) => {
    const query = e.target.value;
    setSearchTerm(query); // Set the centralized state

    // Dispatch event for file list filtering/global search
    const searchMode = query.trim() !== '' ? 'global' : 'local';

    window.dispatchEvent(new CustomEvent("globalSearch", {
      detail: {
        query: query.trim(),
        searchMode: searchMode
      }
    }));
  }, []);

  // Handle folder creation success
  const handleFolderCreated = useCallback(async () => {
    await loadAllItems();

    window.dispatchEvent(new CustomEvent("refreshSidebar"));
    window.dispatchEvent(new CustomEvent("refreshFileList"));

    if (currentPath.startsWith("/folder/") && folderId) {
      buildFolderPath(folderId);
    }
  }, [currentPath, folderId, buildFolderPath, loadAllItems]);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - PASSING SEARCH PROPS */}
      <EnhancedSidebar
        onUploadClick={handleSidebarUploadClick}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-60 ml-16 transition-all duration-300">
        {/* Header */}
        <header className="bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Breadcrumb code remains the same */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              {isLoadingPath && currentPath.startsWith("/folder/") ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin"></div>
                  <span>Loading path...</span>
                </div>
              ) : (
                getBreadcrumbPath().map((crumb, index) => (
                  <div key={crumb.path || crumb.id} className="flex items-center gap-2">
                    {index > 0 && <ChevronRight className="w-4 h-4" />}
                    <button
                      onClick={() => navigate(crumb.path)}
                      className={`hover:text-foreground transition-colors max-w-[150px] truncate ${index === getBreadcrumbPath().length - 1
                          ? "text-foreground font-medium"
                          : ""
                        }`}
                      title={crumb.name}
                    >
                      {crumb.name}
                    </button>
                  </div>
                ))
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Refresh Button */}
            <Button
              variant="ghost"
              size="icon"
              className={`w-8 h-8 rounded-full text-foreground/60 hover:text-foreground ${isRefreshing ? "animate-spin" : ""
                }`}
              onClick={handleRefreshClick}
              disabled={isRefreshing}
              title="Refresh all content"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>

            {/* Enhanced Search - USING CENTRALIZED STATE */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search all files..."
                value={searchTerm} // Use the centralized state
                onChange={handleSearchChange} // Use the stable handler
                className="pl-10 w-64 bg-input border-border"
                title="Search across all your files and folders"
              />
              {searchTerm.trim() !== "" && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    Global
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <NotificationDropdown />

            {/* Updated User Avatar with Profile Photo */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  {user?.profile_photo ? (
                    <AvatarImage 
                      src={user.profile_photo} 
                      alt={getUserDisplayName(user)}
                      className="object-cover"
                    />
                  ) : null}
                  <AvatarFallback className="bg-panel text-panel-foreground hover:bg-panel/90 transition-colors">
                    {getUserInitials(user)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={handleProfileClick}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Rest of the component remains the same */}
        <main className="flex-1 p-6">
          {children || (
            <div className="space-y-6">
              {/* Page Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-foreground">
                    {currentPath === "/filemanager"
                      ? "My Files"
                      : currentPath === "/starred"
                        ? "Starred Files"
                        : currentPath === "/shared"
                          ? "Shared with me"
                          : currentPath === "/trash"
                            ? "Trash"
                            : currentPath.startsWith("/folder/")
                              ? folderPath.length > 0
                                ? folderPath[folderPath.length - 1]?.name || "Folder"
                                : "Folder"
                              : "Files"
                    }
                  </h1>
                  <p className="text-muted-foreground">
                    {currentPath === "/"
                      ? "Manage your personal files and folders"
                      : currentPath === "/starred"
                        ? "Files you've marked as important"
                        : currentPath === "/shared"
                          ? "Files others have shared with you"
                          : currentPath === "/trash"
                            ? "Recently deleted files"
                            : "Browse folder contents"
                    }
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* New Folder Button */}
                  <Button
                    variant="outline"
                    onClick={() => setIsNewFolderModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Folder className="w-4 h-4" />
                    New Folder
                  </Button>

                  {/* Upload Button */}
                  <Button
                    onClick={() => {
                      setUploadParentId(folderId || null);
                      setIsUploadModalOpen(true);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload
                  </Button>
                </div>
              </div>

              {/* File List */}
              <EnhancedFileList />
            </div>
          )}
        </main>
      </div>

      {/* Upload Modal */}
      
      {/* New Folder Modal */}
      <NewFolderModal
        isOpen={isNewFolderModalOpen}
        onClose={() => setIsNewFolderModalOpen(false)}
        onFolderCreated={handleFolderCreated}
        parentId={folderId || null}
      />
    </div>
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