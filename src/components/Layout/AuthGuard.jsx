// src/components/Auth/AuthGuard.jsx - NO CHANGES
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../../services/queries/auth";

export default function AuthGuard() {
  const { data: user, isLoading } = useUser();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F7F5F9]">
        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}