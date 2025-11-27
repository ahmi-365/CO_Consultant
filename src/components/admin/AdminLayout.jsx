import { AdminSidebar } from "./AdminSidebar";
import { Outlet } from "react-router-dom";

export function AdminLayout() {
  return (
    <div className="flex h-screen w-full bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto bg-background">
        <Outlet />
      </main>
    </div>
  );
}
