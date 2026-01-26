// src/components/Layout/DashboardSettingLayout.jsx
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import LogoutModal from "../Settings/LogoutModal";
import DeleteAccountModal from "../Settings/DeleteAccount";
import { useLogout } from "../../services/queries/auth";

export default function DashboardSettingLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const logout = useLogout();

  useEffect(() => {
    document.body.style.overflow = (showLogoutModal || showDeleteModal) ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showLogoutModal, showDeleteModal]);

  const closeSidebar = () => setSidebarOpen(false);

  const handleLogoutConfirm = async () => {
    try {
      await logout.mutateAsync();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await logout.mutateAsync();
    } catch (error) {
      console.error("Delete account failed:", error);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <DashboardSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Manage your account preferences</p>
            </div>

            <Outlet context={{ setShowLogoutModal, setShowDeleteModal }} />
          </div>
        </main>
      </div>

      <LogoutModal 
        open={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
        onConfirm={handleLogoutConfirm}
        isLoading={logout.isPending}
      />
      
      <DeleteAccountModal 
        open={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}