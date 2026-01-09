// import { useState, useEffect } from "react";
// import { Outlet } from "react-router-dom";
// import Sidebar from "./DashboardSidebar";
// import Header from "./DashboardHeader";

// export default function DashboardLayout() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   const [isAnimating, setIsAnimating] = useState(false);

//   // Detect screen size
//   useEffect(() => {
//     const handleResize = () => setIsMobile(window.innerWidth < 1024);
//     handleResize(); // Initial check
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const handleSidebarToggle = () => {
//     if (isAnimating) return;
    
//     setIsAnimating(true);
//     setSidebarOpen(!sidebarOpen);
    
//     // Reset animation state after animation completes
//     setTimeout(() => {
//       setIsAnimating(false);
//     }, 700); // Match the sidebar animation duration
//   };

//   return (
//     <div className="flex min-h-screen h-screen w-full overflow-hidden">
//       {/* Sidebar */}
//       <Sidebar
//         sidebarOpen={sidebarOpen}
//         isMobile={isMobile}
//         setSidebarOpen={setSidebarOpen}
//       />

//       {/* Main Content Area */}
//       <div className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-700 ease-in-out">
//         {/* Header */}
//         <Header
//           sidebarOpen={sidebarOpen}
//           setSidebarOpen={handleSidebarToggle}
//           isMobile={isMobile}
//         />

//         {/* Outlet renders nested dashboard pages */}
//         <main className="flex-1 overflow-y-auto bg-[#F7F5F9] transition-all duration-700 ease-in-out">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// }

// DashboardLayout.jsx - REFACTORED & DEBUGGED
import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Sidebar from "./DashboardSidebar";
import Header from "./DashboardHeader";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();

  // Initialize authentication on mount
  useEffect(() => {
    const init = async () => {
      try {
        await initializeAuth();
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        setIsInitialized(true);
      }
    };
    
    init();
  }, [initializeAuth]);

  // Check screen size and adjust sidebar
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // Auto-close sidebar on mobile, auto-open on desktop
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Redirect if not authenticated after initialization
  useEffect(() => {
    if (isInitialized && !isLoading) {
      if (!isAuthenticated()) {
        navigate("/login", { 
          state: { from: window.location.pathname },
          replace: true 
        });
      }
    }
  }, [isInitialized, isLoading, isAuthenticated, navigate]);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Show loading while initializing
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5F9]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full bg-[#F7F5F9] overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        isMobile={isMobile}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        isMobile ? 'w-full' : sidebarOpen ? 'lg:ml-64' : ''
      }`}>
        {/* Header */}
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={handleSidebarToggle}
          isMobile={isMobile}
        />

        {/* Main Content - Outlet renders nested dashboard pages */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}