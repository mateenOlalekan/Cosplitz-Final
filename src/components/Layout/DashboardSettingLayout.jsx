import { useState, useEffect } from "react";
import { useLocation, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Sidebar from "../../components/Layout/DashboardSidebar";
import LogoutModal from "../Settings/LogoutModal";
import DeleteAccountModal from "../Settings/DeleteAccount";

export default function SettingsLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    isAuthenticated,
    isLoading,
    initializeAuth,
    user,
    logout,
  } = useAuthStore();
  
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  
  const isRootSettings = location.pathname === "/dashboard/settings";

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        initializeAuth();
      } finally {
        setAuthChecked(true);
      }
    };
    
    initAuth();
  }, [initializeAuth]);

  // Redirect if not authenticated (after auth check)
  useEffect(() => {
    if (authChecked && !isLoading && !isAuthenticated()) {
      navigate("/login", {
        state: { from: location.pathname },
        replace: true,
      });
    }
  }, [authChecked, isLoading, isAuthenticated, navigate, location.pathname]);

  // Handle body overflow for modals
  useEffect(() => {
    if (isLogoutModalOpen || isDeleteModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLogoutModalOpen, isDeleteModalOpen]);

  const handleLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
  };

  const handleDeleteAccount = () => {
    // API call would go here
    logout();
    setIsDeleteModalOpen(false);
  };

  // Show loading while checking auth
  if (isLoading || !authChecked) {
    return (
      <div className="flex h-full items-center justify-center bg-[#F7F5F9]">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated()) {
    return null;
  }

  return (
    <>
      <div className="flex h-full p-2 gap-3 overflow-hidden">
        <Sidebar
          onLogout={() => setIsLogoutModalOpen(true)}
          onDelete={() => setIsDeleteModalOpen(true)}
        />

        <main
          className={`flex-1 bg-white rounded-lg overflow-hidden
            ${isRootSettings ? "hidden md:flex" : "flex"}
            flex-col
          `}
        >
          <div className="flex-1 overflow-y-auto bg-white p-2 rounded-lg">
            <div className="bg-[#F7F5F9] p-3 rounded-lg">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      <LogoutModal
        open={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />

      <DeleteAccountModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
      />
    </>
  );
}