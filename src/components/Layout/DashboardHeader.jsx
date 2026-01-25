// src/components/Dashboard/DashboardHeader.jsx
import { Bell, Settings, MapPin, ChevronDown, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.svg";
import { useUser, useLogout } from "../../services/queries/auth";

export default function DashboardHeader({ onMenuClick }) {
  const { data: user } = useUser();
  const logout = useLogout();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Don't render if no user (AuthGuard should handle this, but safety check)
  if (!user) {
    return null;
  }

  return (
    <header className="bg-white border-b border-gray-200 z-30 px-4">
      {/* Mobile Header */}
      <div
        className="flex items-center justify-between block md:hidden"
        role="banner"
        aria-label="Application header"
      >
        <img
          src={logo}
          alt="Company Logo"
          className="w-20 h-20 object-contain select-none"
          draggable="false"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <nav aria-label="User menu">
          <Menu onClick={onMenuClick} />
        </nav>
      </div>

      {/* Desktop Header */}
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-1 text-gray-600">
          <MapPin size={16} />
          <span className="text-sm">
            {user?.location || "Ikeja, Lagos"}
          </span>
          <ChevronDown size={16} />
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block text-sm text-gray-600">
            Welcome,{" "}
            <span className="font-medium">
              {user?.first_name || user?.email}
            </span>
          </div>

          <Link
            to="/dashboard/notifications"
            className="relative p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Notifications"
          >
            <Bell size={18} className="text-gray-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </Link>

          <Link
            to="/dashboard/settings"
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Settings"
          >
            <Settings size={18} className="text-gray-600" />
          </Link>

          <button
            onClick={handleLogout}
            disabled={logout.isPending}
            className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            {logout.isPending ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </header>
  );
}