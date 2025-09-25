// components/ui/EmptyState.jsx
import React from 'react';
import { FolderX } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
      <FolderX className="w-16 h-16 mb-4 text-gray-400" />
      <h3 className="text-lg font-semibold">No files or folders here</h3>
      <p className="text-sm">This folder is empty. Get started by creating a new folder or uploading a file.</p>
    </div>
  );
}