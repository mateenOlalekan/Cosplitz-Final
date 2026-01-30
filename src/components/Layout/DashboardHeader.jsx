// src/components/Layout/DashboardHeader.jsx
import {
  Bell,
  Settings,
  MapPin,
  ChevronDown,
  Menu,
  Search,
  Filter,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.svg";
import { useUser, useLogout } from "../../services/queries/auth";
import { useState } from "react";

export default function DashboardHeader({ onMenuClick, onSearchFocus, onSearchBlur }) {
  const [searchQuery, setSearchQuery] = useState("");
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

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8 py-2">
        {/* Mobile Header */}
        <div className="flex items-center justify-between md:hidden mb-2">
          <img
            src={logo}
            alt="Company Logo"
            className="w-32 h-32 object-contain select-none"
            draggable="false"
          />
          <button 
            onClick={onMenuClick} 
            aria-label="Open menu"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Search and Filter Row */}
        <div className="flex gap-3 mb-2 md:mb-0">
          <div className="relative flex-1">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search splits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={onSearchFocus}  // ✅ Trigger hide
              onBlur={onSearchBlur}    // ✅ Trigger show
              className="
                w-full
                pl-11 pr-4 py-3
                border border-gray-300 rounded-lg
                focus:ring-2 focus:ring-green-500
                focus:border-green-500
                outline-none
                text-sm
                hover:border-gray-400
                transition-colors
              "
            />
          </div>

          <button
            className="
              inline-flex items-center justify-center
              gap-2
              px-4 py-3
              border border-gray-300 rounded-lg
              hover:bg-gray-50 hover:border-gray-400
              text-sm
              transition-colors
              whitespace-nowrap
              min-w-[56px]
            "
            aria-label="Filter"
          >
            <Filter size={18} />
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between mt-5">
          <div className="flex items-center gap-3 text-gray-600 text-sm">
            <MapPin size={16} className="text-gray-500" />
            <span>{user?.location || "Ikeja, Lagos"}</span>
            <ChevronDown size={16} className="text-gray-500" />
          </div>

          <div className="flex items-center gap-5">
            <span className="text-sm text-gray-600">
              Welcome,{" "}
              <span className="font-medium text-gray-900">
                {user?.first_name || user?.email || "User"}
              </span>
            </span>

            <div className="flex items-center gap-2">
              <Link
                to="/dashboard/notifications"
                className="relative p-2.5 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Notifications"
              >
                <Bell size={18} className="text-gray-600" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
              </Link>

              <Link
                to="/dashboard/settings"
                className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Settings"
              >
                <Settings size={18} className="text-gray-600" />
              </Link>
            </div>

            <button
              onClick={handleLogout}
              disabled={logout.isPending}
              className="
                px-4 py-2
                text-sm text-red-600
                hover:text-red-700 hover:bg-red-50
                rounded-lg
                transition-colors
                disabled:opacity-50
                whitespace-nowrap
                border border-transparent hover:border-red-100
              "
            >
              {logout.isPending ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}