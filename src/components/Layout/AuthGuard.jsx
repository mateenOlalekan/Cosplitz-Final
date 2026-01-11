import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function AuthGuard({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAuthInitialized, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth(); // one-shot hydration-safe init
  }, [initializeAuth]);

  useEffect(() => {
    if (!isAuthInitialized()) return; // wait for store to hydrate
    if (!isAuthenticated()) {
      navigate("/login", { state: { from: location.pathname }, replace: true });
    }
  }, [isAuthenticated, isAuthInitialized, navigate, location]);

  if (!isAuthInitialized() || !isAuthenticated()) return null; // avoid flash

  return children;
}