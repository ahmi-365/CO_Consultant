import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AdminLayout } from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import Files from "./pages/admin/Files";
import Roles from "./pages/admin/Roles";
import Storage from "./pages/admin/Storage";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";
import Profile from "./pages/admin/Profile";
import LoginPage from "./pages/Auths/Login";
import RegisterPage from "./pages/Auths/Register";
import RefactoredCloudVaultLayout from "./components/RefactoredCloudVaultLayout";
import StarredPage from "./pages/CustomerPanel/StarredPage";
import SharedPage from "./pages/CustomerPanel/SharedPage";
import TrashPage from "./pages/CustomerPanel/TrashPage";
import ProfilePage from "./pages/CustomerPanel/ProfilePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
 <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* Admin routes inside AdminLayout */}
          <Route element={<AdminLayout />}>
            <Route path="/dash" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/files" element={<Files />} />
            <Route path="/roles" element={<Roles />} />
            <Route path="/storage" element={<Storage />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
 <Route path="/filemanager" element={<RefactoredCloudVaultLayout />} />
          <Route
            path="/starred"
            element={
              <RefactoredCloudVaultLayout>
                <StarredPage />
              </RefactoredCloudVaultLayout>
            }
          />
          <Route
            path="/shared"
            element={
              <RefactoredCloudVaultLayout>
                <SharedPage />
              </RefactoredCloudVaultLayout>
            }
          />
          <Route
            path="/trash"
            element={
              <RefactoredCloudVaultLayout>
                <TrashPage />
              </RefactoredCloudVaultLayout>
            }
          />
          <Route
            path="/folder/:folderId"
            element={<RefactoredCloudVaultLayout />}
          />
          <Route path="/customerprofile" element={<ProfilePage />} />
          {/* Catch all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
