import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Folder, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { fileApi } from "../services/FileService";

export default function NewFolderModal({
  isOpen,
  onClose,
  onFolderCreated,
  currentPath,
  parentId
}) {
  const [folderName, setFolderName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [hasCreated, setHasCreated] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Reset states when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      // Reset everything when modal closes
      setFolderName("");
      setIsCreating(false);
      setHasCreated(false);
      setValidationError("");
    }
  }, [isOpen]);

  // Validate folder name
  const validateFolderName = (name) => {
    const trimmedName = name.trim();
    
    // Check if empty
    if (!trimmedName) {
      return "Folder name cannot be empty";
    }

    // Check minimum length
    if (trimmedName.length < 2) {
      return "Folder name must be at least 2 characters long";
    }

    // Check for invalid characters
    const invalidChars = /[<>:"/\\|?*\x00-\x1F!@#$%^&*()+=[\]{};',~`]/;
    if (invalidChars.test(trimmedName)) {
      return "Folder name contains invalid characters. Avoid: < > : \" / \\ | ? * ! @ # $ % ^ & * ( ) + = [ ] { } ; ' , ~ `";
    }

    // Check if name ends with dot or space
    if (trimmedName.endsWith('.') || trimmedName.endsWith(' ')) {
      return "Folder name cannot end with a dot or space";
    }

    // Check for meaningful name (basic check for random characters)
    // This checks if the name has at least one vowel and one consonant
    // and doesn't look like random typing
    const hasVowel = /[aeiouAEIOU]/.test(trimmedName);
    const hasConsonant = /[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]/.test(trimmedName);
    
    // Check for repeated characters pattern (like "aaaa", "asdfasdf", etc.)
    const repeatedChars = /(.)\1{3,}/.test(trimmedName); // 4 or more same characters in a row
    const sequentialChars = /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(trimmedName);
    
    // Check if it looks like random typing (alternating pattern)
    const wordParts = trimmedName.split(/\s+/);
    const looksRandom = wordParts.some(part => {
      if (part.length < 4) return false;
      
      // Check for keyboard walking patterns (like "qwerty", "asdf")
      const commonPatterns = [
        'qwerty', 'asdf', 'zxcv', 'qwe', 'asd', 'zxc',
        'jkl', 'uiop', 'ghjk', 'bnm'
      ];
      
      if (commonPatterns.some(pattern => part.toLowerCase().includes(pattern))) {
        return true;
      }
      
      // Check for too many consonants in a row without vowels
      const consonantClusters = part.match(/[bcdfghjklmnpqrstvwxyz]{4,}/gi);
      if (consonantClusters && consonantClusters.some(cluster => cluster.length >= 4)) {
        return true;
      }
      
      return false;
    });

    if (!hasVowel || !hasConsonant) {
      return "Please use a meaningful folder name with proper words";
    }

    if (repeatedChars) {
      return "Folder name appears to contain repeated characters. Please use a meaningful name.";
    }

    if (sequentialChars) {
      return "Folder name appears to contain keyboard sequences. Please use a meaningful name.";
    }

    if (looksRandom) {
      return "Folder name doesn't appear to be meaningful. Please use proper words that make sense.";
    }

    // Check for reserved names
    const reservedNames = [
      'con', 'prn', 'aux', 'nul', 'com1', 'com2', 'com3', 'com4', 
      'com5', 'com6', 'com7', 'com8', 'com9', 'lpt1', 'lpt2', 
      'lpt3', 'lpt4', 'lpt5', 'lpt6', 'lpt7', 'lpt8', 'lpt9'
    ];
    
    if (reservedNames.includes(trimmedName.toLowerCase())) {
      return `"${trimmedName}" is a reserved system name. Please choose a different name.`;
    }

    return ""; // No error
  };

  // Update validation when folder name changes
  useEffect(() => {
    if (folderName.trim()) {
      const error = validateFolderName(folderName);
      setValidationError(error);
    } else {
      setValidationError("");
    }
  }, [folderName]);

  const handleCreate = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    const validationError = validateFolderName(folderName);
    if (validationError || isCreating || hasCreated) {
      if (validationError) {
        toast.error(validationError);
      }
      return;
    }

    setIsCreating(true);
    setHasCreated(true);

    try {
      const newFolder = await fileApi.createFolder(folderName.trim(), parentId || null);
      toast.success(`Folder "${newFolder?.name || folderName}" created successfully!`);
      
      // Pass the new folder data to parent
      if (onFolderCreated) {
        onFolderCreated(newFolder);
      }
      
      // Close modal (useEffect will handle cleanup)
      onClose();
      
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error(error.message || "Failed to create folder");
      setHasCreated(false);
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isCreating && folderName.trim() && !validationError) {
      handleCreate(e);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setFolderName(value);
  };

  const isFormValid = folderName.trim() && !validationError && !isCreating;
  const parentFolderName = currentPath?.split("/").filter(Boolean).pop() || "Root";


  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-panel" />
            Create New Folder
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleCreate}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                placeholder="Enter meaningful folder name (e.g., Documents, Projects)..."
                value={folderName}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={isCreating}
                autoFocus
                className={validationError ? "border-red-500" : ""}
              />
              
              {validationError && (
                <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{validationError}</span>
                </div>
              )}
              
              {!validationError && folderName.trim() && (
                <div className="text-green-600 text-sm mt-1">
                  ✓ Folder name looks good!
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground font-medium">Name Requirements:</p>
              <ul className="text-muted-foreground text-xs space-y-1 list-disc list-inside">
                <li>Must be at least 2 characters long</li>
                <li>Should contain meaningful words</li>
                <li>No special characters: &lt; &gt; : " / \ | ? * ! @ # $ % ^ &amp; * ( ) etc.</li>
                <li>No keyboard patterns like "asdf", "qwerty"</li>
                <li>No repeated characters like "aaaa"</li>
                <li>Location: {currentPath}</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleClose} 
              disabled={isCreating}
              type="button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid}
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                "Create Folder"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}