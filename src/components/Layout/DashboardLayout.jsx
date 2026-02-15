import { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import { useUser, useJustRegistered, useOnboardingComplete } from "../../services/queries/auth";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const { data: user, isLoading } = useUser();
  const { data: justRegistered } = useJustRegistered();
  const { data: onboardingComplete } = useOnboardingComplete();

  // Hide sidebar and header on onboarding and KYC pages
  const isFullScreenPage = location.pathname.includes("/dashboard/post-onboarding") || 
                           location.pathname.includes("/dashboard/kyc-flow");

  // CRITICAL: Redirect to onboarding if user hasn't completed it
  useEffect(() => {
    // Skip checks if still loading or no user
    if (isLoading || !user) return;
    
    // Don't redirect if already on onboarding pages
    if (isFullScreenPage) return;
    
    console.log('DashboardLayout - Checking onboarding status:', {
      justRegistered,
      onboardingComplete,
      currentPath: location.pathname
    });
    
    // If user just registered and hasn't completed onboarding, redirect to post-onboarding
    if (justRegistered === true && onboardingComplete === false) {
      console.log('User needs onboarding, redirecting to post-onboarding');
      navigate('/dashboard/post-onboarding', { replace: true });
    }
  }, [user, isLoading, justRegistered, onboardingComplete, isFullScreenPage, location.pathname, navigate]);

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