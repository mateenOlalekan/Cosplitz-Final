import { useState, useEffect } from "react";
import { useLocation, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Sidebar from "../../components/Layout/DashboardSidebar";
import LogoutModal from "../Settings/LogoutModal"; 
import DeleteAccountModal from "../Settings/DeleteAccount";

export default function SettingsLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, initializeAuth, isAuthInitialized } = useAuthStore();
  
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const isRootSettings = location.pathname === "/dashboard/settings";

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Only check authentication after auth is initialized
  useEffect(() => {
    if (isAuthInitialized() && !isAuthenticated()) {
      navigate("/login", { 
        state: { from: window.location.pathname },
        replace: true 
      });
    }
  }, [isAuthenticated, navigate, isAuthInitialized]);

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
    useAuthStore.getState().logout();
    setIsLogoutModalOpen(false);
  };

  const handleDeleteAccount = () => {
    // In a real app, you would call an API to delete the account
    // For now, we'll just logout
    useAuthStore.getState().logout();
    setIsDeleteModalOpen(false);
  };

  // Show loading while auth is initializing
  if (isLoading || !isAuthInitialized()) {
    return (
      <div className="flex h-full items-center justify-center bg-[#F7F5F9]">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated
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