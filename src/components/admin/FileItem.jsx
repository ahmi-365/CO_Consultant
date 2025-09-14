import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Folder, 
  File, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive, 
  MoreHorizontal,
  Download,
  Edit,
  Move,
  Trash2,
  Users,
  Share,
  Eye,
  Check,
  X
} from "lucide-react";
import { formatFileSize, formatDate, getFileIcon } from "@/services/FileService";
import { useToast } from "@/hooks/use-toast";

const getFileIconComponent = (filename, type) => {
  const iconType = getFileIcon(filename, type);
  
  switch (iconType) {
    case 'folder':
      return <Folder className="h-5 w-5 text-folder" />;
    case 'file-text':
      return <FileText className="h-5 w-5 text-file-pdf" />;
    case 'file-spreadsheet':
      return <FileText className="h-5 w-5 text-file-xls" />;
    case 'image':
      return <Image className="h-5 w-5 text-file-img" />;
    case 'video':
      return <Video className="h-5 w-5 text-accent" />;
    case 'music':
      return <Music className="h-5 w-5 text-accent" />;
    case 'archive':
      return <Archive className="h-5 w-5 text-muted-foreground" />;
    default:
      return <File className="h-5 w-5 text-file-doc" />;
  }
};

export default function FileItem({ 
  item, 
  onSelect, 
  onDelete, 
  onMove, 
  onDownload, 
  onRename,
  onManagePermissions,
  onPreview,
  depth = 0 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(item.name);
  const { toast } = useToast();
  
  const handleItemClick = () => {
    if (item.type === 'folder') {
      setIsExpanded(!isExpanded);
      onSelect?.(item);
    } else {
      onSelect?.(item);
    }
  };

  const handleRename = () => {
    if (newName.trim() && newName !== item.name) {
      onRename?.(item.id, newName.trim());
      toast({
        title: "Success",
        description: `${item.type === 'folder' ? 'Folder' : 'File'} renamed successfully`,
      });
    }
    setIsRenaming(false);
  };

  const handleCancelRename = () => {
    setNewName(item.name);
    setIsRenaming(false);
  };

  const handleDownload = () => {
    if (item.type === 'file' && item.download_url) {
      console.log("📥 Starting download:", item.download_url);

      const link = document.createElement('a');
      link.href = item.download_url;
      link.download = item.name || 'file';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: `Downloading ${item.name}`,
      });
    } else {
      console.warn("⚠️ No download URL found for item:", item);
      toast({
        title: "Error",
        description: "Download URL not available",
        variant: "destructive",
      });
    }
  };

  const handleManageAccess = (e) => {
    e.stopPropagation();
    onManagePermissions?.(item);
  };

  const handlePreviewClick = (e) => {
    e.stopPropagation();
    onPreview?.(item);
  };

  const handleMoveClick = (e) => {
    e.stopPropagation();
    onMove?.(item.id);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      onDelete?.(item.id);
    }
  };

  const handleRenameClick = (e) => {
    e.stopPropagation();
    setIsRenaming(true);
  };

  const marginLeft = depth * 24;

  return (
    <div className="animate-fade-in">
     <div 
  className="flex flex-col p-3 border border-border rounded-lg hover:bg-card-hover transition-smooth cursor-pointer group shadow-file bg-gradient-file h-full min-h-[80px]"
  onClick={!isRenaming ? handleItemClick : undefined}
>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {getFileIconComponent(item.name, item.type)}
            
            <div className="flex-1 min-w-0">
              {isRenaming ? (
                // Rename input section
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename();
                      if (e.key === 'Escape') handleCancelRename();
                    }}
                    className="h-8 text-sm flex-1"
                    autoFocus
                  />
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={handleRename}>
                      <Check className="h-4 w-4 text-success" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCancelRename}>
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="font-medium text-foreground truncate text-sm" title={item.name}>
                  {item.name}
                </div>
              )}
            </div>
          </div>

          {/* Actions section */}
          {!isRenaming && (
            <div className="flex items-center gap-1">
              {/* User permissions icon for folders */}
              {item.type === 'folder' && (
                <Avatar 
                  className="h-6 w-6 border-2 border-background cursor-pointer hover:scale-110 transition-smooth opacity-0 group-hover:opacity-100"
                  onClick={handleManageAccess}
                >
                  <AvatarFallback className="text-xs bg-primary-light text-primary">
                    <Users className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
              )}

              {/* Quick download for files - removed hover opacity */}
              {item.type === 'file' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload();
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}

              {/* More options dropdown - removed hover opacity */}
           <DropdownMenu>
  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
    <Button 
      variant="ghost" 
      size="sm" 
      className="h-8 w-8 p-0 cursor-pointer"
    >
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>

  <DropdownMenuContent align="end" className="w-48">
    {item.type === 'file' && (
      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDownload(); }} className="cursor-pointer">
        <Download className="h-4 w-4 mr-2" />
        Download
      </DropdownMenuItem>
    )}

    <DropdownMenuItem onClick={handleManageAccess} className="cursor-pointer">
      <Users className="h-4 w-4 mr-2" />
      Manage Access
    </DropdownMenuItem>

    <DropdownMenuItem onClick={handleRenameClick} className="cursor-pointer">
      <Edit className="h-4 w-4 mr-2" />
      Rename
    </DropdownMenuItem>

    <DropdownMenuItem onClick={handleMoveClick} className="cursor-pointer">
      <Move className="h-4 w-4 mr-2" />
      Move
    </DropdownMenuItem>

    <DropdownMenuSeparator />

    <DropdownMenuItem onClick={handleDeleteClick} className="text-destructive cursor-pointer">
      <Trash2 className="h-4 w-4 mr-2" />
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

            </div>
          )}
        </div>

        {/* File info section */}
        {!isRenaming && (
          <div className="mt-auto">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                {item.type === 'file' && item.size && (
                  <span>{formatFileSize(item.size)}</span>
                )}
                <span>{formatDate(item.created_at)}</span>
              </div>
              {item.owner && (
                <span className="truncate max-w-[80px]" title={item.owner.name}>
                  {item.owner.name}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Render sub-items if folder is expanded */}
      {item.type === 'folder' && isExpanded && item.items && (
        <div className="mt-2 space-y-2">
          {item.items.map((subItem) => (
            <FileItem
              key={subItem.id}
              item={subItem}
              onSelect={onSelect}
              onDelete={onDelete}
              onMove={onMove}
              onDownload={onDownload}
              onRename={onRename}
              onManagePermissions={onManagePermissions}
              onPreview={onPreview}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}