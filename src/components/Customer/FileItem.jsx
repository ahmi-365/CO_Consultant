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
  X,
  Loader2,
  Star
} from "lucide-react";
import { formatFileSize, formatDate, getFileIcon } from "@/services/FileService";
import { starService } from "@/services/StarredService"; // Fixed: Consistent naming
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
  onStarChange, 
  isDeleting = false,
  isDownloading = false,
  isRenaming = false,
  isMoving = false,
  depth = 0,
  isSelectionMode = false,
  isSelected = false,
  onSelectionChange,
}) {
  console.log('FileItem Debug:', {
    fileName: item.name,
    fileType: item.type,
    hasStarChange: !!onStarChange,
    isStarred: item.is_starred,
    isSelectionMode
  });
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRenamingLocal, setIsRenamingLocal] = useState(false);
  const [newName, setNewName] = useState(item.name);
  const [isStarring, setIsStarring] = useState(false);
  const [isStarred, setIsStarred] = useState(item.is_starred || false);
  const { toast } = useToast();
  
  const handleItemClick = () => {
    // Prevent clicking when any operation is in progress
    if (isDeleting || isDownloading || isRenaming || isMoving || isStarring) {
      return;
    }
    
    if (item.type === 'folder') {
      setIsExpanded(!isExpanded);
      onSelect?.(item);
    } else {
      onSelect?.(item);
    }
  };

  const handleCheckboxChange = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const isChecked = e.target.checked;
    console.log('Checkbox changed:', item.id, isChecked);
    onSelectionChange?.(item.id, isChecked);
  };

  const handleStarToggle = async (e) => {
    e.stopPropagation(); 

    if (isStarring || item.type === 'folder') {
      return; 
    }

    console.log("handleStarToggle called for item:", item.id, "Current starred state:", isStarred); 

    setIsStarring(true); 
    const previousState = isStarred;

    try {
      // Optimistically update UI
      setIsStarred(!isStarred);
      console.log("Calling starService.toggleStar with itemId:", item.id); 
      
      const result = await starService.toggleStar(item.id);
      console.log("API response from toggleStar:", result); 

      if (result && result.success !== false) { 
        const newStarredState = result.is_starred !== undefined ? result.is_starred : !previousState;
        setIsStarred(newStarredState); 

        // Call parent's star change handler
        onStarChange?.(item.id, newStarredState); 

        toast({
          title: "Success",
          description: newStarredState ? "File starred" : "File unstarred",
        });
      } else {
        console.error("API reported an error or failed success:", result); 
        setIsStarred(previousState); 
        toast({
          title: "Error",
          description: result?.error || "Failed to toggle star (API error)",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Network or unexpected error during star toggle:", error); 
      setIsStarred(previousState); 
      toast({
        title: "Error",
        description: "Failed to toggle star (network error)",
        variant: "destructive",
      });
    } finally {
      setIsStarring(false); 
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
    setIsRenamingLocal(false);
  };

  const handleCancelRename = () => {
    setNewName(item.name);
    setIsRenamingLocal(false);
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    if (item.type === 'file' && !isDownloading) {
      onDownload?.(item.id, item.name);
    } else if (item.type === 'folder') {
      toast({
        title: "Error",
        description: "Cannot download folders",
        variant: "destructive",
      });
    }
  };

  const handleManageAccess = (e) => {
    e.stopPropagation();
    if (!isAnyOperationInProgress) {
      onManagePermissions?.(item);
    }
  };

  const handlePreviewClick = (e) => {
    e.stopPropagation();
    if (!isAnyOperationInProgress) {
      onPreview?.(item);
    }
  };

  const handleMoveClick = (e) => {
    e.stopPropagation();
    if (!isAnyOperationInProgress) {
      onMove?.(item.id);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (!isAnyOperationInProgress) {
      if (window.confirm(`Are you sure you want to move "${item.name}" to trash?`)) {
        onDelete?.(item.id);
      }
    }
  };

  const handleRenameClick = (e) => {
    e.stopPropagation();
    if (!isAnyOperationInProgress) {
      setIsRenamingLocal(true);
    }
  };

  const isAnyOperationInProgress = isDeleting || isDownloading || isRenaming || isMoving || isStarring;

  return (
    <div className="animate-fade-in">
      <div 
        className={`flex flex-col p-3 border border-border rounded-lg hover:bg-card-hover transition-smooth cursor-pointer group shadow-file bg-gradient-file h-full min-h-[80px] ${
          isAnyOperationInProgress ? 'opacity-60 pointer-events-none' : ''
        }`}
        onClick={!isRenamingLocal ? handleItemClick : undefined}
      >
        
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {isSelectionMode && (
              <div onClick={(e) => e.stopPropagation()}> 
                <input
                  type="checkbox"
                  checked={isSelected || false}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                />
              </div>
            )}
            {getFileIconComponent(item.name, item.type)}
            
            <div className="flex-1 min-w-0">
              {isRenamingLocal ? (
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
                    disabled={isRenaming}
                  />
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={handleRename}
                      disabled={isRenaming}
                    >
                      {isRenaming ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 text-success" />
                      )}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={handleCancelRename}
                      disabled={isRenaming}
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="font-medium text-foreground truncate text-sm flex items-center gap-2" title={item.name}>
                  {item.name}
                  {/* Operation indicators */}
                  {isDeleting && (
                    <div className="flex items-center gap-1 text-destructive">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="text-xs">Deleting...</span>
                    </div>
                  )}
                  {isRenaming && (
                    <div className="flex items-center gap-1 text-orange-600">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="text-xs">Renaming...</span>
                    </div>
                  )}
                  {isMoving && (
                    <div className="flex items-center gap-1 text-purple-600">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="text-xs">Moving...</span>
                    </div>
                  )}
                  {isStarring && (
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="text-xs">Updating...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions section */}
          {!isRenamingLocal && (
            <div className="flex items-center gap-1">
              {/* Star button - Always show for debugging, then add file condition */}
          {item.type === 'file' && (
  <Button
    variant="ghost"
    size="sm"
    onClick={handleStarToggle}
    className="h-8 w-8 p-0"
    disabled={isAnyOperationInProgress}
    title={isStarred ? "Unstar file" : "Star file"}
  >
    {isStarring ? (
      <Loader2 className="h-4 w-4 animate-spin" />
    ) : (
      <Star 
        className={`h-4 w-4 transition-colors ${
          isStarred 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-muted-foreground hover:text-yellow-400'
        }`} 
      />
    )}
  </Button>
)}


              {/* Quick download for files */}
              {item.type === 'file' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="h-8 w-8 p-0"
                  disabled={isAnyOperationInProgress}
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
              )}

              {/* More options dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 cursor-pointer"
                    disabled={isAnyOperationInProgress}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  {item.type === 'file' && (
                    <>
                      <DropdownMenuItem 
                        onClick={handleStarToggle}
                        className="cursor-pointer"
                        disabled={isAnyOperationInProgress}
                      >
                        {isStarring ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Star className={`h-4 w-4 mr-2 ${isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                        )}
                        {isStarring ? 'Updating...' : (isStarred ? 'Unstar' : 'Star')}
                      </DropdownMenuItem>

                      <DropdownMenuItem 
                        onClick={handleDownload}
                        className="cursor-pointer"
                        disabled={isAnyOperationInProgress}
                      >
                        {isDownloading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        {isDownloading ? 'Downloading...' : 'Download'}
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />
                    </>
                  )}

                  <DropdownMenuItem 
                    onClick={handleRenameClick} 
                    className="cursor-pointer"
                    disabled={isAnyOperationInProgress}
                  >
                    {isRenaming ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Edit className="h-4 w-4 mr-2" />
                    )}
                    {isRenaming ? 'Renaming...' : 'Rename'}
                  </DropdownMenuItem>

                  <DropdownMenuItem 
                    onClick={handleMoveClick} 
                    className="cursor-pointer"
                    disabled={isAnyOperationInProgress}
                  >
                    {isMoving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Move className="h-4 w-4 mr-2" />
                    )}
                    {isMoving ? 'Moving...' : 'Move'}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem 
                    onClick={handleDeleteClick} 
                    className="text-destructive cursor-pointer"
                    disabled={isAnyOperationInProgress}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    {isDeleting ? 'Deleting...' : 'Trash'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* File info section */}
        {!isRenamingLocal && (
          <div className="mt-auto">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                {item.type === 'file' && item.size && (
                  <span>{formatFileSize(item.size)}</span>
                )}
                <span>{formatDate(item.created_at)}</span>
                {/* Star indicator in file info */}
             {item.type === 'file' && isStarred && (
  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
)}


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
              onStarChange={onStarChange}
              depth={depth + 1}
              isSelectionMode={isSelectionMode}
              isSelected={isSelected}
              onSelectionChange={onSelectionChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}