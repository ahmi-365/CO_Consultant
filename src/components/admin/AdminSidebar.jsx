import { Home, Files, Users, Shield, BarChart3, Settings, FolderOpen, Database, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dash", icon: Home },
  { name: "Files", href: "/files", icon: Files },
  { name: "Users", href: "/users", icon: Files },
  { name: "Roles", href: "/roles", icon: Shield },
  { name: "Storage", href: "/storage", icon: Database },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Profile", href: "/profile", icon: User },
];

export function AdminSidebar() {
  return (
    <div className="flex h-screen w-64 flex-col bg-card border-r border-border">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-panel">
          <FolderOpen className="h-5 w-5 text-panel-foreground" />
        </div>
        <span className="text-lg font-semibold">Cloud Storage</span>
      </div>
      
      <nav className="flex-1 px-4 py-6">
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
                      : "text-foreground hover:bg-gray-200 hover:text-accent-foreground"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="border-t border-border p-4">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground">
          <Users className="h-4 w-4" />
          Invite team
        </button>
      </div>
    </div>
  );
}