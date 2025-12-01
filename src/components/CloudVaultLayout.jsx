import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Home,
  Users,
  Star,
  Trash2,
  Upload,
  Menu,
  FileText,
  Archive,
  Image,
  Video,
  File,
  Download,
  User,
  FolderPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { fileApi, formatFileSize, formatDate } from "@/services/FileService";

const getFileIcon = (filename, type) => {
  const iconClass = "w-4 h-4 text-muted-foreground mr-2";

  if (type === "folder") {
    return <Folder className={iconClass} />;
  }

  const extension = filename?.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'pdf':
    case 'doc':
    case 'docx':
      return <FileText className={iconClass} />;
    case 'zip':
    case 'rar':
    case '7z':
      return <Archive className={iconClass} />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
      return <Image className={iconClass} />;
    case 'mp4':
    case 'avi':
    case 'mov':
      return <Video className={iconClass} />;
    default:
      return <File className={iconClass} />;
  }
};

export default function CloudVaultLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { folderId } = useParams();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isClientProjectsOpen, setIsClientProjectsOpen] = useState(true);
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [allFolders, setAllFolders] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  const currentPath = location.pathname;

  const getBreadcrumbPath = () => {
    switch (currentPath) {
      case "/starred":
        return [{ name: "Starred", path: "/starred" }];
      case "/shared":
        return [{ name: "Shared with me", path: "/shared" }];
      case "/trash":
        return [{ name: "Trash", path: "/trash" }];
      case "/customerprofile":
        return [{ name: "Profile", path: "/customerprofile" }];
      case "/":
      case "/filemanager":
        return [{ name: "Home", path: "/filemanager" }];
      default:
        return [
          { name: "Home", path: "/filemanager" },
          { name: "Current Folder", path: currentPath },
        ];
    }
  };

  const isActive = (path) => currentPath === path;

  // Load data on component mount and when folderId changes
  useEffect(() => {
    loadFiles();
    loadAllFolders();
  }, [folderId]);
  // In your loadFiles function, change this:
  const loadFiles = async () => {
    setLoading(true);
    try {
      console.log('Loading files for folder:', folderId);

      const parentId = folderId || null;
      // CHANGE: listFilesNoUser -> listFiles
      const response = await fileApi.listFiles(parentId);

      console.log('API Response:', response);

      if (response && Array.isArray(response)) {
        const fileItems = response.filter(item => item.type === 'file');
        const folderItems = response.filter(item => item.type === 'folder');


        setFiles(fileItems);
        setFolders(folderItems);
      } else {
        console.warn('Invalid response format:', response);
        setFiles([]);
        setFolders([]);
      }
    } catch (error) {
      console.error("Error loading files:", error);
      toast.error(`Error loading files: ${error.message}`);
      setFiles([]);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  };

  // In your loadAllFolders function, change this:
  const loadAllFolders = async () => {
    try {
      console.log('Loading all folders');

      // CHANGE: listFilesNoUser -> listFiles
      const response = await fileApi.listFiles(null);

      console.log('All folders response:', response);

      if (response && Array.isArray(response)) {
        const folderItems = response.filter(item => item.type === 'folder');
        console.log('All folder items:', folderItems);
        setAllFolders(folderItems);
      } else {
        console.warn('Invalid all folders response format:', response);
        setAllFolders([]);
      }
    } catch (error) {
      console.error("Error loading all folders:", error);
      toast.error(`Error loading folders: ${error.message}`);
      setAllFolders([]);
    }
  };

  // In your handleSearch function, change this:
  const handleSearch = async (query) => {
    setLoading(true);
    try {
      console.log('Searching for:', query, 'in folder:', folderId);

      let response;
      if (!query || !query.trim()) {
        // CHANGE: listFilesNoUser -> listFiles
        response = await fileApi.listFiles(folderId || null);
      } else {
        console.warn('Search functionality may need API modification');
        // CHANGE: listFilesNoUser -> listFiles
        response = await fileApi.listFiles(folderId || null);
        if (response && Array.isArray(response)) {
          const searchTerm = query.trim().toLowerCase();
          response = response.filter(item =>
            item.name && item.name.toLowerCase().includes(searchTerm)
          );
        }
      }

      console.log('Search response:', response);

      if (response && Array.isArray(response)) {
        const fileItems = response.filter(item => item.type === 'file');
        const folderItems = response.filter(item => item.type === 'folder');
        setFiles(fileItems);
        setFolders(folderItems);
      } else {
        console.warn('Invalid search response:', response);
        setFiles([]);
        setFolders([]);
      }
    } catch (error) {
      console.error("Error searching files:", error);
      toast.error(`Error searching: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  const handleFileUploaded = async (file) => {
    setLoading(true);
    try {
      console.log('Uploading file:', file.name, 'to folder:', folderId);

      const response = await fileApi.uploadFile(file, folderId || null);

      console.log('Upload response:', response);

      if (response) {
        await loadFiles();
        await loadAllFolders();
        toast.success(`File "${file.name}" uploaded successfully`);
      } else {
        toast.error("Failed to upload file - no response data");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(`Error uploading file: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFolderCreated = async (folderName) => {
    if (!folderName || !folderName.trim()) {
      toast.error("Folder name is required");
      return;
    }

    setLoading(true);
    try {
      console.log('Creating folder:', folderName, 'in parent:', folderId);

      const response = await fileApi.createFolder(folderName.trim(), folderId || null);

      console.log('Create folder response:', response);

      // Handle the nested response structure properly
      if (response && response.status === 'ok') {
        if (response.folder && response.folder.status === 'error') {
          // Handle folder creation error
          toast.error(response.folder.message || "Failed to create folder");
          return;
        }

        // Folder created successfully
        await loadFiles();
        await loadAllFolders();
        toast.success(`Folder "${folderName}" created successfully`);

        // Dispatch custom event for any listeners
        window.dispatchEvent(new CustomEvent("folderCreated", {
          detail: { folderName, folderId, response }
        }));
      } else if (response && response.status === 'error') {
        // Handle general error response
        toast.error(response.message || "Failed to create folder");
      } else {
        toast.error("Failed to create folder - unexpected response format");
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      // Check if it's a permission error
      if (error.message && error.message.includes("admin")) {
        toast.error("Only administrators can create folders in the root directory. Please navigate to a subfolder or contact your admin.");
      } else {
        toast.error(`Error creating folder: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMoveToTrash = async (fileId) => {
    if (!fileId) {
      toast.error("Invalid file ID");
      return;
    }

    try {
      console.log('Moving to trash:', fileId);

      await fileApi.deleteItem(fileId);
      await loadFiles();
      await loadAllFolders();

      toast.success("Item moved to trash");
    } catch (error) {
      console.error("Error moving item to trash:", error);
      toast.error(`Error moving to trash: ${error.message}`);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    if (!fileId) {
      toast.error("Invalid file ID");
      return;
    }

    try {
      console.log('Downloading file:', fileId, fileName);

      const response = await fileApi.getDownloadUrl(fileId);

      console.log('Download URL response:', response);

      if (response && response.download_url) {
        const link = document.createElement('a');
        link.href = response.download_url;
        link.download = fileName || 'download';
        link.target = '_blank';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success(`Downloaded ${fileName}`);
      } else {
        toast.error("Failed to get download URL");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error(`Error downloading file: ${error.message}`);
    }
  };



  // Handle search input changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, folderId]);

  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '*/*';

    input.onchange = (event) => {
      const selectedFiles = Array.from(event.target.files);
      console.log('Selected files for upload:', selectedFiles);

      if (selectedFiles.length === 0) {
        return;
      }

      const uploadFiles = async () => {
        for (const file of selectedFiles) {
          await handleFileUploaded(file);
        }
      };

      uploadFiles();
    };

    input.click();
  };

  const handleNewFolder = () => {
    const folderName = prompt("Enter folder name:");
    if (folderName && folderName.trim()) {
      handleFolderCreated(folderName.trim());
    }
  };

  // Debug logging
  useEffect(() => {
    console.log('Current state:', {
      currentPath,
      folderId,
      loading,
      filesCount: files.length,
      foldersCount: folders.length,
      allFoldersCount: allFolders.length
    });
  }, [currentPath, folderId, loading, files.length, folders.length, allFolders.length]);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Page Content */}
        <main className="flex-1 p-6">
          {children || (
            <div className="space-y-6">


              {/* Quick Actions */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>

                <div className="flex items-center gap-3">
                  <Button
                    // variant="cloudvault-primary"
                    onClick={handleUpload}
                    disabled={loading}
                    className="px-6 py-2 bg-panel hover:bg-panel/50 text-white"
                  >
                    <Upload className="w-4 h-4" />
                    {loading ? "Uploading..." : "Upload"}
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={handleNewFolder}
                    disabled={loading}
                    className="px-6 py-2"
                  >
                    <FolderPlus className="w-4 h-4" />
                    New Folder
                  </Button>
                </div>
              </div>


              {/* Files Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-foreground">Files & Folders</h2>
                  {loading && (
                    <div className="text-sm text-muted-foreground">Loading...</div>
                  )}
                </div>

                {/* Folders Grid */}
                {folders.length > 0 && (
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    {folders.map((folder) => (
                      <button
                        key={folder.id}
                        onClick={() => navigate(`/folder/${folder.id}`)}
                        className="flex items-center gap-2 p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer text-left transition-colors group"
                      >
                        <Folder className="w-5 h-5 text-panel group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium truncate">
                          {folder.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* File Table */}
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="bg-muted px-4 py-3 border-b border-border">
                    <div className="grid grid-cols-5 gap-4 text-sm font-medium text-muted-foreground">
                      <div>Name</div>
                      <div>Size</div>
                      <div>Type</div>
                      <div>Modified</div>
                      <div>Actions</div>
                    </div>
                  </div>

                  <div className="divide-y divide-border">
                    {loading ? (
                      <div className="px-4 py-8 text-center text-muted-foreground">
                        Loading files...
                      </div>
                    ) : files.length === 0 && folders.length === 0 ? (
                      <div className="px-4 py-8 text-center text-muted-foreground">
                        {searchQuery ? `No files found matching "${searchQuery}"` : "No files found"}
                      </div>
                    ) : files.length === 0 ? (
                      <div className="px-4 py-8 text-center text-muted-foreground">
                        No files in this folder
                      </div>
                    ) : (
                      files.map((file) => (
                        <div
                          key={file.id}
                          className="px-4 py-3 hover:bg-muted/50 cursor-pointer group"
                        >
                          <div className="grid grid-cols-5 gap-4 text-sm items-center">
                            <div className="flex items-center">
                              {getFileIcon(file.name, file.type)}
                              <span className="text-foreground truncate">
                                {file.name}
                              </span>
                            </div>
                            <div className="text-muted-foreground">
                              {file.size ? formatFileSize(file.size) : '-'}
                            </div>
                            <div className="text-muted-foreground capitalize">
                              {file.name?.split('.').pop()?.toUpperCase() || 'FILE'}
                            </div>
                            <div className="text-muted-foreground">
                              {file.updated_at ? formatDate(file.updated_at) : '-'}
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(file.id, file.name);
                                }}
                                className="h-8 w-8 p-0"
                                title="Download"
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveToTrash(file.id);
                                }}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                title="Delete"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}