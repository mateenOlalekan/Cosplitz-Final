import { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import { useUser, useOnboardingComplete, useKYCComplete, useJustRegistered } from "../../services/queries/auth";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const { data: user, isLoading } = useUser();
  const { data: onboardingComplete } = useOnboardingComplete();
  const { data: kycComplete } = useKYCComplete();
  const { data: justRegistered } = useJustRegistered();

  // Hide sidebar and header on onboarding and KYC pages
  const isFullScreenPage = location.pathname.includes("/dashboard/post-onboarding") || 
                           location.pathname.includes("/dashboard/kyc-flow");
  useEffect(() => {

    if (!user || isLoading) return;
    
    // If user is on a full-screen onboarding page, don't redirect
    if (isFullScreenPage) return;
    
    // Get fresh values from localStorage (more reliable than React Query cache)
    const freshJustRegistered = localStorage.getItem('justRegistered') === 'true';
    const freshOnboardingComplete = localStorage.getItem('onboardingComplete') === 'true';
    const freshKYCComplete = localStorage.getItem('kycComplete') === 'true';
    
    console.log('DashboardLayout redirect check:', {
      freshJustRegistered,
      freshOnboardingComplete,
      freshKYCComplete,
      currentPath: location.pathname
    });
    
    // SCENARIO 1: User just registered (after OTP) and hasn't clicked "Continue Setup"
    // They should be allowed to see the success screen in Register component
    // NOT redirected from here
    
    // SCENARIO 2: User is just registered (freshJustRegistered = true) but trying to access dashboard
    // They should be redirected to post-onboarding
    if (freshJustRegistered && location.pathname === '/dashboard') {
      console.log('New user trying to access dashboard, redirecting to post-onboarding');
      navigate('/dashboard/post-onboarding', { replace: true });
      return;
    }
    
    // SCENARIO 3: User has completed registration but not KYC
    // They should be on post-onboarding or kyc-flow
    if (!freshKYCComplete && !isFullScreenPage) {
      console.log('User needs KYC, redirecting to post-onboarding');
      navigate('/dashboard/post-onboarding', { replace: true });
      return;
    }
    
    // SCENARIO 4: Returning user without KYC
    if (!freshJustRegistered && !freshKYCComplete && !isFullScreenPage) {
      console.log('Returning user needs KYC, redirecting to post-onboarding');
      navigate('/dashboard/post-onboarding', { replace: true });
      return;
    }
  }, [user, isLoading, location.pathname, isFullScreenPage, navigate]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F7F5F9]">
        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F5F9]">
      {/* Hide sidebar on full-screen pages (post-onboarding, kyc-flow) */}
      {!isFullScreenPage && (
        <DashboardSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Hide header on full-screen pages (post-onboarding, kyc-flow) */}
        {!isFullScreenPage && (
          <DashboardHeader onMenuClick={toggleSidebar} hidden={hidden} setHidden={setHidden} />
        )}
        
        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ hidden }} />
        </main>
      </div>
    </div>
  );
}
