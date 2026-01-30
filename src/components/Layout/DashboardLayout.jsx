// src/components/Layout/DashboardLayout.jsx
// REFACTORED - Enforces registration flow

import { useState, useEffect, useCallback } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import { useUser, useRegistrationState } from "../../services/queries/auth";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const { data: user, isLoading: isUserLoading } = useUser();
  const { data: regState } = useRegistrationState();

  // Routes that don't show sidebar/header
  const isPostOnboarding = location.pathname.includes("/dashboard/post-onboarding");
  const isKYCFlow = location.pathname.includes("/dashboard/kyc-flow");
  const hideNavigation = isPostOnboarding || isKYCFlow;

  // Enforce registration flow
  useEffect(() => {
    if (isUserLoading || !user) return;

    console.log('📊 Registration State:', regState);
    console.log('📍 Current Path:', location.pathname);

    // If user exists but hasn't completed flow, redirect them
    if (regState) {
      // Not email verified - shouldn't happen if user exists, but redirect to register
      if (!regState.emailVerified) {
        console.log('⚠️ Email not verified, redirecting to register');
        navigate('/register', { replace: true });
        return;
      }

      // Email verified but needs onboarding
      if (regState.emailVerified && regState.needsOnboarding && !isPostOnboarding) {
        console.log('➡️ Redirecting to post-onboarding');
        navigate('/dashboard/post-onboarding', { replace: true });
        return;
      }

      // Onboarding done but needs KYC
      if (!regState.needsOnboarding && regState.needsKYC && !isKYCFlow) {
        console.log('➡️ Redirecting to KYC flow');
        navigate('/dashboard/kyc-flow', { replace: true });
        return;
      }

      // Flow completed - allow access to dashboard
      if (regState.flowCompleted && (isPostOnboarding || isKYCFlow)) {
        console.log('✅ Flow completed, redirecting to dashboard');
        navigate('/dashboard', { replace: true });
        return;
      }
    }
  }, [user, regState, location.pathname, navigate, isUserLoading, isPostOnboarding, isKYCFlow]);

  // Redirect to login if no user
  if (!isUserLoading && !user) {
    return <Navigate to="/login" replace />;
  }

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

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F7F5F9]">
        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F5F9]">
      {!hideNavigation && (
        <DashboardSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {!hideNavigation && (
          <DashboardHeader onMenuClick={toggleSidebar} />
        )}
        
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}