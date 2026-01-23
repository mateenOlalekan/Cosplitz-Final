import { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import useAuthStore from "../../store/authStore";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading());
  // Hide sidebar + header only on post-onboarding route
  const isPostOnboarding = location.pathname.includes("/dashboard/post-onboarding");

    if (!user && !isLoading) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = useCallback(() => {setSidebarOpen(prev => !prev);}, []);
  const closeSidebar = useCallback(() => {setSidebarOpen(false);}, []);

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
