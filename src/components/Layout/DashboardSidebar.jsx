// src/components/Dashboard/DashboardSidebar.jsx
import { NavLink, useLocation, Link } from "react-router-dom";
import { Home, Share2, MessageSquare, Wallet, MapPin, BarChart3,Menu } from "lucide-react";
import logo from "../../assets/logo.svg";
import { useAuthStore } from "../../store/authStore";


export default function DashboardSidebar({ isOpen, onClose }) {
  const { user } = useAuthStore();

  // Navigation items for regular users
  const navItems = [
    { icon: Home, label: "Home", to: "/dashboard" },
    { icon: Share2, label: "My Splits", to: "/dashboard/mysplitz", count: 3 },
    { icon: MessageSquare, label: "Messages", to: "/dashboard/messages", count: 8 },
    { icon: Wallet, label: "Wallet", to: "/dashboard/wallet", count: 12 },
    { icon: MapPin, label: "Nearby", to: "/dashboard/filter" },
    { icon: BarChart3, label: "Analytics", to: "/dashboard/analytics" },
  ];

  return (
    <aside 
      className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 transition-transform duration-300
        flex flex-col h-full
      `}
    >
      {/* Close button (mobile only) */}


        <div className="flex items-center  pl-7 py-4 gap-3">
          <img 
            src={logo} 
            alt="Logo" 
            className="h-10 cursor-pointer" 
            onClick={() => navigate("/dashboard")} 
          />
        </div>
      {/* Navigation menu */}
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
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {item.count && (
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                  {item.count}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* Community standing card */}
        <div className="mt-6 p-4 bg-green-600 rounded-xl text-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold">Community Standing</h3>
            <div className="flex gap-1">
              {[1,2,3,4].map(i => (
                <span key={i} className={`w-2 h-2 rounded-full ${i <= 3 ? "bg-white" : "bg-white/40"}`} />
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

      {/* User profile footer */}
      <div className="p-4 border-t border-gray-100">
        <Link to="/dashboard/settings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
          <img
            src={user?.avatar || "/default-avatar.png"}
            alt="User"
            className="w-10 h-10 rounded-full object-cover bg-gray-200"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}