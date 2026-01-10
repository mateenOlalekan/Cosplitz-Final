import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Loading from "../components/Home/Loading";

export default function AdminRoute() {
  const location = useLocation();
  const { isAuthenticated, isAdmin, initializeAuth, isLoading } = useAuthStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      await initializeAuth();
      setChecked(true);
    };
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // initializeAuth is stable from Zustand store

  if (!checked || isLoading) return <Loading />;

  if (!isAuthenticated()) return <Navigate to="/login" state={{ from: location }} replace />;

  if (!isAdmin()) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}