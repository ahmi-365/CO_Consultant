import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Star,
  Trash2,
  Upload,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EnhancedSidebar({ onUploadClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const isActive = (path) => currentPath === path;

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <div className="w-60 h-screen fixed left-0 top-0 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Top Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-panel rounded-full flex items-center justify-center text-panel-foreground font-bold text-sm">
            CV
          </div>
          <span className="font-semibold text-sidebar-foreground">
            CloudVault
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 p-4">
        <nav className="space-y-1">
          <button
            onClick={() => navigate("/filemanager")}
            className={`flex items-center gap-2 px-3 py-2 w-full text-left rounded-md transition-colors ${
              isActive("/filemanager")
                ? "bg-red-200 text-red-500 font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="text-sm">Home</span>
          </button>

          <div className="mt-8 space-y-1">
            <button
              onClick={() => navigate("/shared")}
              className={`flex items-center gap-2 px-3 py-2 text-sm w-full rounded-md transition-colors ${
                isActive("/shared")
                  ? "bg-red-200 text-red-500 font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Shared with me</span>
            </button>

            <button
              onClick={() => navigate("/starred")}
              className={`flex items-center gap-2 px-3 py-2 text-sm w-full rounded-md transition-colors ${
                isActive("/starred")
                  ? "bg-red-200 text-red-500 font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <Star className="w-4 h-4" />
              <span>Starred</span>
            </button>

            <button
              onClick={() => navigate("/trash")}
              className={`flex items-center gap-2 px-3 py-2 text-sm w-full rounded-md transition-colors ${
                isActive("/trash")
                  ? "bg-red-200 text-red-500 font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>Trash</span>
            </button>

            <button
              onClick={() => navigate("/customerprofile")}
              className={`flex items-center gap-2 px-3 py-2 text-sm w-full rounded-md transition-colors ${
                isActive("/customerprofile")
                  ? "bg-red-200 text-red-500 font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Bottom Buttons */}
      <div className="p-4 border-t border-sidebar-border flex flex-col gap-2">
        {/* <Button
          className="w-full bg-panel hover:bg-panel/90 text-panel-foreground"
          onClick={onUploadClick}
        >
          <Upload className="w-4 h-4 mr-2" />
          New Upload
        </Button> */}

        <Button
          className="w-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center gap-2"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
