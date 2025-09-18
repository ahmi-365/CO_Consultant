import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Search, ChevronRight, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import EnhancedSidebar from "./EnhancedSidebar";
import FileUploadModal from "./FileUploadModal";
import NewFolderModal from "./NewFolderModal";
import NotificationDropdown from "./NotificationDropdown";
import { Button } from "@/components/ui/button";

export default function RefactoredCloudVaultLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { folderId } = useParams();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  const currentPath = location.pathname;

  // ✅ Mobile pe default collapsed rakho
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true); // Mobile: collapsed
      } else {
        setCollapsed(false); // Desktop: expanded
      }
    };

    handleResize(); // run on mount
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <EnhancedSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        onUploadClick={() => setIsUploadModalOpen(true)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen overflow-auto transition-all duration-300 `}
      >
        {/* Header */}
        <header className="bg-background border-b border-border px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          {/* Left: Breadcrumb & Toggle Button */}
          <div className="flex items-center gap-3">
           

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
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

          {/* Right Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-48 md:w-64 bg-input border-border"
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
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
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
