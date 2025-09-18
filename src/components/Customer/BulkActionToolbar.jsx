import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, RotateCcw, X, Loader2 } from "lucide-react";

export default function BulkActionToolbar({ 
  selectedCount, 
  onMoveToTrash, 
  onCancel,
  isTrashPage = false,
  onBulkRestore,
  onBulkDelete,
  isProcessing = false, // <-- new prop
  actionType = ""        // <-- "delete" | "move" | "restore"
}) {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-card border border-border rounded-lg shadow-lg p-3 flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {selectedCount} selected
      </span>

      {!isTrashPage ? (
        <Button 
          onClick={onMoveToTrash} 
          variant="destructive" 
          size="sm"
          disabled={isProcessing}
        >
          {isProcessing && actionType === "move" ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4 mr-2" />
          )}
          {isProcessing && actionType === "move" ? "Moving..." : "Move to Trash"}
        </Button>
      ) : (
        <>
          <Button 
            onClick={onBulkRestore} 
            variant="default" 
            size="sm"
            disabled={isProcessing}
          >
            {isProcessing && actionType === "restore" ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4 mr-2" />
            )}
            {isProcessing && actionType === "restore" ? "Restoring..." : "Restore"}
          </Button>

          <Button 
            onClick={onBulkDelete} 
            variant="destructive" 
            size="sm"
            disabled={isProcessing}
          >
            {isProcessing && actionType === "delete" ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <X className="w-4 h-4 mr-2" />
            )}
            {isProcessing && actionType === "delete" ? "Deleting..." : "Delete Permanently"}
          </Button>
        </>
      )}

      <Button 
        onClick={onCancel} 
        variant="ghost" 
        size="sm"
        disabled={isProcessing}
      >
        Cancel
      </Button>
    </div>
  );
}
