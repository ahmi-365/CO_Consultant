import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
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
import StarredPage from "./pages/CustomerPanel/StarredPage";
import TrashPage from "./pages/CustomerPanel/TrashPage";
import ProfilePage from "./pages/CustomerPanel/ProfilePage";
import { CustomerLayout } from "./pages/CustomerPanel/CustomerLayout";
import { AuthGuard, RoleBasedRedirect } from "./pages/Auths/ProtectedRoute";
import EnhancedFileList from "./components/EnhancedFileList";
import CPDashboard from "./pages/CustomerPanel/CPDashboard";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsAndConditions from "./components/TermsAndConditions";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/dashboard" element={<RoleBasedRedirect />} />
          
          <Route
            path="/dash"
            element={
              <AuthGuard requiredRole="admin">
                <AdminLayout />
              </AuthGuard>
            }
          >
            <Route index element={<Dashboard />} />
          </Route>
          
          <Route
            path="/users"
            element={
              <AuthGuard requiredRole="admin">
                <AdminLayout />
              </AuthGuard>
            }
          >
            <Route index element={<Users />} />
          </Route>
          
          <Route
            path="/files"
            element={
              <AuthGuard requiredRole="admin">
                <AdminLayout />
              </AuthGuard>
            }
          >
            <Route index element={<Files />} />
          </Route>
          
          <Route
            path="/roles"
            element={
              <AuthGuard requiredRole="admin">
                <AdminLayout />
              </AuthGuard>
            }
          >
            <Route index element={<Roles />} />
          </Route>
          
          <Route
            path="/storage"
            element={
              <AuthGuard requiredRole="admin">
                <AdminLayout />
              </AuthGuard>
            }
          >
            <Route index element={<Storage />} />
          </Route>
          
          <Route
            path="/reports"
            element={
              <AuthGuard requiredRole="admin">
                <AdminLayout />
              </AuthGuard>
            }
          >
            <Route index element={<Reports />} />
          </Route>
          
          <Route
            path="/settings"
            element={
              <AuthGuard requiredRole="admin">
                <AdminLayout />
              </AuthGuard>
            }
          >
            <Route index element={<Settings />} />
          </Route>
          
          <Route
            path="/profile"
            element={
              <AuthGuard requiredRole="admin">
                <AdminLayout />
              </AuthGuard>
            }
          >
            <Route index element={<Profile />} />
          </Route>

          {/* Customer routes - accessible by customers and fallback for authenticated users */}
          <Route
            path="/filemanager"
            element={
              <AuthGuard>
                <CustomerLayout />
              </AuthGuard>
            }
          >
            <Route index element={<EnhancedFileList/>} />
          </Route>
          <Route
            path="/folder/:folderId"
            element={
              <AuthGuard>
                <CustomerLayout />
              </AuthGuard>
            }
          >
            <Route index element={<EnhancedFileList/>} />
          </Route>
           
          <Route
            path="/starred"
            element={
              <AuthGuard>
                <CustomerLayout />
              </AuthGuard>
            }
          >
            <Route index element={<StarredPage />} />
          </Route>
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <CustomerLayout />
              </AuthGuard>
            }
          >
            <Route index element={<CPDashboard />} />
          </Route>
          
        
          
          <Route
            path="/trash"
            element={
              <AuthGuard>
                <CustomerLayout />
              </AuthGuard>
            }
          >
            <Route index element={<TrashPage />} />
          </Route>
          
          <Route
            path="/folder/:folderId"
            element={
              <AuthGuard>
                <CustomerLayout />
              </AuthGuard>
            }
          >
            <Route index element={<></>} />
          </Route>
          
          <Route
            path="/customerprofile"
            element={
              <AuthGuard>
                <CustomerLayout />
              </AuthGuard>
            }
          >
            <Route index element={<ProfilePage />} />
          </Route>
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          {/* Catch all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;