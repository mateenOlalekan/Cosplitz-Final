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

export default function DashboardHeader({ onMenuClick }) {
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
        <div className="flex items-center justify-between md:hidden">
          <img
            src={logo}
            alt="Company Logo"
            className="w-24 h-24 object-contain select-none"
            draggable="false"
          />
          <button onClick={onMenuClick} aria-label="Open menu">
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Search + Filter */}
        <div className="mt-1.5 md:mt-0 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search splits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                w-full
                pl-10 pr-4 py-2.5
                border border-gray-300 rounded-lg
                focus:ring-2 focus:ring-green-500
                focus:border-green-500
                outline-none
                text-sm
              "
            />
          </div>

          <button
            className="
              inline-flex items-center justify-center
              gap-2
              px-4 py-2.5
              border border-gray-300 rounded-lg
              hover:bg-gray-50
              text-sm
            "
          >
            <Filter size={18} />
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <MapPin size={16} />
            <span>{user?.location || "Ikeja, Lagos"}</span>
            <ChevronDown size={16} />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome,{" "}
              <span className="font-medium">
                {user?.first_name || user?.email || "User"}
              </span>
            </span>

            <Link
              to="/dashboard/notifications"
              className="relative p-2 rounded-lg hover:bg-gray-100 transition"
              aria-label="Notifications"
            >
              <Bell size={18} className="text-gray-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </Link>

            <Link
              to="/dashboard/settings"
              className="p-2 rounded-lg hover:bg-gray-100 transition"
              aria-label="Settings"
            >
              <Settings size={18} className="text-gray-600" />
            </Link>

            <button
              onClick={handleLogout}
              disabled={logout.isPending}
              className="
                px-3 py-1.5
                text-sm text-red-600
                hover:text-red-700 hover:bg-red-50
                rounded-lg
                transition
                disabled:opacity-50
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
