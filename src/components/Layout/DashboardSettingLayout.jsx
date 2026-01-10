import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Sidebar from "../../components/Layout/DashboardSidebar";
import LogoutModal from "../Settings/LogoutModal";
import DeleteAccountModal from "../Settings/DeleteAccount";

export default function SettingsLayout() {
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { logout, user } = useAuthStore();

  /* ---------- handlers ---------- */
  const handleLogout = () => {
    logout();          // clears token + user + redirects to /login
    setLogoutOpen(false);
  };

  const handleDelete = async () => {
    /* optional: call DELETE /api/user  before logout */
    // await authService.deleteAccount(user.id);
    logout();          // same end-result for now
    setDeleteOpen(false);
  };

  /* ---------- modal body-scroll lock ---------- */
  useState(() => {
    const toggle = (isOpen) => (document.body.style.overflow = isOpen ? "hidden" : "");
    toggle(logoutOpen || deleteOpen);
    return () => (document.body.style.overflow = "");
  }, [logoutOpen, deleteOpen]);

  return (
    <>
      <div className="flex h-full p-2 gap-3 overflow-hidden">
        <Sidebar onLogout={() => setLogoutOpen(true)} onDelete={() => setDeleteOpen(true)} />

        <main
          className={`flex-1 bg-white rounded-lg overflow-hidden flex-col ${
            location.pathname === "/dashboard/settings" ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="flex-1 overflow-y-auto bg-white p-2 rounded-lg">
            <div className="bg-[#F7F5F9] p-3 rounded-lg">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      <LogoutModal open={logoutOpen} onClose={() => setLogoutOpen(false)} onConfirm={handleLogout} />
      <DeleteAccountModal open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} />
    </>
  );
}