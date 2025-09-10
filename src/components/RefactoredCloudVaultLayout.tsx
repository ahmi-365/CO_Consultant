import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Search, Bell, ChevronRight, Folder, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import EnhancedSidebar from "./EnhancedSidebar";
import EnhancedFileList from "./EnhancedFileList";
import FileUploadModal from "./FileUploadModal";
import NewFolderModal from "./NewFolderModal";
import NotificationDropdown from "./NotificationDropdown";
import { apiService, FileItem } from "@/services/api";
import { toast } from "sonner";

interface RefactoredCloudVaultLayoutProps {
  children?: React.ReactNode;
}

export default function RefactoredCloudVaultLayout({
  children,
}: RefactoredCloudVaultLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { folderId } = useParams();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const currentPath = location.pathname;

  const getBreadcrumbPath = () => {
    switch (currentPath) {
      case "/starred":
        return [{ name: "Starred", path: "/starred" }];
      case "/shared":
        return [{ name: "Shared with me", path: "/shared" }];
      case "/trash":
        return [{ name: "Trash", path: "/trash" }];
      case "/profile":
        return [{ name: "Profile", path: "/profile" }];
      case "/":
      default:
        if (currentPath.startsWith("/folder/")) {
          return [
            { name: "My Files", path: "/" },
            { name: "Current Folder", path: currentPath },
          ];
        }
        return [{ name: "My Files", path: "/" }];
    }
  };

  const handleFileUploaded = async (file: File) => {
    try {
      const response = await apiService.uploadFile(file, folderId);
      if (response.success) {
        toast.success("File uploaded successfully");
        // Trigger file list refresh
        window.dispatchEvent(new CustomEvent("fileUploaded"));
      } else {
        toast.error("Failed to upload file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Error uploading file");
    }
  };

  const handleFolderCreated = async (folderName: string) => {
    try {
      const response = await apiService.createFolder(folderName, folderId);
      if (response.success) {
        toast.success("Folder created successfully");
        // Trigger both sidebar and file list refresh
        window.dispatchEvent(new CustomEvent("folderCreated"));
      } else {
        toast.error("Failed to create folder");
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Error creating folder");
    }
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <EnhancedSidebar onUploadClick={() => setIsUploadModalOpen(true)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              {getBreadcrumbPath().map((crumb, index) => (
                <div key={crumb.path} className="flex items-center gap-2">
                  {index > 0 && <ChevronRight className="w-4 h-4" />}
                  <button
                    onClick={() => navigate(crumb.path)}
                    className={`hover:text-foreground transition-colors ${
                      index === getBreadcrumbPath().length - 1
                        ? "text-foreground font-medium"
                        : ""
                    }`}
                  >
                    {crumb.name}
                  </button>
                </div>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-input border-border"
              />
            </div>

            {/* Notifications */}
            <NotificationDropdown />

            {/* User Avatar */}
            <Avatar className="cursor-pointer" onClick={handleProfileClick}>
              <AvatarFallback className="bg-panel text-panel-foreground hover:bg-panel/90 transition-colors">
                U
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children || (
            <div className="space-y-6">
              {/* Page Header */}
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-foreground">
                  {getBreadcrumbPath()[getBreadcrumbPath().length - 1]?.name}
                </h1>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsNewFolderModalOpen(true)}
                  >
                    <Folder className="w-4 h-4 mr-2" />
                    New Folder
                  </Button>
                  <Button
                    size="sm"
                    className="bg-panel hover:bg-panel/90 text-panel-foreground"
                    onClick={() => setIsUploadModalOpen(true)}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>

              {/* File List */}
              <EnhancedFileList
                searchQuery={searchQuery}
                onFolderCreated={() =>
                  window.dispatchEvent(new CustomEvent("folderCreated"))
                }
              />
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onFileUploaded={handleFileUploaded}
        currentFolder={getBreadcrumbPath()
          .map((p) => p.name)
          .join(" / ")}
      />

      <NewFolderModal
        isOpen={isNewFolderModalOpen}
        onClose={() => setIsNewFolderModalOpen(false)}
        onFolderCreated={handleFolderCreated}
        currentPath={getBreadcrumbPath()
          .map((p) => p.name)
          .join(" / ")}
      />
    </div>
  );
}
