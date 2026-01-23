// src/components/Settings/DashboardSettingLayout.jsx
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import DashboardSidebar from "../../pages/Dashboard/Settings/Sidebar";
import LogoutModal from "../Settings/LogoutModal";
import DeleteAccountModal from "../Settings/DeleteAccount";
import { Link } from "react-router-dom";


export default function DashboardSettingLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  
  useEffect(() => {
    document.body.style.overflow = (showLogoutModal || showDeleteModal) ? "hidden" : "";
    return () => document.body.style.overflow = "";
  }, [showLogoutModal, showDeleteModal]);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <DashboardSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Settings-specific header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Manage your account preferences</p>
            </div>

            {/* Settings navigation tabs (optional) */}


            {/* Nested settings routes render here */}
            <Outlet context={{ 
              setShowLogoutModal, 
              setShowDeleteModal 
            }} />
          </div>
        </main>
      </div>

      {/* Modals */}
      <LogoutModal 
        open={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
        onConfirm={() => {
          useAuthStore.getState().logout();
        }} 
      />
      <DeleteAccountModal 
        open={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        onConfirm={() => {
          // Add delete account API call here
          useAuthStore.getState().logout();
        }} 
      />
    </div>
  );
}