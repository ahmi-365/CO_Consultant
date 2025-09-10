// components/auth/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { authService } from "@/services/Auth-service";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  redirectTo = "/login"
}) => {
  const location = useLocation();
  const user = authService.getUser();
  const token = authService.getToken();

  // Check if user is authenticated
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

export const RoleBasedRedirect: React.FC = () => {
  const user = authService.getUser();
  const token = authService.getToken();

  // If not authenticated, go to login
  if (!token || !user) {
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

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'customer';
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requiredRole 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = authService.getToken();
      const userData = authService.getUser();
      
      if (!token || !userData) {
        setIsLoading(false);
        return;
      }

      // You could also validate token here with an API call
      setUser(userData);
      setIsLoading(false);
    };

    checkAuth();
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