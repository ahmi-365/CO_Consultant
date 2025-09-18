import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import EnhancedSidebar from "./EnhancedSidebar";
import FileUploadModal from "./FileUploadModal";
import NewFolderModal from "./NewFolderModal";
import NotificationDropdown from "./NotificationDropdown";

export default function RefactoredCloudVaultLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { folderId } = useParams();

  const [isCollapsed, setIsCollapsed] = useState(false);
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

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar with collapsible width */}
      <div
        className={`transition-all duration-300 ${
          isCollapsed ? "w-16" : "w-60"
        }`}
      >
        <EnhancedSidebar
          onUploadClick={() => setIsUploadModalOpen(true)}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      </div>

      {/* Content adjusts automatically */}
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300">
        {/* Header */}
        <header className="bg-background border-b border-border px-6 py-4 flex items-center justify-between">
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

          {/* Right Controls */}
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

        {/* Main Page Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>

      {/* Modals */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
      <NewFolderModal
        isOpen={isNewFolderModalOpen}
        onClose={() => setIsNewFolderModalOpen(false)}
      />
    </div>
  );
}
