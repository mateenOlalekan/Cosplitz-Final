// src/components/Layout/DashboardLayout.jsx
import { useState, useEffect, useCallback } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import { useAuth } from "../../hooks/useAuth"; // Use new hook

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  const { user, isLoading, isAuthenticated } = useAuth(); // Use centralized auth hook

  // Hide sidebar + header only on post-onboarding route
  const isPostOnboarding = location.pathname.includes("/dashboard/post-onboarding");

  // Close sidebar on window resize to desktop
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F7F5F9]">
        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Redirect if not authenticated (fallback if AuthGuard fails)
  if (!isAuthenticated && !isPostOnboarding) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F5F9]">
      {!isPostOnboarding && (
        <DashboardSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {!isPostOnboarding && (
          <DashboardHeader onMenuClick={toggleSidebar} />
        )}
        
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}