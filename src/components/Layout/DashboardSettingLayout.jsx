import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from ".";
import LogoutModal from "../Settings/LogoutModal";
import DeleteAccountModal from "../Settings/DeleteAccount";
import { useAuthStore } from "../../store/authStore";

export default function DashboardSettingLayout() {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = isLogoutModalOpen || isDeleteModalOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [isLogoutModalOpen, isDeleteModalOpen]);

  // Close sidebar when navigating to settings (mobile)
  const handleSidebarToggle = () => {
    if (window.innerWidth < 1024) {
      // This would be handled by parent, but we keep it for safety
    }
  };

  return (
    <>
      <div className="flex h-full p-2 gap-3 overflow-hidden">
        <Sidebar 
          onSidebarToggle={handleSidebarToggle}
          sidebarOpen={false} // These props will be managed by parent in real use
          isMobile={false}
          setSidebarOpen={() => {}}
        />
        <main className="flex-1 bg-white rounded-lg overflow-hidden flex flex-col">
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
        onConfirm={() => useAuthStore.getState().logout()} 
      />
      <DeleteAccountModal 
        open={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={() => useAuthStore.getState().logout()} 
      />
    </>
  );
}