// components/auth/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { authService } from "@/services/Auth-service";
import { useEffect, useState } from "react";

export const ProtectedRoute = ({
  children,
  allowedRoles = [],
  redirectTo = "/login"
}) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkToken = () => {
      const token = authService.getToken();
      const user = authService.getUser();
      
      if (!token || !user) {
        setIsAuthenticated(false);
        setIsLoading(false);
      } else {
        setIsAuthenticated(true);
        setIsLoading(false);
      }
    };

    checkToken();

    // Set up interval to check token expiration periodically
    const interval = setInterval(checkToken, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  const user = authService.getUser();
  const token = authService.getToken();

  // Double check (should not happen due to state, but just in case)
  if (!token || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (allowedRoles.length > 0) {
    const userRoles = user.roles || [];
    const hasRequiredRole = allowedRoles.some(role => 
      userRoles.includes(role)
    );

    if (!hasRequiredRole) {
      // Redirect based on user role
      if (userRoles.includes('admin')) {
        return <Navigate to="/dash" replace />;
      } else {
        return <Navigate to="/filemanager" replace />;
      }
    }
  }

  return <>{children}</>;
};
export const RoleBasedRedirect = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkToken = () => {
      const token = authService.getToken();
      const userData = authService.getUser();

      if (!token || !userData) {
        setIsChecking(false);
        return;
      }

      setUser(userData);
      setIsChecking(false);
    };

    checkToken();

    const interval = setInterval(checkToken, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not authenticated, go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  const userRoles = user.roles || [];
  
  if (userRoles.includes('admin')) {
    return <Navigate to="/dash" replace />;
  } else if (userRoles.includes('customer') || userRoles.length === 0) {
    return <Navigate to="/filemanager" replace />;
  }

  // Default fallback
  return <Navigate to="/filemanager" replace />;
};
// components/auth/AuthGuard.tsx
export const AuthGuard = ({
  children,
  requiredRole
}) => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = authService.getToken();
      const userData = authService.getUser();

      if (!token || !userData) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      setUser(userData);
      setIsLoading(false);
    };

    checkAuth();

    // Add interval check for token expiration
    const interval = setInterval(checkAuth, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirement
  if (requiredRole) {
    const userRoles = user.roles || [];

    if (!userRoles.includes(requiredRole)) {
      // Redirect to appropriate dashboard based on actual role
      if (userRoles.includes('admin')) {
        return <Navigate to="/dash" replace />;
      } else {
        return <Navigate to="/filemanager" replace />;
      }
    }
  }

  return <>{children}</>;
};