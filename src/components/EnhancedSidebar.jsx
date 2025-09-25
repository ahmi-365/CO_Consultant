import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
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
import { fileApi } from "../services/FileService";
import { toast } from "sonner";

export default function EnhancedSidebar({ onUploadClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { folderId } = useParams(); // Get folderId from URL
  const currentPath = location.pathname;

  const [allItems, setAllItems] = useState([]);
  const [folders, setFolders] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  const isActive = (path) => currentPath === path;

  useEffect(() => {
    loadAllItems();
  }, []);

  const loadAllItems = async () => {
    try {
      const response = await fileApi.listFiles();
      
      console.log("All items from API:", response);
      
      if (Array.isArray(response)) {
        setAllItems(response);
        const organizedFolders = organizeItemsHierarchically(response);
        setFolders(organizedFolders);
        console.log("Organized folders:", organizedFolders);
      }
    } catch (error) {
      console.error("Error loading items:", error);
      toast.error("Error loading folders");
    }
  };

  const organizeItemsHierarchically = (items) => {
    const itemMap = new Map();
    const rootFolders = [];
    
    items.forEach(item => {
      itemMap.set(item.id, {
        ...item,
        children: [],
        files: [],
        isLoaded: true,
      });
      
      if ((item.parent_id === 1 || item.parent_id === 2 || item.parent_id === null) && item.type === 'folder') {
        rootFolders.push(item.id);
      }
    });
    
    items.forEach(item => {
      if (item.parent_id && itemMap.has(item.parent_id)) {
        const parent = itemMap.get(item.parent_id);
        
        if (item.type === 'folder') {
          parent.children.push(itemMap.get(item.id));
        } else {
          parent.files.push(item);
        }
      }
    });
    
    return rootFolders.map(id => itemMap.get(id)).filter(Boolean);
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

  const handleFileClick = (fileId) => {
    console.log("File clicked:", fileId);
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await fileApi.getDownloadUrl(fileId);
      if (response && response.download_url) {
        const link = document.createElement('a');
        link.href = response.download_url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Downloaded ${fileName}`);
      } else {
        toast.error("Failed to get download URL");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Error downloading file");
    }
  };

  const handleDrop = async (e, folderId) => {
    e.preventDefault();
    const fileId = e.dataTransfer.getData("text/plain");

    if (!fileId) return;

    try {
      await fileApi.moveItem(fileId, folderId);
      toast.success("File moved successfully");
      
      await loadAllItems();
      window.dispatchEvent(new CustomEvent("filesMoved"));
    } catch (error) {
      console.error("Error moving file:", error);
      toast.error("Error moving file");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const renderFile = (file, level) => {
    return (
      <div
        key={file.id}
        className="flex items-center gap-1"
        style={{ marginLeft: `${(level + 1) * 16}px` }}
      >
        <div className="w-3 h-3" />
        <button
          onClick={() => handleFileClick(file.id)}
          className="flex items-center gap-2 px-2 py-1 text-sm w-full text-left rounded transition-colors text-sidebar-foreground hover:bg-sidebar-accent/50 group"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("text/plain", file.id);
          }}
        >
          <FileText className="w-3 h-3 text-muted-foreground" />
          <span className="truncate flex-1" title={file.name}>{file.name}</span>
          {file.is_starred && <Star className="w-3 h-3 text-yellow-400 fill-current" />}
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-sidebar-accent"
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
            className="p-0.5 hover:bg-sidebar-accent rounded transition-colors"
          >
            {isExpanded ? (
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
            <span className="truncate flex-1" title={folder.name}>{folder.name}</span>
            {folder.is_starred && <Star className="w-3 h-3 text-yellow-400 fill-current" />}
          </button>
        </div>

        {isExpanded && (
          <div className="space-y-1">
            {hasChildren &&
              folder.children.map((child) => renderFolder(child, level + 1))}

            {hasFiles &&
              folder.files.map((file) => renderFile(file, level))}

            {!hasChildren && !hasFiles && (
              <div 
                className="text-xs text-sidebar-foreground/60 px-2 py-1"
                style={{ marginLeft: `${(level + 1) * 16}px` }}
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
    const totalFolders = allItems.filter(item => item.type === 'folder').length;
    const totalFiles = allItems.filter(item => item.type === 'file').length;
    return { totalFolders, totalFiles, total: totalFolders + totalFiles };
  };

  useEffect(() => {
    const handleFolderCreated = () => {
      loadAllItems();
    };

    const handleFilesMoved = () => {
      loadAllItems();
    };

    const handleFilesUploaded = () => {
      loadAllItems();
    };

    window.addEventListener("folderCreated", handleFolderCreated);
    window.addEventListener("filesMoved", handleFilesMoved);
    window.addEventListener("filesUploaded", handleFilesUploaded);
    
    return () => {
      window.removeEventListener("folderCreated", handleFolderCreated);
      window.removeEventListener("filesMoved", handleFilesMoved);
      window.removeEventListener("filesUploaded", handleFilesUploaded);
    };
  }, []);

  const stats = getTotalItems();

  return (
    <div className="w-60 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-panel rounded-full flex items-center justify-center text-panel-foreground font-bold text-sm">
            CV
          </div>
          <span className="font-semibold text-sidebar-foreground">
            CloudVault
          </span>
        </div>
        <div className="text-xs text-sidebar-foreground/60 mt-1">
          {stats.total} items ({stats.totalFolders} folders, {stats.totalFiles} files)
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

            <div className="mt-2 space-y-1">
              {folders.length === 0 ? (
                <div className="px-3 py-2 text-sm text-sidebar-foreground/60">
                  No folders found
                </div>
              ) : (
                folders.map((folder) => renderFolder(folder))
              )}
            </div>
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
        <Button
          className="w-full bg-panel hover:bg-panel/90 text-panel-foreground"
          onClick={() => onUploadClick(folderId)}
        >
          <Upload className="w-4 h-4 mr-2" />
          New Upload
        </Button>
      </div>
    </div>
  );
}