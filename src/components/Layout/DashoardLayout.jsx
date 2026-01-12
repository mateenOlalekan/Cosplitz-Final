import { useState, useEffect, useCallback, useRef } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./DashboardSidebar";
import Header from "./DashboardHeader";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimerRef = useRef(null);

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

  return (
    <div className="flex min-h-screen h-screen w-full overflow-hidden">
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
        <main className="flex-1 overflow-y-auto bg-[#F7F5F9]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}