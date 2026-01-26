// src/components/Auth/AuthGuard.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth"; // Use new hook

export default function AuthGuard() {
  const { isAuthenticated, isLoading } = useAuth(); // Use centralized auth hook
  const location = useLocation();

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F7F5F9]">
        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}