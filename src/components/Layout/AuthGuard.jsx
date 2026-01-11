import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function AuthGuard({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, cameThroughAuth, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth(); // hydrate once
  }, [initializeAuth]);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login", { state: { from: location.pathname }, replace: true });
      return;
    }
    if (!cameThroughAuth) {
      // user is logged in but did NOT come through login/register
      navigate("/dashboard", { replace: true }); // or any “entry” page you like
    }
  }, [isAuthenticated, cameThroughAuth, navigate, location]);

  if (!isAuthenticated() || !cameThroughAuth) return null; // avoid flash
  return children;
}