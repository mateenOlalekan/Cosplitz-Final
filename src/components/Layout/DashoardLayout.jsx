// src/layout/DashboardLayout.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Sidebar from "./DashboardSidebar";
import Header from "./DashboardHeader";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimerRef = useRef(null);
  const location = useLocation();

  // Check if we're on a settings page
  const isSettingsRoute = location.pathname.startsWith("/dashboard/settings");

  // Responsive handling
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile && sidebarOpen) setSidebarOpen(false);
    };
    
    handleResize();
    const debounced = () => setTimeout(handleResize, 150);
    window.addEventListener("resize", debounced);
    
    return () => {
      window.removeEventListener("resize", debounced);
      clearTimeout(animationTimerRef.current);
    };
  }, [sidebarOpen]);

  useEffect(() => {
    return () => clearTimeout(animationTimerRef.current);
  }, []);

  // Toggle sidebar with animation guard
  const handleSidebarToggle = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSidebarOpen((s) => !s);
    animationTimerRef.current = setTimeout(() => setIsAnimating(false), 300);
  }, [isAnimating]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  return (
    <div className="flex min-h-screen h-screen w-full overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        isMobile={isMobile} 
        setSidebarOpen={setSidebarOpen} 
        onSidebarToggle={handleSidebarToggle}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          isMobile={isMobile}
          onSidebarToggle={handleSidebarToggle}
        />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#F7F5F9] p-4 lg:p-6">
          {/* Render settings layout for settings routes */}
          {isSettingsRoute ? (
            <DashboardSettingLayoutWrapper />
          ) : (
            <div className="h-full">
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Wrapper component to render settings within dashboard layout
function DashboardSettingLayoutWrapper() {
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  useEffect(() => {
    if (location.state?.showLogoutModal) {
      setShowLogoutModal(true);
    }
  }, [location.state]);

  return (
    <div className="h-full">
      <DashboardSettingLayout />
    </div>
  );
}