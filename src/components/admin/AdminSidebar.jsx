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
  UsersRound,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "react-router-dom";

const navigation = [
  { name: "Dashboard", href: "/dash", icon: Home },
  { name: "Files", href: "/files", icon: Files },
  { name: "Users", href: "/users", icon: UsersRound },
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

    handleResize();
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
        "relative flex h-screen flex-col border-r transition-all duration-300",
        "bg-white border-gray-200 dark:bg-[#0f172a] dark:border-gray-700",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          {/* Folder Icon or Theme Toggle */}
          {!isMobile ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 dark:bg-[#1e3a8a] shadow-sm">
              <FolderOpen className="h-5 w-5 text-white" />
            </div>
          ) : (
            <ThemeToggle />
          )}
          {!collapsed && (
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Admin Panel
            </span>
          )}
        </div>

        {/* Theme Toggle (Desktop Expanded) */}
        {!collapsed && !isMobile && <ThemeToggle />}
      </div>

      {/* Collapse Toggle (Hide on Mobile) */}
      {!isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-16 -right-3 z-20 flex h-7 w-7 items-center justify-center rounded-full 
                     border border-gray-300 dark:border-gray-700 
                     bg-white dark:bg-[#1e293b] shadow-md 
                     hover:bg-gray-100 dark:hover:bg-[#1e3a8a]/50 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-6 overflow-y-auto">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-red-600 text-white dark:bg-[#1e3a8a] dark:text-gray-100"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1e3a8a]/40 hover:text-red-600 dark:hover:text-[#60a5fa]",
                    collapsed && "justify-center"
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                {!collapsed && item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer (Logout Button) */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
      
      {/* Logout Button (Left, wider) */}
      <button
        onClick={handleLogout}
        className={cn(
          "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors w-32 justify-center",
          "text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-[#60a5fa] hover:bg-red-50 dark:hover:bg-[#1e3a8a]/30",
          collapsed && "w-10"
        )}
      >
        <LogOut className="h-5 w-5" />
        {!collapsed && <span>Logout</span>}
      </button>

      {/* Home Button (Right) */}
      <Link
        to="/"
        className={cn(
          "flex items-center justify-center h-10 w-10 rounded-lg transition-colors",
          "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-[#60a5fa] hover:bg-blue-50 dark:hover:bg-[#1e3a8a]/30"
        )}
      >
        <Home className="h-5 w-5" />
      </Link>
      
    </div>
    </div>
  );
}
