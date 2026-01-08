import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./DashboardSidebar";
import Header from "./DashboardHeader";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSidebarToggle = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSidebarOpen(!sidebarOpen);
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 700); // Match the sidebar animation duration
  };

  return (
    <div className="flex min-h-screen h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        isMobile={isMobile}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-700 ease-in-out">
        {/* Header */}
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={handleSidebarToggle}
          isMobile={isMobile}
        />

        {/* Outlet renders nested dashboard pages */}
        <main className="flex-1 overflow-y-auto bg-[#F7F5F9] transition-all duration-700 ease-in-out">
          <Outlet />
        </main>
      </div>
    </div>
  );
}