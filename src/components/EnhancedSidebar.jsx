"use client";

import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Star,
  Trash2,
  User,
  LogOut,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function EnhancedSidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const isActive = (path) => currentPath === path;

  // ✅ Mobile auto collapse
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setCollapsed]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-30",
          collapsed ? "w-20" : "w-60"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-panel">
            <FolderOpen className="h-5 w-5 text-panel-foreground" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-sidebar-foreground">
              Co-Consultants
            </span>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-16 -right-3 z-40 flex h-7 w-7 items-center justify-center rounded-full border border-sidebar-border bg-card shadow-md hover:bg-gray-100 transition"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        {/* Navigation */}
        <div className="flex-1 p-4 overflow-auto">
          <nav className="space-y-2">
            <button
              onClick={() => navigate("/filemanager")}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm w-full transition-colors",
                isActive("/filemanager")
                  ? "bg-panel text-white font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                collapsed && "justify-center"
              )}
            >
              <Home className="h-5 w-5" />
              {!collapsed && "Home"}
            </button>

            <button
              onClick={() => navigate("/starred")}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm w-full transition-colors",
                isActive("/starred")
                  ? "bg-panel text-white font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                collapsed && "justify-center"
              )}
            >
              <Star className="h-5 w-5" />
              {!collapsed && "Starred"}
            </button>

            <button
              onClick={() => navigate("/trash")}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm w-full transition-colors",
                isActive("/trash")
                  ? "bg-panel text-white font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                collapsed && "justify-center"
              )}
            >
              <Trash2 className="h-5 w-5" />
              {!collapsed && "Trash"}
            </button>

            <button
              onClick={() => navigate("/customerprofile")}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm w-full transition-colors",
                isActive("/customerprofile")
                  ? "bg-panel text-white font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                collapsed && "justify-center"
              )}
            >
              <User className="h-5 w-5" />
              {!collapsed && "Profile"}
            </button>
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4 space-y-2">
          <Button
            className={cn(
              "w-full bg-red-500 hover:bg-red-600 text-white flex items-center gap-2",
              collapsed && "justify-center"
            )}
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && "Logout"}
          </Button>
        </div>
      </div>

      {/* Main Content wrapper */}
      <div
        className={cn(
          "transition-all duration-300",
          collapsed ? "ml-20" : "ml-60"
        )}
      >
        {/* Yahan pe tumhara <Outlet /> ya main page content inject hoga */}
      </div>
    </>
  );
}
