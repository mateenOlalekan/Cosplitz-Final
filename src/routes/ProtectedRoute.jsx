// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import LoadingSpinner from "../pages/Public/LoadingScreen";
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const location = useLocation();
  const { isAuthenticated, isAdmin, isInitialized } = useAuthStore();
  // Show loading while auth is initializing
  if (!isInitialized) {
    return (
      <>
        <LoadingSpinner />
      </>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if admin role is required
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

/**  Public Route Component * Redirects authenticated users away from auth pages */
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuthStore();
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;