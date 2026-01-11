import { Bell, Settings, MapPin, ChevronDown, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.svg";
import { useAuthStore } from "../../store/authStore";

function DashboardHeader({ setSidebarOpen, sidebarOpen, isMobile }) {
  const navigate = useNavigate();
  const { user } = useAuthStore(); // only read, no guards

  return (
    <div className="sticky top-0 bg-white border-b border-gray-200 z-30">
      {isMobile && (
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <img src={logo} alt="Logo" className="h-7 w-auto cursor-pointer" onClick={() => navigate("/dashboard")} />
            <button onClick={() => setSidebarOpen((s) => !s)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Toggle sidebar">
              <Menu size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="w-full flex items-center justify-between py-3 bg-white shadow-sm px-4">
        <div className="flex items-center gap-1 text-[#67707E]">
          <MapPin size={16} />
          <span className="text-sm font-medium">{user?.location || "Ikeja, Lagos, Nigeria"}</span>
          <ChevronDown size={16} />
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
            <span>Welcome,</span>
            <span className="font-medium">{user?.first_name || user?.name || user?.email?.split("@")[0] || "User"}</span>
          </div>

          <Link to="/dashboard/notifications" className="relative p-2 hover:bg-gray-100 rounded-lg transition" aria-label="Notifications">
            <Bell size={18} className="text-[#67707E]" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </Link>

          <Link to="/dashboard/settings" className="p-2 hover:bg-gray-100 rounded-lg transition" aria-label="Settings">
            <Settings size={18} className="text-[#67707E]" />
          </Link>

          <button
            onClick={() => useAuthStore.getState().logout()}
            className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardHeader;