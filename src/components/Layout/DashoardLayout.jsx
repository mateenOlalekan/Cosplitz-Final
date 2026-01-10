import { useState, useEffect, useCallback, useRef } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Layout/DashboardSidebar";
import Header from "../Layout/DashboardHeader";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimerRef = useRef(null);

  // Detect screen size with debouncing
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      
      // Auto-close sidebar on mobile resize
      if (window.innerWidth < 1024 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    
    handleResize();
    
    let resizeTimer;
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 150);
    };
    
    window.addEventListener("resize", debouncedResize);
    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(resizeTimer);
    };
  }, [sidebarOpen]);

  // Cleanup animation timer on unmount
  useEffect(() => {
    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, []);

  const handleSidebarToggle = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSidebarOpen(prev => !prev);
    
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
    }
    
    animationTimerRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  }, [isAnimating]);

  return (
    <div className="flex min-h-screen h-screen w-full overflow-hidden">
      <Sidebar
        sidebarOpen={sidebarOpen}
        isMobile={isMobile}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={handleSidebarToggle}
          isMobile={isMobile}
        />

        <main className="flex-1 overflow-y-auto bg-[#F7F5F9]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}