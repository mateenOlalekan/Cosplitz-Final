// src/components/Dashboard/DashboardLayout.jsx
import { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Hide sidebar + header only on post-onboarding route
  const isPostOnboarding = location.pathname.includes("/dashboard/post-onboarding");

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

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F5F9]">

      {/* Sidebar (hidden on post-onboarding) */}
      {!isPostOnboarding && (
        <DashboardSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header (hidden on post-onboarding) */}
        {!isPostOnboarding && (
          <DashboardHeader onMenuClick={toggleSidebar} />
        )}

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
