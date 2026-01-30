// src/components/Layout/DashboardLayout.jsx - NO CHANGES
import { useState, useEffect, useCallback } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import { useUser } from "../../services/queries/auth";
import Loading from "../../pages/Public/LoadingScreen";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  const { data: user, isLoading } = useUser();

  const isPostOnboarding = location.pathname.includes("/dashboard/post-onboarding");

  if (!isLoading && !user && !isPostOnboarding) {
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

  if (isLoading) return <Loading/>;

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