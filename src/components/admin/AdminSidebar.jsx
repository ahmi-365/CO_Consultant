"use client";

import { useState, useEffect } from "react";
import {
  Home,
  Files,
  Shield,
  BarChart3,
  User,
  FolderOpen,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  UserCog,
  UsersRound,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dash", icon: Home },
  { name: "Files", href: "/files", icon: Files },
  { name: "Users", href: "/users", icon: UsersRound},
  { name: "Roles", href: "/roles", icon: Shield },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Profile", href: "/profile", icon: User },
];

export function AdminSidebar() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // ✅ Detect screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobile(true);
        setCollapsed(true); // Mobile: always collapsed
      } else {
        setIsMobile(false);
        setCollapsed(false); // Desktop: expanded by default
      }
    };

    handleResize(); // 
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

const handleLogout = () => {
  localStorage.clear(); 
  navigate("/login");
};


  return (
    <div
      className={cn(
        "relative flex h-screen flex-col bg-card border-r border-border transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-panel">
          <FolderOpen className="h-5 w-5 text-panel-foreground" />
        </div>
        {!collapsed && !isMobile && (
          <span className="text-lg font-semibold">Admin Panel</span>
        )}
      </div>

      {/* Collapse Toggle (🚫 Hide on mobile) */}
      {!isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-16 -right-3 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card shadow-md hover:bg-gray-100 transition"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-6">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-panel text-panel-foreground"
                      : "text-foreground hover:bg-gray-200 hover:text-accent-foreground",
                    collapsed && "justify-center"
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                {!collapsed && !isMobile && item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer (Logout) */}
      <div className="border-t border-border p-4 space-y-2">
        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-gray-200 hover:text-accent-foreground",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && !isMobile && "Logout"}
        </button>
      </div>
    </div>
  );
}
