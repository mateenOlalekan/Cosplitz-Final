import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../../services/queries/auth";
import { getRegistrationStep, REGISTRATION_STEPS } from "../../services/endpoints/auth";

export default function AuthGuard() {
  const { data: user, isLoading } = useUser();
  const location = useLocation();
  const flowStep = getRegistrationStep();
  
  console.log('🔐 AuthGuard check:', {
    path: location.pathname,
    hasUser: !!user,
    flowStep,
    isLoading
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F7F5F9]">
        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ❌ No user = redirect to login
  if (!user) {
    console.log('🔒 No authenticated user, redirecting to login');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // ✅ User is authenticated
  // Now check if they're in the middle of registration flow

  // 🟢 CRITICAL: These are the ONLY routes accessible during incomplete registration
  const isOnboardingFlowRoute = 
    location.pathname === '/dashboard/post-onboarding' ||
    location.pathname === '/dashboard/kyc-flow';

  // 🟢 User hasn't finished OTP verification yet
  const needsOTPVerification = [
    REGISTRATION_STEPS.REGISTERED,
    REGISTRATION_STEPS.AUTO_LOGGED_IN,
    REGISTRATION_STEPS.OTP_SENT,
  ].includes(flowStep);

  // 🟢 User verified OTP but hasn't completed onboarding
  const needsOnboarding = [
    REGISTRATION_STEPS.OTP_VERIFIED,
    REGISTRATION_STEPS.SUCCESS_SHOWN,
  ].includes(flowStep);

  // 🟢 User completed onboarding but needs KYC
  const needsKYC = flowStep === REGISTRATION_STEPS.POST_ONBOARDING_COMPLETE;

  // 🚨 CRITICAL REDIRECT LOGIC
  
  // If they still need OTP verification and try to access ANY /dashboard route
  // We DON'T redirect - we let them hit the register page's restore logic
  if (needsOTPVerification) {
    console.log('⚠️ User needs OTP verification, staying on current route');
    // Return null to prevent rendering - they'll stay where they are
    return null;
  }

  // If they need onboarding but try to access non-onboarding routes
  if (needsOnboarding && location.pathname !== '/dashboard/post-onboarding') {
    console.log('📝 User needs post-onboarding, redirecting');
    return <Navigate to="/dashboard/post-onboarding" replace />;
  }

  // If they need KYC but try to access non-KYC routes
  if (needsKYC && location.pathname !== '/dashboard/kyc-flow') {
    console.log('🆔 User needs KYC, redirecting');
    return <Navigate to="/dashboard/kyc-flow" replace />;
  }

  // ✅ User is fully verified and can access any protected route
  console.log('✅ AuthGuard passed for:', location.pathname);
  return <Outlet />;
}