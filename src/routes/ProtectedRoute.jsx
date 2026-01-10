import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Loading from "../components/Home/Loading";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const { isAuthenticated, initializeAuth, isLoading } = useAuthStore();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      await initializeAuth();
      setAuthChecked(true);
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // initializeAuth is stable from Zustand store

  if (!authChecked || isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}