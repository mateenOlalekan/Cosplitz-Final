import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {COL} from "../../utils/LoggerDefinition"

const log = (msg, style = COL.info, ...rest) =>
  console.log(`%c[AuthGuard] ${msg}`, style, ...rest);

export default function AuthGuard() {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuthStore();
  const isLoggedIn = isAuthenticated();

  // ✅ Show loading state while checking auth
  if (isLoading) {
    log('⏳ Checking authentication...', COL.info);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ✅ Not authenticated - redirect to login
  if (!isLoggedIn) {
    log('❌ User not authenticated, redirecting to login', COL.err);
    log('📍 Current location:', COL.info, location.pathname);
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // ✅ Authenticated - allow access
  log('✅ User authenticated, allowing access to protected route', COL.ok);
  return <Outlet />;
}