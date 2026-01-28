import { useState } from "react";
import { Bell, Settings, MapPin, ChevronDown, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.svg";
import { useUser, useLogout } from "../../services/queries/auth";
import { Filter, Search } from "lucide-react";


export default function DashboardHeader({ onMenuClick }) {
  const { data: user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
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
    <header className="bg-white border-b border-gray-200 z-30 px-4">
      <div className="flex items-center justify-between md:hidden" role="banner">
        <img
          src={logo}
          alt="Company Logo"
          className="w-24 h-24 object-contain select-none"
          draggable="false"
        />
        <nav aria-label="User menu">
          <Menu onClick={onMenuClick} className="cursor-pointer" />
        </nav>
      </div>

      <div className="flex gap-0.5 pt-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search splits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          />
        </div>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
          <Filter size={20} />
        </button>       
      </div>

      <div className="hidden md:flex items-center justify-between py-2">
        <div className="flex items-center gap-1 text-gray-600">
          <MapPin size={16} />
          <span className="text-sm">{user?.location || "Ikeja, Lagos"}</span>
          <ChevronDown size={16} />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Welcome,{" "}
            <span className="font-medium">{user?.first_name || user?.email || "User"}</span>
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