import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Loading from "../components/Home/Loading";

export default function AdminRoute() {
  const location = useLocation();
  const { isAuthenticated, isAdmin, initializeAuth, isLoading } = useAuthStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    initializeAuth();
    setChecked(true);
  }, [initializeAuth]);

  if (!checked || isLoading) return <Loading />;

  if (!isAuthenticated()) return <Navigate to="/login" state={{ from: location }} replace />;

  if (!isAdmin()) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}