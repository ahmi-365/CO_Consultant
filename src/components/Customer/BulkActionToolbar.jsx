// BulkActionToolbar.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, RotateCcw, X } from "lucide-react";

export default function BulkActionToolbar({ 
  selectedCount, 
  onMoveToTrash, 
  onCancel,
  isTrashPage = false,
  onBulkRestore,
  onBulkDelete 
}) {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-card border border-border rounded-lg shadow-lg p-3 flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {selectedCount} selected
      </span>
      
      {!isTrashPage ? (
        <Button onClick={onMoveToTrash} variant="destructive" size="sm">
          <Trash2 className="w-4 h-4 mr-2" />
          Move to Trash
        </Button>
      ) : (
        <>
          <Button onClick={onBulkRestore} variant="default" size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Restore
          </Button>
          <Button onClick={onBulkDelete} variant="destructive" size="sm">
            <X className="w-4 h-4 mr-2" />
            Delete Permanently
          </Button>
        </>
      )}
      
      <Button onClick={onCancel} variant="ghost" size="sm">
        Cancel
      </Button>
    </div>
  );
}
