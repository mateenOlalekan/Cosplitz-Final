// src/components/Layout/DashboardLayout.jsx
import { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import { useUser } from "../../services/queries/auth";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const location = useLocation();
  
  const { data: user, isLoading } = useUser();

  // Hide sidebar and header on onboarding and KYC pages
  const isFullScreenPage = location.pathname.includes("/dashboard/post-onboarding") || 
                           location.pathname.includes("/dashboard/kyc-flow");

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