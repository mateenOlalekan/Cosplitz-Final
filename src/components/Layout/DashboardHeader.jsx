// src/components/Layout/DashboardHeader.jsx
import { Bell, Settings, MapPin, ChevronDown, Menu, Filter, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.svg";
import { useUser, useLogout } from "../../services/queries/auth";
import { useState } from "react";

export default function DashboardHeader({ onMenuClick, hidden, setHidden }) {
  const { data: user } = useUser();
  const logout = useLogout();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

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
    <header className="bg-white border-b border-gray-200 z-30 px-4 sm:px-6 lg:px-8">
      {/* Mobile Header */}
      <div className="flex items-center justify-between md:hidden h-14" role="banner">
        <img 
          src={logo} 
          alt="Company Logo"  
          className="h-7 w-auto object-contain select-none" 
          draggable="false"
        />
        <nav aria-label="User menu">
          <button 
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu size={24} className="text-gray-700" />
          </button>
        </nav>
      </div>

      {/* Search Bar - Mobile & Tablet */}
      <div className="flex gap-3 py-3 md:py-4">
        <div className="flex-1 relative">
          <Search 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
            size={18} 
          />
          <input
            type="text"
            placeholder="Search splits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setHidden(true)}
            onBlur={() => setHidden(false)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
          />
        </div>
        <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors">
          <Filter size={18} className="text-gray-600" />
          <span className="hidden sm:inline text-sm font-medium text-gray-700">Filter</span>
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between py-3">
        <div className="flex items-center gap-1.5 text-gray-600">
          <MapPin size={16} className="text-gray-500" />
          <span className="text-sm font-medium">{user?.location || "Ikeja, Lagos"}</span>
          <ChevronDown size={14} className="text-gray-400" />
        </div>

        <div className="flex items-center gap-5">
          <div className="text-sm text-gray-600">
            Welcome,{" "}
            <span className="font-semibold text-gray-900">{user?.first_name || user?.email || "User"}</span>
          </div>

          <div className="flex items-center gap-1">
            <Link
              to="/dashboard/notifications"
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <Bell size={18} className="text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </Link>

            <Link
              to="/dashboard/settings"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Settings"
            >
              <Settings size={18} className="text-gray-600" />
            </Link>

            <button
              onClick={handleLogout}
              disabled={logout.isPending}
              className="ml-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {logout.isPending ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}