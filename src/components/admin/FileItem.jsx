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
    link.download = item.name || 'file'; // Suggested file name
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


  const marginLeft = depth * 24;

  return (
    <div className="animate-fade-in">
      <div 
        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-card-hover transition-smooth cursor-pointer group shadow-file bg-gradient-file"
        style={{ marginLeft: `${marginLeft}px` }}
        onClick={!isRenaming ? handleItemClick : undefined}
      >
        <div className="flex items-center gap-3 flex-1">
          {getFileIconComponent(item.name, item.type)}
          
          <div className="flex-1 min-w-0">
            {isRenaming ? (
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
                <Button size="sm" variant="ghost" onClick={handleRename}>
                  <Check className="h-4 w-4 text-success" />
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancelRename}>
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ) : (
              <>
<div className="font-medium text-foreground truncate overflow-hidden whitespace-nowrap max-w-[150px] sm:max-w-[200px] md:max-w-[450px]
">
  {item.name}
</div>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  {item.type === 'file' && item.size && (
                    <span>{formatFileSize(item.size)}</span>
                  )}
                  <span>{formatDate(item.created_at)}</span>
                  {item.owner && (
                    <span>by {item.owner.name}</span>
                  )}
                </div>
              </>
            )}
          </div>
          
          {/* User avatars for permissions */}
          {item.type === 'folder' && !isRenaming && (
            <div className="flex -space-x-2 opacity-0 group-hover:opacity-100 transition-smooth">
              <Avatar 
                className="h-6 w-6 border-2 border-background cursor-pointer hover:scale-110 transition-smooth"
                onClick={(e) => {
                  e.stopPropagation();
                  onManagePermissions?.(item);
                }}
              >
                <AvatarFallback className="text-xs bg-primary-light text-primary">
                  <Users className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>

        {!isRenaming && (
          <>
            {/* Quick download button for files */}
            {item.type === 'file' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
                className="opacity-0 group-hover:opacity-100 transition-smooth mr-2"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100 transition-smooth"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
                {item.type === 'file' && (
                  <>
                    {/* <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPreview?.(item); }}>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </DropdownMenuItem> */}
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDownload(); }}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setIsRenaming(true); }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                {onMove && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMove(item.id); }}>
                    <Move className="h-4 w-4 mr-2" />
                    Move
                  </DropdownMenuItem>
                )}
                {onManagePermissions && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onManagePermissions(item); }}>
                    <Share className="h-4 w-4 mr-2" />
                    Manage Access
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
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