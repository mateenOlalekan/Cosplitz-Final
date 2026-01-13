// src/layout/DashboardSettingLayout.jsx
import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import LogoutModal from "../Settings/LogoutModal";
import DeleteAccountModal from "../Settings/DeleteAccount";
import {
  User,
  Bell,
  Shield,
  Lock,
  CreditCard,
  HelpCircle,
  LogOut,
  Trash2,
  ChevronRight,
} from "lucide-react";

// Settings-specific sidebar items
const SETTINGS_NAV = [
  { icon: User, label: "Profile", path: "/dashboard/settings/profile" },
  { icon: Bell, label: "Notifications", path: "/dashboard/settings/notifications" },
  { icon: Shield, label: "Privacy", path: "/dashboard/settings/privacy" },
  { icon: Lock, label: "Security", path: "/dashboard/settings/security" },
  { icon: CreditCard, label: "Payments", path: "/dashboard/settings/payments" },
  { icon: HelpCircle, label: "Help & Support", path: "/dashboard/settings/help" },
];

export default function DashboardSettingLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = isLogoutModalOpen || isDeleteModalOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [isLogoutModalOpen, isDeleteModalOpen]);

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
  };

  const handleDeleteAccount = () => {
    setIsDeleteModalOpen(true);
  };

  const isActivePath = (path) => location.pathname === path;

  return (
    <div className="flex h-full gap-4">
      {/* Settings Sidebar */}
      <aside className="w-64 bg-white rounded-lg border border-gray-200 p-4 h-fit sticky top-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Settings</h2>
        <nav className="space-y-1">
          {SETTINGS_NAV.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                  active
                    ? "bg-green-600 text-white"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <ChevronRight size={16} className={active ? "opacity-100" : "opacity-0"} />
              </button>
            );
          })}
        </nav>

        {/* Danger Zone */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-red-600 mb-3">Danger Zone</h3>
          <div className="space-y-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              Log Out
            </button>
            <button
              onClick={handleDeleteAccount}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={18} />
              Delete Account
            </button>
          </div>
        </div>
      </aside>

      {/* Settings Content */}
      <main className="flex-1 bg-white rounded-lg overflow-hidden">
        <div className="h-full overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Modals */}
      <LogoutModal 
        open={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={confirmLogout}
      />
      <DeleteAccountModal 
        open={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={() => {
          // Add actual delete logic here
          setIsDeleteModalOpen(false);
        }} 
      />
    </div>
  );
}