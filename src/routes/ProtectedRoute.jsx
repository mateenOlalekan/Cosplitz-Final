// src/routes/ProtectedRoute.jsx
import Loading from "../components/Home/Loading";
// src/components/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const location = useLocation();
  const { isAuthenticated, isAdmin, initializeAuth, isLoading } = useAuthStore();
  
  // State to track if we've checked auth
  const [authChecked, setAuthChecked] = useState(false);
  
  useEffect(() => {
    // Initialize auth from storage on mount
    const checkAuth = async () => {
      try {
        await initializeAuth();
      } catch (error) {
        console.error("Auth initialization failed:", error);
      } finally {
        setAuthChecked(true);
      }
    };
    
    checkAuth();
  }, [initializeAuth]);
  
  // Show loading while checking auth
  if (isLoading || !authChecked) {
    return (
      <>
        <Loading/>
      </>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated()) {
    // Save the current location to redirect back after login
    const redirectUrl = location.pathname !== "/login" ? location.pathname + location.search : "/dashboard";
    
    return <Navigate to="/login" state={{ from: { pathname: redirectUrl } }} replace />;
  }
  
  // If admin required but user is not admin, redirect to dashboard or home
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // If authenticated (and admin if required), render children
  return children;
}