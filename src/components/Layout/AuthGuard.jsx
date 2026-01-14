import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
export default function AuthGuard() {
  const { isAuthenticated } = useAuthStore();
  const isLoggedIn = isAuthenticated();
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}