import { useState,useEffect } from "react";
import { useLocation, Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import LogoutModal from "../../../components/Settings/LogoutModal"; 
import DeleteAccountModal from "../../../components/Settings/DeleteAccount";

export default function SettingsLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const isRootSettings = location.pathname === "/dashboard/settings";

useEffect(() => {
  if (isLogoutModalOpen || isDeleteModalOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
}, [isLogoutModalOpen, isDeleteModalOpen]);  

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLogoutModalOpen(false);
    navigate("/login");
  };

  const handleDeleteAccount = () => {
    localStorage.clear();
    setIsDeleteModalOpen(false);
    navigate("/login");
  };

  return (
    <>
      <div className="flex h-full p-2 gap-3 overflow-hidden">
        
        {/* Sidebar */}
        <Sidebar
          onLogout={() => setIsLogoutModalOpen(true)}
          onDelete={() => setIsDeleteModalOpen(true)}
        />

        {/* Content */}
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
