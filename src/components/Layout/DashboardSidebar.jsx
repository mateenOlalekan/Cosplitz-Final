// src/components/Layout/DashboardSidebar.jsx
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  Home,
  Share2,
  MessageSquare,
  Wallet,
  MapPin,
  BarChart3,
  LogOut,
  PlusCircle,
  List,
} from "lucide-react";
import logo from "../../assets/logo.svg";
import { useUser, useLogout } from "../../services/queries/auth";

export default function DashboardSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { data: user } = useUser();
  const logout = useLogout();

  const navItems = [
    { icon: Home, label: "Home", to: "/dashboard" },
    { icon: List, label: "All Splits", to: "/dashboard/allsplits" },
    { icon: Share2, label: "My Splits", to: "/dashboard/mysplitz" },
    { icon: PlusCircle, label: "Create Split", to: "/dashboard/create-splitz" },
    { icon: MessageSquare, label: "Messages", to: "/dashboard/messages" },
    { icon: Wallet, label: "Wallet", to: "/dashboard/wallet" },
    { icon: MapPin, label: "Nearby", to: "/dashboard/filter" },
    { icon: BarChart3, label: "Analytics", to: "/dashboard/analytics" },
  ];

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64
        bg-white border-r border-gray-200
        transform ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 transition-transform duration-300
        flex flex-col h-full
      `}
    >
      {/* Logo */}
      <div className="flex items-center pl-7 py-4 gap-3">
        <img
          src={logo}
          alt="Logo"
          className="h-10 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center justify-between px-4 py-3 rounded-lg transition-colors
                ${isActive
                  ? "bg-[#1F8225] text-white"
                  : "text-gray-700 hover:bg-gray-50"
                }
              `}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} />
                <span className="text-sm font-semibold">{item.label}</span>
              </div>
            </NavLink>
          ))}
        </div>

        {/* Community Standing Card */}
        <div className="mt-6 p-4 bg-[#1F8225] rounded-xl text-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold">Community Standing</h3>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map(i => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full ${i <= 3 ? "bg-white" : "bg-white/70"}`}
                />
              ))}
            </div>
          </div>

          <p className="text-sm font-bold">Level {user?.level || 1}</p>

          <div className="text-sm space-y-1 mt-2">
            <p>23 Completed Splits</p>
            <p>Reliability Score: 87%</p>
          </div>

          <div className="h-2 bg-white/20 rounded-full mt-3">
            <div className="h-full bg-white w-3/4 rounded-full" />
          </div>
        </div>
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-100">
        <Link
          to="/dashboard/settings"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
        >
          <img
            src={user?.image || user?.avatar || "/default-avatar.png"}
            alt="User"
            className="w-10 h-10 rounded-full object-cover bg-gray-200"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.email || user?.first_name || "User"}
            </p>
            <p className="text-xs text-gray-500 truncate">View profile & settings</p>
          </div>
        </Link>

        <button
          onClick={handleLogout}
          disabled={logout.isPending}
          className="mt-3 w-full flex md:hidden items-center gap-3 p-3 rounded-lg text-red-600 hover:bg-red-50 transition disabled:opacity-50"
        >
          <LogOut size={18} />
          <span className="text-sm font-semibold">
            {logout.isPending ? "Logging out..." : "Logout"}
          </span>
        </button>
      </div>
    </aside>
  );
}