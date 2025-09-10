import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { apiService, FileItem } from "@/services/api";
import { toast } from "sonner";
import MoveFileModal from "./MoveFileModal";

interface EnhancedFileListProps {
  searchQuery?: string;
  onFolderCreated?: () => void;
}

export default function EnhancedFileList({
  searchQuery,
}: EnhancedFileListProps) {
  const { folderId } = useParams();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [selectedFileForMove, setSelectedFileForMove] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    loadFiles();
  }, [folderId]);

  useEffect(() => {
    const handleFileUploaded = () => {
      loadFiles();
    };

    const handleFolderCreated = () => {
      loadFiles();
    };

    const handleFilesMoved = () => {
      loadFiles();
    };

    window.addEventListener("fileUploaded", handleFileUploaded);
    window.addEventListener("folderCreated", handleFolderCreated);
    window.addEventListener("filesMoved", handleFilesMoved);

    return () => {
      window.removeEventListener("fileUploaded", handleFileUploaded);
      window.removeEventListener("folderCreated", handleFolderCreated);
      window.removeEventListener("filesMoved", handleFilesMoved);
    };
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const response = await apiService.getFiles(folderId);
      if (response.success) {
        setFiles(response.data);
      }
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

  const getFileIcon = (type: string) => {
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
        return <Folder className="w-4 h-4 text-blue-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleStarFile = async (fileId: string) => {
    try {
      const response = await apiService.starFile(fileId);
      if (response.success) {
        toast.success("File starred");
        loadFiles();
      } else {
        toast.error("Failed to star file");
      }
    } catch (error) {
      console.error("Error starring file:", error);
      toast.error("Error starring file");
    }
  };

  const handleDownloadFile = async (fileId: string, fileName: string) => {
    try {
      const response = await apiService.downloadFile(fileId);
      if (response.success) {
        toast.success(`Downloaded ${fileName}`);
      } else {
        toast.error("Failed to download file");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Error downloading file");
    }
  };

  const handleMoveFile = (fileId: string, fileName: string) => {
    setSelectedFileForMove({ id: fileId, name: fileName });
    setMoveModalOpen(true);
  };

  const handleTrashFile = async (fileId: string) => {
    try {
      const response = await apiService.moveToTrash(fileId);
      if (response.success) {
        toast.success("File moved to trash");
        loadFiles();
      } else {
        toast.error("Failed to move file to trash");
      }
    } catch (error) {
      console.error("Error moving file to trash:", error);
      toast.error("Error moving file to trash");
    }
  };

  const handleShareFile = async (fileId: string) => {
    try {
      const email = prompt("Enter email address to share with:");
      if (email) {
        const response = await apiService.shareFile(fileId, email);
        if (response.success) {
          toast.success("File shared successfully");
        } else {
          toast.error("Failed to share file");
        }
      }
    } catch (error) {
      console.error("Error sharing file:", error);
      toast.error("Error sharing file");
    }
  };

  const handleDragStart = (e: React.DragEvent, fileId: string) => {
    e.dataTransfer.setData("text/plain", fileId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-panel"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Last Modified</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFiles.map((file) => (
              <TableRow key={file.id} className="hover:bg-muted/50">
                <TableCell>
                  <div
                    className="flex items-center gap-2 cursor-move"
                    draggable
                    onDragStart={(e) => handleDragStart(e, file.id)}
                  >
                    {getFileIcon(file.type)}
                    <span className="font-medium">{file.name}</span>
                    {file.starred && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {file.owner}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {file.lastModified}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {file.size}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {file.shared && <Badge variant="secondary">Shared</Badge>}
                    {file.starred && <Badge variant="outline">Starred</Badge>}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadFile(file.id, file.name)}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-48 bg-popover border border-border"
                      >
                        <DropdownMenuItem
                          onClick={() => handleStarFile(file.id)}
                        >
                          <Star className="w-4 h-4 mr-2" />
                          {file.starred ? "Unstar" : "Star"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDownloadFile(file.id, file.name)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleMoveFile(file.id, file.name)}
                        >
                          <ArrowRightLeft className="w-4 h-4 mr-2" />
                          Move
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleShareFile(file.id)}
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleTrashFile(file.id)}
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
      </div>

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
