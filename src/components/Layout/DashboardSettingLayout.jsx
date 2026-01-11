import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Layout/DashboardSidebar";
import LogoutModal from "../Settings/LogoutModal";
import DeleteAccountModal from "../Settings/DeleteAccount";

export default function SettingsLayout() {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  /* ---------- lock body scroll when modal open ---------- */
  useEffect(() => {
    document.body.style.overflow = isLogoutModalOpen || isDeleteModalOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [isLogoutModalOpen, isDeleteModalOpen]);

  return (
    <>
      <div className="flex h-full p-2 gap-3 overflow-hidden">
        <Sidebar onLogout={() => setIsLogoutModalOpen(true)} onDelete={() => setIsDeleteModalOpen(true)} />
        <main
          className={`flex-1 bg-white rounded-lg overflow-hidden ${
            location.pathname === "/dashboard/settings" ? "hidden md:flex" : "flex"
          } flex-col`}
        >
          <div className="flex-1 overflow-y-auto bg-white p-2 rounded-lg">
            <div className="bg-[#F7F5F9] p-3 rounded-lg">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      <LogoutModal open={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} onConfirm={() => useAuthStore.getState().logout()} />
      <DeleteAccountModal open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={() => useAuthStore.getState().logout()} />
    </>
  );
}