// src/components/modals/PermissionsModal.jsx
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Shield, User, Save } from "lucide-react";
// permissionsApi is now only used for getAllPermissions
import { permissionsApi } from '../services/FilePermission';
import { Checkbox } from "@/components/ui/checkbox";

const formatPermissionName = (key) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

// PROP CHANGE: Now accepts onSavePermissions callback
export function PermissionsModal({ isOpen, onClose, selectedItems = [], onSavePermissions }) {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedPermissions, setSelectedPermissions] = useState([]); 
    // Removed saving/saveError state since API call is moved
    const [lastSavedPermissions, setLastSavedPermissions] = useState([]);

    useEffect(() => {
        if (isOpen) {
            fetchPermissions();
            // IMPORTANT: Initialize selected permissions with the last saved state
            setSelectedPermissions(lastSavedPermissions); 
        }
    }, [isOpen, lastSavedPermissions]);

    const fetchPermissions = async () => {
        setLoading(true);
        setError(null);

        try {
            const apiData = await permissionsApi.getAllPermissions(); 
            // NOTE: The original component had an error here: const permissionStrings = apiData || [];
            // Assuming apiData is an object with a 'permissions' array:
            const permissionStrings = apiData || [];
            
            const formattedPermissions = permissionStrings.map((p, index) => ({
                id: index, 
                key: p,
                name: formatPermissionName(p),
                description: `Allows the user the ${formatPermissionName(p)} permission.`, 
            }));

            setPermissions(formattedPermissions);

        } catch (err) {
            console.error("Failed to fetch permissions:", err);
            setError(err.message || "An error occurred while fetching permissions.");
        } finally {
            setLoading(false);
        }
    };
    
    const handlePermissionToggle = (key) => {
        setSelectedPermissions(prev => 
            prev.includes(key)
                ? prev.filter(p => p !== key)
                : [...prev, key]
        );
    };
    
    // NEW: Function to call the parent's callback
    const handleConfirmSelection = () => {
        setLastSavedPermissions(selectedPermissions); // Update local state for next open
        onSavePermissions(selectedPermissions); // Send selected keys back to parent
        onClose();
    };

    const isConfirmDisabled = selectedPermissions.length === 0 || loading;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                        Select Permissions
                    </DialogTitle>
                </DialogHeader>

                <div className="mb-4 text-sm text-muted-foreground">
                    Selecting permissions to apply to **{selectedItems.length}** selected item(s).
                </div>

                <div className="flex-1 overflow-y-auto border rounded-lg p-4 space-y-4">
                    
                    {loading ? (
                        <div className="flex items-center justify-center p-8 h-full">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            Loading permissions...
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center p-8 h-full text-red-600">
                            <AlertCircle className="h-5 w-5 mr-2" />
                            {error}
                        </div>
                    ) : permissions.length === 0 ? (
                        <div className="flex items-center justify-center p-8 h-full text-muted-foreground">
                            No available permissions found.
                        </div>
                    ) : (
                        <div className="divide-y">
                            {permissions.map((p) => (
                                <div key={p.key} className="flex items-center justify-between py-3">
                                    
                                    <div className="flex items-center gap-3">
                                        <User className="h-4 w-4 text-gray-500" />
                                        <div>
                                            <div className="font-medium">{p.name}</div>
                                        </div>
                                    </div>
                                    
                                    <Checkbox
                                        checked={selectedPermissions.includes(p.key)}
                                        onCheckedChange={() => handlePermissionToggle(p.key)}
                                        className="shrink-0"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleConfirmSelection} 
                        disabled={isConfirmDisabled}
                    >
                        <Save className="h-4 w-4 mr-2" />
                        Apply Permissions
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}