// src/components/modals/FolderSelectionModal.jsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Folder, File, FolderOpen, Loader2, AlertCircle, Check, X, Shield } from "lucide-react";
import { fileApi } from '../services/FileService'; 
// NOTE: PermissionsModal is imported from this file's directory
import { PermissionsModal } from "./PermissionsModal"; 

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function FolderSelectionModal({ isOpen, onClose, onSelect, selectedItems = [] }) {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPath, setCurrentPath] = useState([]);
    // tempSelectedItems now holds the rich objects, as expected by the parent UserForm
    const [tempSelectedItems, setTempSelectedItems] = useState(selectedItems); 
    const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
    
    // NEW STATE: To hold the permissions selected in the child modal
    const [selectedPermissionsKeys, setSelectedPermissionsKeys] = useState(() => {
        // Initialize permissions from the first selected item, or empty array
        return selectedItems.length > 0 && Array.isArray(selectedItems[0].permissions) 
            ? selectedItems[0].permissions 
            : [];
    });
    
    // NEW HANDLER: To receive permissions from the child modal
    const handleSavePermissions = (permissionKeys) => {
        setSelectedPermissionsKeys(permissionKeys);
    };

    useEffect(() => {
        if (isOpen) {
            setTempSelectedItems(selectedItems);
            // Re-initialize permissions from the passed selectedItems if available
            setSelectedPermissionsKeys(
                selectedItems.length > 0 && Array.isArray(selectedItems[0].permissions) 
                    ? selectedItems[0].permissions 
                    : []
            );
        }
    }, [isOpen, selectedItems]);
    
    const fetchFiles = useCallback(async (parentId = null) => {
        setLoading(true);
        setError(null);

        try {
            const data = await fileApi.listFiles(parentId);
            setFiles(data);
        } catch (err) {
            console.error("Failed to fetch files:", err);
            setError(err.message || "An unknown error occurred while fetching files.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            setCurrentPath([]);
            fetchFiles(null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]); 

    const handleFolderClick = async (folder) => {
        setCurrentPath([...currentPath, { id: folder.id, name: folder.name }]);
        await fetchFiles(folder.id);
    };

    const handlePathClick = async (folder, index) => {
        const newPath = currentPath.slice(0, index + 1);
        setCurrentPath(newPath);
        await fetchFiles(folder.id);
    };

    const handleBackClick = async () => {
        const newPath = currentPath.slice(0, -1);
        setCurrentPath(newPath);
        const parentId = newPath.length > 0 ? newPath[newPath.length - 1].id : null;
        await fetchFiles(parentId);
    };

    const handleItemToggle = (item) => {
        const isSelected = tempSelectedItems.some(selected => selected.id === item.id);

        if (isSelected) {
            // Remove item
            setTempSelectedItems(tempSelectedItems.filter(selected => selected.id !== item.id));
        } else {
            // Add item, inheriting the currently selected permissions
            setTempSelectedItems([...tempSelectedItems, {
                id: item.id,
                name: item.name,
                type: item.type,
                // Attach current permissions to the newly selected item
                permissions: selectedPermissionsKeys 
            }]);
        }
    };

    const handleConfirm = () => {
        // FIX: Map over the currently selected items and attach the latest permissions
        // The UserForm expects an array of objects: [{ id, name, type, permissions: [...] }]
        const finalSelectionPayload = tempSelectedItems.map(item => ({
            ...item,
            // Overwrite existing permissions with the latest from the PermissionsModal
            permissions: selectedPermissionsKeys,
        }));

        // Pass the fully structured array back to the parent (UserForm)
        onSelect(finalSelectionPayload);
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    const isFolder = (item) => item.type === 'folder';

    // Show a status for the selected permissions
    const permissionStatus = selectedPermissionsKeys.length > 0 
        ? `Permissions Set (${selectedPermissionsKeys.length})` 
        : 'Set Permissions'; // Changed from 'No Permissions Set' to indicate action

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-6xl max-h-[85vh] flex flex-col"> 
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FolderOpen className="h-5 w-5" />
                            Select Folders and Files
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-3 gap-6 flex-1 min-h-0">
                        
                        {/* Left Column - File Browser */}
                        <div className="col-span-2 space-y-4 flex flex-col min-h-0">
                            
                            <div className="flex items-center justify-between">
                                {currentPath.length > 0 ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleBackClick}
                                        className="mr-4 shrink-0"
                                    >
                                        ← Back
                                    </Button>
                                ) : (
                                    <div className="w-16 shrink-0"></div> 
                                )}
                                <div className="flex items-center gap-2 text-sm text-muted-foreground flex-1 overflow-x-auto whitespace-nowrap">
                                    <button
                                        onClick={() => {
                                            setCurrentPath([]);
                                            fetchFiles();
                                        }}
                                        className="hover:text-primary font-bold shrink-0"
                                    >
                                        Root
                                    </button>
                                    {currentPath.map((folder, index) => (
                                        <span key={folder.id} className="flex items-center shrink-0">
                                            {" / "}
                                            <button
                                                onClick={() => handlePathClick(folder, index)}
                                                className="hover:text-primary max-w-24 truncate"
                                                title={folder.name}
                                            >
                                                {folder.name}
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="border rounded-lg flex-1 overflow-y-auto">
                                {loading ? (
                                    <div className="flex items-center justify-center p-8 h-full">
                                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                        Loading...
                                    </div>
                                ) : error ? (
                                    <div className="flex items-center justify-center p-8 h-full text-red-600">
                                        <AlertCircle className="h-5 w-5 mr-2" />
                                        {error}
                                    </div>
                                ) : files.length === 0 ? (
                                    <div className="flex items-center justify-center p-8 h-full text-muted-foreground text-sm">
                                        No files or folders found
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {files.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
                                            >
                                                <Checkbox
                                                    checked={tempSelectedItems.some(selected => selected.id === item.id)}
                                                    onCheckedChange={() => handleItemToggle(item)}
                                                />

                                                {isFolder(item) ? (
                                                    <Folder className="h-5 w-5 text-blue-600 shrink-0" />
                                                ) : (
                                                    <File className="h-5 w-5 text-gray-600 shrink-0" />
                                                )}

                                                <div className="flex-1 min-w-0">
                                                    <button
                                                        onClick={() => isFolder(item) && handleFolderClick(item)}
                                                        className={`text-left w-full ${isFolder(item) ? 'hover:text-primary cursor-pointer' : 'cursor-default'}`}
                                                    >
                                                        <div className="font-medium truncate">{item.name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {isFolder(item) ? 'Folder' : 'File'}
                                                            {item.size && ` • ${formatFileSize(item.size)}`}
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Selected Items */}
                        <div className="space-y-4 flex flex-col min-h-0">
                            <div className="flex justify-between items-center text-sm font-medium shrink-0">
                                <span>Selected Items ({tempSelectedItems.length})</span>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setIsPermissionsModalOpen(true)}
                                    disabled={tempSelectedItems.length === 0}
                                >
                                    <Shield className="h-4 w-4 mr-2" />
                                    {permissionStatus}
                                </Button>
                            </div>

                            <div className="border rounded-lg flex-1 overflow-y-auto">
                                {tempSelectedItems.length === 0 ? (
                                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                                        No items selected
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {tempSelectedItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center gap-2 p-3 hover:bg-muted/50"
                                            >
                                                {item.type === 'folder' ? (
                                                    <Folder className="h-4 w-4 text-blue-600 shrink-0" />
                                                ) : (
                                                    <File className="h-4 w-4 text-gray-600 shrink-0" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm truncate">{item.name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {item.type === 'folder' ? 'Folder' : 'File'}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleItemToggle(item)}
                                                    className="hover:text-red-600 p-1 shrink-0"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t bg-background shrink-0">
                        <Button variant="outline" onClick={handleCancel} className="flex-1">
                            Cancel
                        </Button>
                        <Button onClick={handleConfirm} className="flex-1" disabled={tempSelectedItems.length === 0}>
                            <Check className="h-4 w-4 mr-2" />
                            Confirm Selection ({tempSelectedItems.length})
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            
            <PermissionsModal 
                isOpen={isPermissionsModalOpen} 
                onClose={() => setIsPermissionsModalOpen(false)} 
                selectedItems={tempSelectedItems}
                // Pass the current selected permissions keys for the modal to initialize with
                initialPermissions={selectedPermissionsKeys}
                onSavePermissions={handleSavePermissions}
            />
        </>
    );
}