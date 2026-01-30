import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser, useJustRegistered, useOnboardingComplete, useKYCComplete } from "../../services/queries/auth";

export default function AuthGuard() {
  const { data: user, isLoading } = useUser();
  const { data: justRegistered } = useJustRegistered();
  const { data: onboardingComplete } = useOnboardingComplete();
  const { data: kycComplete } = useKYCComplete();
  const location = useLocation();
  
  // Get fresh values from localStorage to avoid React Query cache issues
  const getFreshState = () => {
    if (typeof window === 'undefined') {
      return { justRegistered: false, onboardingComplete: false, kycComplete: false };
    }
    return {
      justRegistered: localStorage.getItem('justRegistered') === 'true',
      onboardingComplete: localStorage.getItem('onboardingComplete') === 'true',
      kycComplete: localStorage.getItem('kycComplete') === 'true',
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F7F5F9]">
        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const { justRegistered: freshJustRegistered, kycComplete: freshKYCComplete } = getFreshState();
  
  // CRITICAL: If user just registered but hasn't completed KYC
  // Only allow access to onboarding routes
  const isOnboardingRoute = location.pathname.includes('/dashboard/post-onboarding') || 
                           location.pathname.includes('/dashboard/kyc-flow');
  
  if (freshJustRegistered && !freshKYCComplete && !isOnboardingRoute) {
    console.log('AuthGuard: New user trying to access protected route, redirecting to post-onboarding');
    return <Navigate to="/dashboard/post-onboarding" replace />;
  }

  return <Outlet />;
}
