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
  Share
} from "lucide-react";
// import { FileItem as FileItemType } from "@/lib/api";
import { formatFileSize, formatDate, getFileIcon } from "@/services/FileService";


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
  onManagePermissions,
  depth = 0 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleItemClick = () => {
    if (item.type === 'folder') {
      setIsExpanded(!isExpanded);
      onSelect?.(item);
    } else {
      onSelect?.(item);
    }
  };

  const marginLeft = depth * 24;

  return (
    <div className="animate-fade-in">
      <div 
        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-card-hover transition-colors cursor-pointer group shadow-file"
        style={{ marginLeft: `${marginLeft}px` }}
        onClick={handleItemClick}
      >
        <div className="flex items-center gap-3 flex-1">
          {getFileIconComponent(item.name, item.type)}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-foreground truncate">{item.name}</div>
            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
              {item.type === 'file' && item.size && (
                <span>{formatFileSize(item.size)}</span>
              )}
              <span>{formatDate(item.created_at)}</span>
              {item.owner && (
                <span>by {item.owner.name}</span>
              )}
            </div>
          </div>
          
          {/* User avatars for permissions */}
          {item.type === 'folder' && (
            <div className="flex -space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Avatar className="h-6 w-6 border-2 border-background">
                <AvatarFallback className="text-xs bg-primary-light text-primary">
                  <Users className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="ghost" 
              size="sm" 
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {item.type === 'file' && onDownload && (
              <DropdownMenuItem onClick={() => onDownload(item.id)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>
              <Edit className="h-4 w-4 mr-2" />
              Rename
            </DropdownMenuItem>
            {onMove && (
              <DropdownMenuItem onClick={() => onMove(item.id)}>
                <Move className="h-4 w-4 mr-2" />
                Move
              </DropdownMenuItem>
            )}
            {onManagePermissions && (
              <DropdownMenuItem onClick={() => onManagePermissions(item)}>
                <Share className="h-4 w-4 mr-2" />
                Manage Access
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {onDelete && (
              <DropdownMenuItem 
                onClick={() => onDelete(item.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
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
              onManagePermissions={onManagePermissions}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}