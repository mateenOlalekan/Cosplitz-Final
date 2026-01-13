// src/layout/DashboardHeader.jsx
import { Bell, Settings, MapPin, ChevronDown, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.svg";
import { useAuthStore } from "../../store/authStore";
import { useState } from "react";

export default function DashboardHeader({ sidebarOpen, setSidebarOpen, isMobile, onSidebarToggle }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogoutClick = () => {
    // Navigate to settings logout which has modal
    navigate('/dashboard/settings', { state: { showLogoutModal: true } });
  };

  return (
    <div className="sticky top-0 bg-white border-b border-gray-200 z-40">
      {/* Mobile Header */}
      {isMobile && (
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <img 
              src={logo} 
              alt="Logo" 
              className="h-7 w-auto cursor-pointer" 
              onClick={() => navigate("/dashboard")} 
            />
            <button 
              onClick={onSidebarToggle}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" 
              aria-label="Toggle sidebar"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Main Header Content */}
      <div className="w-full flex items-center justify-between py-3 px-4">
        {/* Location */}
        <div className="flex items-center gap-1 text-[#67707E]">
          <MapPin size={16} />
          <span className="text-sm font-medium">
            {user?.location || "Ikeja, Lagos, Nigeria"}
          </span>
          <ChevronDown size={16} className="cursor-pointer hover:text-gray-600" />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Welcome Message (Desktop) */}
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
            <span>Welcome,</span>
            <span className="font-medium">
              {user?.first_name || user?.name || user?.email?.split("@")[0] || "User"}
            </span>
          </div>

          {/* Notifications */}
          <Link 
            to="/dashboard/notifications" 
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors" 
            aria-label="Notifications"
          >
            <Bell size={18} className="text-[#67707E]" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </Link>

          {/* Settings */}
          <Link 
            to="/dashboard/settings" 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors" 
            aria-label="Settings"
          >
            <Settings size={18} className="text-[#67707E]" />
          </Link>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <img
                src={user?.avatar || "../../assets/user.svg"}
                alt="User"
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "../../assets/user.svg";
                }}
              />
              <ChevronDown size={16} className={`transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                <Link
                  to="/dashboard/settings/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowUserMenu(false)}
                >
                  Profile Settings
                </Link>
                <button
                  onClick={handleLogoutClick}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}