import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Home,
  Users,
  Star,
  Trash2,
  Upload,
  User,
  FileText,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiService } from "@/services/api";
import { toast } from "sonner";

export default function EnhancedSidebar({ onUploadClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const [folders, setFolders] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  const isActive = (path) => currentPath === path;

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      const response = await apiService.getFolders();
      if (response.success) {
        const foldersWithState = response.data.map((folder) => ({
          ...folder,
          children: [],
          files: [],
          isExpanded: false,
          isLoading: false,
        }));
        setFolders(foldersWithState);
      }
    } catch (error) {
      console.error("Error loading folders:", error);
      toast.error("Error loading folders");
    }
  };

  const loadFolderContents = async (folderId) => {
    try {
      const foldersResponse = await apiService.getFolders(folderId);
      const filesResponse = await apiService.getFiles(folderId);

      if (foldersResponse.success && filesResponse.success) {
        setFolders((prevFolders) =>
          updateFolderInTree(prevFolders, folderId, {
            children: foldersResponse.data.map((folder) => ({
              ...folder,
              children: [],
              files: [],
              isExpanded: false,
              isLoading: false,
            })),
            files: filesResponse.data,
            isLoading: false,
          })
        );
      }
    } catch (error) {
      console.error("Error loading folder contents:", error);
      toast.error("Error loading folder contents");
    }
  };

  const updateFolderInTree = (folders, folderId, updates) => {
    return folders.map((folder) => {
      if (folder.id === folderId) return { ...folder, ...updates };
      if (folder.children && folder.children.length > 0) {
        return {
          ...folder,
          children: updateFolderInTree(folder.children, folderId, updates),
        };
      }
      return folder;
    });
  };

  const toggleFolder = async (folderId) => {
    const newExpanded = new Set(expandedFolders);
    const isCurrentlyExpanded = newExpanded.has(folderId);

    if (isCurrentlyExpanded) newExpanded.delete(folderId);
    else {
      newExpanded.add(folderId);
      setFolders((prev) =>
        updateFolderInTree(prev, folderId, { isLoading: true })
      );
      await loadFolderContents(folderId);
    }

    setExpandedFolders(newExpanded);
  };

  const handleFolderClick = (folderId) => navigate(`/folder/${folderId}`);
  const handleFileClick = (fileId) => console.log("File clicked:", fileId);

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await apiService.downloadFile(fileId);
      if (response.success) toast.success(`Downloaded ${fileName}`);
      else toast.error("Failed to download file");
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Error downloading file");
    }
  };

  const handleDrop = async (e, folderId) => {
    e.preventDefault();
    const fileId = e.dataTransfer.getData("text/plain");
    try {
      const response = await apiService.moveFile(fileId, folderId);
      if (response.success) {
        toast.success("File moved successfully");
        window.dispatchEvent(new CustomEvent("filesMoved"));
      } else toast.error("Failed to move file");
    } catch (error) {
      console.error("Error moving file:", error);
      toast.error("Error moving file");
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const renderFile = (file, level) => (
    <div key={file.id} className="flex items-center gap-1" style={{ marginLeft: `${(level + 1) * 16}px` }}>
      <div className="w-3 h-3" />
      <button
        onClick={() => handleFileClick(file.id)}
        className="flex items-center gap-2 px-2 py-1 text-sm w-full text-left rounded transition-colors text-sidebar-foreground hover:bg-sidebar-accent/50 group"
      >
        <FileText className="w-3 h-3 text-muted-foreground" />
        <span className="truncate flex-1">{file.name}</span>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 opacity-100 hover:bg-sidebar-accent"
          onClick={(e) => {
            e.stopPropagation();
            handleDownload(file.id, file.name);
          }}
        >
          <Download className="w-3 h-3" />
        </Button>
      </button>
    </div>
  );

  const renderFolder = (folder, level = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isCurrentFolder = currentPath === `/folder/${folder.id}`;

    return (
      <div key={folder.id} className="space-y-1">
        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleFolder(folder.id)}
            className="p-0.5 hover:bg-sidebar-accent rounded transition-colors"
            disabled={folder.isLoading}
          >
            {folder.isLoading ? (
              <div className="w-3 h-3 animate-spin border border-sidebar-foreground/60 border-t-transparent rounded-full" />
            ) : isExpanded ? (
              <ChevronDown className="w-3 h-3 text-sidebar-foreground/60" />
            ) : (
              <ChevronRight className="w-3 h-3 text-sidebar-foreground/60" />
            )}
          </button>
          <button
            onClick={() => handleFolderClick(folder.id)}
            onDrop={(e) => handleDrop(e, folder.id)}
            onDragOver={handleDragOver}
            className={`flex items-center gap-2 px-2 py-1 text-sm w-full text-left rounded transition-colors ${
              isCurrentFolder
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            }`}
            style={{ marginLeft: `${level * 16}px` }}
          >
            {isExpanded ? (
              <FolderOpen className="w-4 h-4 text-panel" />
            ) : (
              <Folder className="w-4 h-4 text-panel" />
            )}
            <span className="truncate">{folder.name}</span>
          </button>
        </div>

        {isExpanded && (
          <div className="space-y-1">
            {folder.children && folder.children.map((child) => renderFolder(child, level + 1))}
            {folder.files && folder.files.map((file) => renderFile(file, level + 1))}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    const handleFolderCreated = () => loadFolders();
    const handleFilesMoved = () => loadFolders();

    window.addEventListener("folderCreated", handleFolderCreated);
    window.addEventListener("filesMoved", handleFilesMoved);
    return () => {
      window.removeEventListener("folderCreated", handleFolderCreated);
      window.removeEventListener("filesMoved", handleFilesMoved);
    };
  }, []);

  return (
    <div className="w-60 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-panel rounded-full flex items-center justify-center text-panel-foreground font-bold text-sm">
            CV
          </div>
          <span className="font-semibold text-sidebar-foreground">CloudVault</span>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <nav className="space-y-1">
          <button
            onClick={() => navigate("/")}
            className={`flex items-center gap-2 px-3 py-2 w-full text-left rounded-md transition-colors ${
              isActive("/")
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="text-sm">Home</span>
          </button>

          <div className="mt-6">
            <div className="px-3 py-1 text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wide">
              My Files
            </div>
            <div className="mt-2 space-y-1">{folders.map((folder) => renderFolder(folder))}</div>
          </div>

          <div className="mt-8 space-y-1">
            <button
              onClick={() => navigate("/shared")}
              className={`flex items-center gap-2 px-3 py-2 text-sm w-full rounded-md transition-colors ${
                isActive("/shared")
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Shared with me</span>
            </button>
            <button
              onClick={() => navigate("/starred")}
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
              onClick={() => navigate("/trash")}
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
              onClick={() => navigate("/profile")}
              className={`flex items-center gap-2 px-3 py-2 text-sm w-full rounded-md transition-colors ${
                isActive("/profile")
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

      <div className="p-4 border-t border-sidebar-border">
        <Button className="w-full bg-panel hover:bg-panel/90 text-panel-foreground" onClick={onUploadClick}>
          <Upload className="w-4 h-4 mr-2" />
          New Upload
        </Button>
      </div>
    </div>
  );
}
