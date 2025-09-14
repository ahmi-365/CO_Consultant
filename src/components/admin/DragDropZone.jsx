import { useState, useCallback } from 'react';
import { Upload, FolderOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


export default function DragDropZone({ 
  onFileDrop, 
  children, 
  folderId, 
  isFolder = false,
  className = "" 
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const { toast } = useToast();

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragActive(true);
      if (isFolder) {
        setIsDragOver(true);
      }
    }
  }, [isFolder]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set drag state to false if we're leaving the entire component
    const rect = (e.currentTarget ).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
      if (!isFolder) {
        setIsDragActive(false);
      }
    }
  }, [isFolder]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragOver(false);
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileDrop(e.dataTransfer.files, folderId);
      
      if (isFolder) {
        toast({
          title: "Files Ready for Upload",
          description: `${e.dataTransfer.files.length} file(s) will be uploaded to this folder`,
        });
      }
    }
  }, [onFileDrop, folderId, isFolder, toast]);

  return (
    <div
      className={`
        relative transition-all duration-200 
        ${isDragOver && isFolder ? 'ring-2 ring-primary ring-opacity-50 bg-primary/10' : ''}
        ${isDragActive && !isFolder ? 'ring-2 ring-primary ring-opacity-30' : ''}
        ${className}
      `}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}
      
      {/* Folder drop overlay */}
      {isDragOver && isFolder && (
        <div className="absolute inset-0 z-10 bg-primary/20 border-2 border-dashed border-primary rounded-lg flex items-center justify-center">
          <div className="text-center">
            <FolderOpen className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium text-primary">Drop files here to upload</p>
          </div>
        </div>
      )}
      
      {/* Global drop overlay */}
      {isDragActive && !isFolder && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card p-8 rounded-lg shadow-lg text-center max-w-sm mx-4">
            <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Drop Files to Upload</h3>
            <p className="text-muted-foreground">Release to upload files to the current folder</p>
          </div>
        </div>
      )}
    </div>
  );
}