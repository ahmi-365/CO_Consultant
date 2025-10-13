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
import { Textarea } from "@/components/ui/textarea";
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
  Code
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

// Helper function to check if folder is a UserRoot folder
const isUserRootFolder = (item) => {
  return item.type === 'folder' && item.name.startsWith('UserRoot_');
};

// Helper function to extract src from iframe code
const extractSrcFromIframe = (iframeCode) => {
  if (!iframeCode) return '';
  // If it's already a URL, return it
  if (iframeCode.startsWith('http')) {
    return iframeCode;
  }
  
  // Extract src from iframe tag
  const srcMatch = iframeCode.match(/src="([^"]*)"/);
  return srcMatch ? srcMatch[1] : iframeCode;
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
  onIframeUpdate,
  isDeleting = false,
  isDownloading = false,
  isRenaming = false,
  isMoving = false,
  depth = 0 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRenamingLocal, setIsRenamingLocal] = useState(false);
  const [newName, setNewName] = useState(item.name);
  const [isIframeDialogOpen, setIsIframeDialogOpen] = useState(false);
  const [iframeUrl, setIframeUrl] = useState(item.iframe_url || "");
  const [isUpdatingIframe, setIsUpdatingIframe] = useState(false);
  const { toast } = useToast();
  
  // Check if this is a UserRoot folder
  const isUserRoot = isUserRootFolder(item);
  
  const handleItemClick = () => {
    // Prevent clicking when any operation is in progress
    if (isDeleting || isDownloading || isRenaming || isMoving) {
      return;
    }
    
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
    if (!isDeleting && !isDownloading && !isRenaming && !isMoving) {
      onManagePermissions?.(item);
    }
  };

  const handlePreviewClick = (e) => {
    e.stopPropagation();
    if (!isDeleting && !isDownloading && !isRenaming && !isMoving) {
      onPreview?.(item);
    }
  };

  const handleMoveClick = (e) => {
    e.stopPropagation();
    if (!isDeleting && !isDownloading && !isRenaming && !isMoving) {
      onMove?.(item);  
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (!isDeleting && !isDownloading && !isRenaming && !isMoving) {
      if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
        onDelete?.(item.id);
      }
    }
  };

  const handleRenameClick = (e) => {
    e.stopPropagation();
    if (!isDeleting && !isDownloading && !isRenaming && !isMoving) {
      setIsRenamingLocal(true);
    }
  };

  // New iframe functionality - only for UserRoot folders
  const handleIframeClick = (e) => {
    e.stopPropagation();
    if (!isDeleting && !isDownloading && !isRenaming && !isMoving && isUserRoot) {
      setIframeUrl(item.iframe_url || "");
      setIsIframeDialogOpen(true);
    }
  };

  const handleIframeUpdate = async () => {
    if (!iframeUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter an iframe URL or code",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingIframe(true);
    try {
      // Call the parent handler which should make the API call
      await onIframeUpdate?.(item.id, iframeUrl.trim());
      
      toast({
        title: "Success",
        description: "Iframe updated successfully",
      });
      setIsIframeDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update iframe",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingIframe(false);
    }
  };


  // Get preview URL for iframe
  const getPreviewUrl = () => {
    if (!iframeUrl) return '';
    return extractSrcFromIframe(iframeUrl);
  };

  const previewUrl = getPreviewUrl();
  const isIframeCode = iframeUrl.includes('<iframe');

  const isAnyOperationInProgress = isDeleting || isDownloading || isRenaming || isMoving;

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
                  {/* Iframe indicator - only for UserRoot folders */}
                  {isUserRoot && item.iframe_url && (
                    <Code className="h-3 w-3 text-blue-500" title="Has embedded iframe" />
                  )}
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
                </div>
              )}
            </div>
          </div>

          {/* Actions section */}
          {!isRenamingLocal && (
            <div className="flex items-center gap-1">
              {/* Iframe button - only for UserRoot folders */}
              {isUserRoot && (
               <Button
  variant="ghost"
  size="sm"
  onClick={handleIframeClick}
  className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
  disabled={isAnyOperationInProgress}
  title="Embed iframe"
>
  <Code className="h-4 w-4 text-gray-600 dark:text-gray-400" />
</Button>
              )}

              {/* User permissions icon for folders */}
              {item.type === 'folder' && (
                <Avatar 
                  className={`h-6 w-6 border-2 border-background cursor-pointer hover:scale-110 transition-smooth opacity-0 group-hover:opacity-100 ${
                    isAnyOperationInProgress ? 'cursor-not-allowed' : ''
                  }`}
                  onClick={handleManageAccess}
                >
                  <AvatarFallback className="text-xs bg-primary-light text-primary">
                    <Users className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
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
  className="h-8 w-8 p-0 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
  disabled={isAnyOperationInProgress}
>
  <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-400" />
</Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  {/* Iframe option in dropdown - only for UserRoot folders */}
                  {isUserRoot && (
                    <DropdownMenuItem 
                      onClick={handleIframeClick}
                      className="cursor-pointer"
                      disabled={isAnyOperationInProgress}
                    >
                      <Code className="h-4 w-4 mr-2" />
                      Embed Iframe
                    </DropdownMenuItem>
                  )}

                  {item.type === 'file' && (
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
                  )}

                  <DropdownMenuItem 
                    onClick={handleManageAccess} 
                    className="cursor-pointer"
                    disabled={isAnyOperationInProgress}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Manage Access
                  </DropdownMenuItem>

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
                    {isDeleting ? 'Deleting...' : 'Delete'}
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
                {/* Iframe indicator in info section - only for UserRoot folders */}
                {isUserRoot && item.iframe_url && (
                  <span className="text-blue-500 flex items-center gap-1">
                    <Code className="h-3 w-3" />
                    Embedded
                  </span>
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

      {/* Iframe Dialog - only relevant for UserRoot folders */}
      {isUserRoot && (
        <Dialog open={isIframeDialogOpen} onOpenChange={setIsIframeDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Embed Iframe</DialogTitle>
              <DialogDescription>
                Paste your iframe code or URL to embed content for "{item.name}"
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="iframe-url" className="text-sm font-medium">
                  Iframe Code or URL
                </label>
                <Textarea
                  id="iframe-url"
                  value={iframeUrl}
                  onChange={(e) => setIframeUrl(e.target.value)}
                  placeholder='Paste iframe code like: <iframe src="https://..." /> or just the URL'
                  className="min-h-[100px] font-mono text-sm resize-vertical"
                />
                <p className="text-xs text-muted-foreground">
                  You can paste full iframe HTML code or just the URL. The system will automatically extract the source URL.
                </p>
              </div>
              
              {iframeUrl && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Preview {previewUrl && `- ${isIframeCode ? 'Extracted URL' : 'Direct URL'}`}
                  </label>
                  <div className="border rounded-md bg-muted/50 min-h-[200px] flex flex-col">
                    {previewUrl ? (
                      <>
                        <div className="flex-1 p-4">
                          <iframe 
                            src={previewUrl} 
                            className="w-full h-64 border-0 rounded"
                            title="Iframe preview"
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                            loading="lazy"
                          />
                        </div>
                        <div className="border-t p-2 bg-background">
                          <p className="text-xs text-muted-foreground break-all">
                            Source: {previewUrl}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center p-4">
                        <div className="text-center text-muted-foreground">
                          <Code className="h-8 w-8 mx-auto mb-2" />
                          <p>Invalid iframe code or URL</p>
                          <p className="text-xs">Please check the format and try again</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex justify-between sm:justify-between gap-2 flex-wrap">
              <div className="flex gap-2">
              
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsIframeDialogOpen(false)}
                  disabled={isUpdatingIframe}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleIframeUpdate}
                  disabled={isUpdatingIframe || !iframeUrl.trim()}
                >
                  {isUpdatingIframe ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {item.iframe_url ? 'Update Iframe' : 'Save Iframe'}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

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
              onIframeUpdate={onIframeUpdate}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}