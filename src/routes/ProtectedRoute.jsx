// src/routes/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import Loading from "../components/Home/Loading";

export default function ProtectedRoute() {
  const location = useLocation();

  const {user,token,isLoading,initializeAuth,} = useAuthStore();

  // Initialize auth ONCE
  useEffect(() => {
    if (!user && token) {
      initializeAuth();
    }
  }, [user, token, initializeAuth]);

  // Still loading auth state
  if (isLoading) {
    return <Loading />;
  }

  // Not authenticated → redirect
  if (!token || !user) {
    return (
      <Navigate to="/login" replace state={{ from: location }}/>
    );
  }

  // Authenticated → allow access
  return <Outlet />;
}
