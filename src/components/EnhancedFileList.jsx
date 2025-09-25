import React, { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { fileApi } from "../services/FileService";
import { toast } from "sonner";
import MoveFileModal from "./MoveFileModal";
import FileUploadModal from "./FileUploadModal";
import NewFolderModal from "./NewFolderModal";
import { starService } from "../services/Starredservice";
import { trashService } from "../services/trashservice";
import EmptyState from "@/components/ui/EmptyState";

export default function EnhancedFileList({ searchQuery }) {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
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

  useEffect(() => {
    loadFiles();
  }, [folderId]);

  useEffect(() => {
    const handleFileUploaded = () => loadFiles();
    const handleFolderCreated = () => loadFiles();
    const handleFilesMoved = () => loadFiles();

    window.addEventListener("fileUploaded", handleFileUploaded);
    window.addEventListener("folderCreated", handleFolderCreated);
    window.addEventListener("filesMoved", handleFilesMoved);

    return () => {
      window.removeEventListener("fileUploaded", handleFileUploaded);
      window.removeEventListener("folderCreated", handleFolderCreated);
      window.removeEventListener("filesMoved", handleFilesMoved);
    };
  }, []);

  // Helper function to determine file type from filename or type field
  const getFileTypeFromItem = (item) => {
    // If it's a folder, return folder type
    if (item.type === 'folder') {
      return 'folder';
    }

    // For files, determine type from filename extension
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
    
    return 'document'; // default
  };

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  // Get current folder information
  const getCurrentFolder = () => {
    if (!folderId) {
      return {
        id: null,
        name: "Root",
        path: "/",
        fullPath: "Root"
      };
    }

    if (currentFolder) {
      return {
        id: folderId,
        name: currentFolder.name || `Folder ${folderId}`,
        path: `/folder/${folderId}`,
        fullPath: buildFolderPath(currentFolder)
      };
    }

    return {
      id: folderId,
      name: `Folder ${folderId}`,
      path: `/folder/${folderId}`,
      fullPath: `Root / Folder ${folderId}`
    };
  };

  // Build folder path for display
  const buildFolderPath = (folder) => {
    if (!folder) return "Root";
    
    // If folder has parent information, build the path
    if (folder.parent_name) {
      return `Root / ${folder.parent_name} / ${folder.name}`;
    }
    
    return `Root / ${folder.name}`;
  };

  const loadFiles = async () => {
    try {
      setLoading(true);
      const response = await fileApi.listFiles(folderId);
      
      // Handle the response structure you provided
      if (response.status === 'ok' && Array.isArray(response.data)) {
        let filesData = response.data;
        
        // If no folderId is provided, show only root folders
        if (!folderId) {
          // Get all IDs that exist in the data
          const existingIds = new Set(filesData.map(item => item.id));
          
          // Filter to show only items whose parent_id doesn't exist in the data
          // These are the root folders/files
          filesData = filesData.filter(item => !existingIds.has(item.parent_id));
        }
        
        // Try to find current folder info from the data
        if (folderId) {
          const folderInfo = filesData.find(item => item.id.toString() === folderId && item.type === 'folder');
          if (folderInfo) {
            setCurrentFolder(folderInfo);
          }
        }
        
        setFiles(filesData);
      } else if (Array.isArray(response)) {
        // Fallback for when response is directly an array
        let filesData = response;
        
        if (!folderId) {
          const existingIds = new Set(filesData.map(item => item.id));
          filesData = filesData.filter(item => !existingIds.has(item.parent_id));
        }
        
        setFiles(filesData);
      } else {
        console.error("API response is not in expected format:", response);
        setFiles([]);
        toast.error("Received an unexpected response from the server.");
      }
      
      console.log("response::", response);
      console.log("filtered files::", files); 
    } catch (error) {
      console.error("Error loading files:", error);
      toast.error("Error loading files");
    } finally {
      setLoading(false);
    }
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery?.toLowerCase() || "")
  );

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
      // Navigate to the folder
      navigate(`/folder/${item.id}`);
    } else {
      // For files, you might want to preview or download
      // For now, let's just download the file
      handleDownloadFile(item.id, item.name);
    }
  };

  const handleStarFile = async (fileId) => {
    try {
      const response = await starService.toggleStar(fileId);
      if (response.success) {
        toast.success("File starred");
        loadFiles();
      } else toast.error("Failed to star file");
    } catch (error) {
      console.error("Error starring file:", error);
      toast.error("Error starring file");
    }
  };

  const handleDownloadFile = async (fileId, fileName) => {
    try {
      const response = await fileApi.getDownloadUrl(fileId);
      if (response.success) toast.success(`Downloaded ${fileName}`);
      else toast.error("Failed to download file");
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Error downloading file");
    }
  };

  const handleMoveFile = (fileId, fileName) => {
    setSelectedFileForMove({ id: fileId, name: fileName });
    setMoveModalOpen(true);
  };

  const handleRenameItem = (item) => {
    setSelectedItemForRename(item);
    setNewName(item.name);
    setRenameModalOpen(true);
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

  const handleTrashFile = async (fileId) => {
    try {
      const response = await trashService.moveToTrash(fileId);
      if (response.success) {
        toast.success("File moved to trash");
        loadFiles();
      } else toast.error("Failed to move file to trash");
    } catch (error) {
      console.error("Error moving file to trash:", error);
      toast.error("Error moving file to trash");
    }
  };

  const handleDragStart = (e, fileId) => {
    e.dataTransfer.setData("text/plain", fileId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetFolderId) => {
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

  // Handle file upload success
  const handleFileUploaded = () => {
    loadFiles();
    window.dispatchEvent(new CustomEvent("fileUploaded"));
  };

  // Handle folder creation
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

  return (
    <div className="space-y-4">
      {/* Header with action buttons */}
      <div className="flex justify-end gap-2">
        <Button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload Files
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowNewFolderModal(true)}
          className="flex items-center gap-2"
        >
          <FolderPlus className="w-4 h-4" />
          New Folder
        </Button>
      </div>

      <div className="rounded-md border">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-panel"></div>
          </div>
        ) : (
          <>
            {filteredFiles.length === 0 ? (
              <EmptyState />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Type</TableHead>
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
                          className={`flex items-center gap-2 ${
                            item.type === 'folder' 
                              ? 'cursor-pointer' 
                              : 'cursor-move'
                          }`}
                          draggable={item.type !== 'folder'}
                          onDragStart={(e) => item.type !== 'folder' && handleDragStart(e, item.id)}
                          onDragOver={item.type === 'folder' ? handleDragOver : undefined}
                          onDrop={item.type === 'folder' ? (e) => handleDrop(e, item.id) : undefined}
                          onClick={() => item.type === 'folder' && handleItemClick(item)}
                        >
                          {getFileIcon(getFileTypeFromItem(item))}
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
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(item.updated_at)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.type === 'folder' ? '-' : formatFileSize(item.size)}
                      </TableCell>
                      <TableCell>
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
                              className="h-8 w-8 p-0"
                            >
                              <Download className="w-4 h-4" />
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
                              <DropdownMenuItem onClick={() => handleStarFile(item.id)}>
                                <Star className="w-4 h-4 mr-2" />
                                {item.is_starred ? "Unstar" : "Star"}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRenameItem(item)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              {item.type === 'file' && (
                                <DropdownMenuItem
                                  onClick={() => handleDownloadFile(item.id, item.name)}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleMoveFile(item.id, item.name)}
                              >
                                <ArrowRightLeft className="w-4 h-4 mr-2" />
                                Move
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleTrashFile(item.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Move to Trash
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
      </div>

      {/* Rename Modal */}
      <Dialog open={renameModalOpen} onOpenChange={setRenameModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
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
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameSubmit} disabled={renaming}>
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
          }}
        />
      )}
    </div>
  );
}