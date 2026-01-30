// src/components/Layout/DashboardLayout.jsx
// FIXED - Improved redirect logic and error handling

import { useState, useEffect, useCallback, useRef } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import { useUser, useRegistrationState } from "../../services/queries/auth";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const hasRedirected = useRef(false); // Prevent multiple redirects
  
  const { data: user, isLoading: isUserLoading, isError: isUserError } = useUser();
  const { data: regState, isLoading: isRegStateLoading } = useRegistrationState();

  // Routes that don't show sidebar/header
  const isPostOnboarding = location.pathname.includes("/dashboard/post-onboarding");
  const isKYCFlow = location.pathname.includes("/dashboard/kyc-flow");
  const hideNavigation = isPostOnboarding || isKYCFlow;

  // Search focus handlers
  const handleSearchFocus = useCallback(() => setIsSearchFocused(true), []);
  const handleSearchBlur = useCallback(() => setIsSearchFocused(false), []);

  // Enforce registration flow - FIXED to prevent race conditions
  useEffect(() => {
    // Don't do anything while loading
    if (isUserLoading || isRegStateLoading) return;
    
    // Don't redirect if already redirected in this session
    if (hasRedirected.current) return;

    // If no user and not loading, redirect to login
    if (!user && !isUserLoading) {
      console.log('⚠️ No user found, should redirect to login');
      return; // Let the Navigate component handle this
    }

    // If we have a user, check registration state
    if (user && regState) {
      console.log('📊 Registration State:', regState);
      console.log('📍 Current Path:', location.pathname);

      // Email not verified - redirect to register
      if (!regState.emailVerified) {
        console.log('⚠️ Email not verified, redirecting to register');
        hasRedirected.current = true;
        navigate('/register', { replace: true });
        return;
      }

      // Email verified but needs onboarding
      if (regState.emailVerified && regState.needsOnboarding && !isPostOnboarding) {
        console.log('➡️ Redirecting to post-onboarding');
        hasRedirected.current = true;
        navigate('/dashboard/post-onboarding', { replace: true });
        return;
      }

      // Onboarding done but needs KYC
      if (regState.emailVerified && !regState.needsOnboarding && regState.needsKYC && !isKYCFlow) {
        console.log('➡️ Redirecting to KYC flow');
        hasRedirected.current = true;
        navigate('/dashboard/kyc-flow', { replace: true });
        return;
      }

      // Flow completed - allow access to dashboard
      if (regState.flowCompleted && (isPostOnboarding || isKYCFlow)) {
        console.log('✅ Flow completed, redirecting to dashboard');
        hasRedirected.current = true;
        navigate('/dashboard', { replace: true });
        return;
      }
    }

    // Reset redirect flag after navigation completes
    const timer = setTimeout(() => {
      hasRedirected.current = false;
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, regState, location.pathname, navigate, isUserLoading, isRegStateLoading, isPostOnboarding, isKYCFlow]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
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

  // Loading state
  if (isUserLoading || isRegStateLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F7F5F9]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-green-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user && !isUserLoading) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Error state
  if (isUserError) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F7F5F9]">
        <div className="text-center p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">Please try refreshing the page</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Refresh Page
          </button>
        </div>
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
          <DashboardHeader 
            onMenuClick={toggleSidebar}
            onSearchFocus={handleSearchFocus}
            onSearchBlur={handleSearchBlur}
          />
        )}
        
        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ isSearchFocused }} />
        </main>
      </div>
    </div>
  );
}