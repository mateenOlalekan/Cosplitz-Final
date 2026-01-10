import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Loading from "../components/Home/Loading";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const { isAuthenticated, initializeAuth, isLoading } = useAuthStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    initializeAuth(); // hydrate token + user
    setChecked(true);
  }, [initializeAuth]);

  if (!checked || isLoading) return <Loading />; // splash while hydrating

  return isAuthenticated() ? (
    children
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
}