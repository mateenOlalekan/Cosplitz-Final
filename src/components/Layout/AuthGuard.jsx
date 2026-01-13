// import { Navigate, Outlet } from 'react-router-dom';
// import { useAuthStore } from '../../store/authStore';

// export default function AuthGuard() {
//   const { isAuthenticated } = useAuthStore();
//   return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
// }

// src/guards/AuthGuard.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function AuthGuard() {
  const location = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Wait for auth initialization to complete
    const timer = setTimeout(() => setIsCheckingAuth(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Show loading spinner while checking auth state
  if (authLoading || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login with return URL
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected route
  return <Outlet />;
}