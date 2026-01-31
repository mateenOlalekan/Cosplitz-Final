import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../../services/queries/auth";
import { getRegistrationStep, REGISTRATION_STEPS } from "../../services/endpoints/auth";

export default function AuthGuard() {
  const { data: user, isLoading } = useUser();
  const location = useLocation();
  const flowStep = getRegistrationStep();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F7F5F9]">
        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    console.log('🔒 No authenticated user, redirecting to login');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 🟢 Prevent access to protected routes during registration flow
  const isInRegistrationFlow = [
    REGISTRATION_STEPS.REGISTERED,
    REGISTRATION_STEPS.AUTO_LOGGED_IN,
    REGISTRATION_STEPS.OTP_SENT,
  ].includes(flowStep);

  // Allow access to verification routes even during registration
  const isVerificationRoute = location.pathname.includes('/verify-email') || 
                              location.pathname.includes('/post-onboarding') ||
                              location.pathname.includes('/kyc-flow');

  if (isInRegistrationFlow && !isVerificationRoute) {
    console.log('⚠️ User in registration flow, cannot access:', location.pathname);
    console.log('📍 Redirecting to registration page');
    return <Navigate to="/register" replace />;
  }

  console.log('✅ AuthGuard passed, allowing access to:', location.pathname);
  return <Outlet />;
}