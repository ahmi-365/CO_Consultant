import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, ExternalLink } from "lucide-react";


export default function FilePreviewDialog({ 
  open, 
  onOpenChange, 
  file, 
  onDownload 
} ) {
  if (!file) return null;

  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(file.type.toLowerCase());
  const isPdf = file.type.toLowerCase() === 'pdf';
  const isVideo = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(file.type.toLowerCase());
  const isAudio = ['mp3', 'wav', 'ogg', 'aac', 'flac'].includes(file.type.toLowerCase());
  const isText = ['txt', 'md', 'json', 'xml', 'csv'].includes(file.type.toLowerCase());

  const handleOpenExternal = () => {
    window.open(file.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-card shadow-card">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-foreground truncate pr-4">{file.name}</DialogTitle>
          <div className="flex items-center gap-2">
            {onDownload && (
              <Button variant="ghost" size="sm" onClick={onDownload}>
                <Download className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleOpenExternal}>
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          {isImage && (
            <div className="flex justify-center p-4">
              <img 
                src={file.url} 
                alt={file.name}
                className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
                onError={(e) => {
                  const target = e.target ;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden text-center py-8">
                <p className="text-muted-foreground">Unable to preview image</p>
                <Button variant="outline" onClick={handleOpenExternal} className="mt-4">
                  Open in New Tab
                </Button>
              </div>
            </div>
          )}
          
          {isPdf && (
            <div className="h-[60vh] w-full">
              <iframe 
                src={file.url}
                className="w-full h-full border-0 rounded-lg"
                title={file.name}
              />
            </div>
          )}
          
          {isVideo && (
            <div className="flex justify-center p-4">
              <video 
                controls 
                className="max-w-full max-h-[60vh] rounded-lg shadow-lg"
                preload="metadata"
              >
                <source src={file.url} />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
          
          {isAudio && (
            <div className="flex justify-center p-8">
              <div className="w-full max-w-md">
                <div className="text-center mb-4">
                  <Music className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Audio File</p>
                </div>
                <audio controls className="w-full">
                  <source src={file.url} />
                  Your browser does not support the audio tag.
                </audio>
              </div>
            </div>
          )}
          
          {isText && (
            <div className="p-4">
              <iframe 
                src={file.url}
                className="w-full h-[60vh] border border-border rounded-lg bg-background"
                title={file.name}
              />
            </div>
          )}
          
          {!isImage && !isPdf && !isVideo && !isAudio && !isText && (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <File className="h-16 w-16 mx-auto mb-4" />
                <p className="text-lg font-medium">Preview not available</p>
                <p className="text-sm">This file type cannot be previewed</p>
              </div>
              <div className="flex gap-2 justify-center mt-6">
                <Button variant="outline" onClick={handleOpenExternal}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
                {onDownload && (
                  <Button onClick={onDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Add missing imports at the top
import { File, Music } from "lucide-react";