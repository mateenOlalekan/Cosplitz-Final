/*  src/components/Layout/Sidebar.jsx  */
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Share2,
  MessageSquare,
  Wallet,
  MapPin,
  BarChart3,
  PieChart,
  Users,
  ShieldCheck,
  Mail,
} from "lucide-react";
import logo from "../../assets/logo.svg";
import userImg from "../../assets/user.svg";
import { useAuthStore } from "../../store/authStore";

const ADMIN_ICONS = {
  Overview: BarChart3,
  AllSplitz: PieChart,
  SplitzAnalytics: BarChart3,
  Message: Mail,
  "KYC Verification": ShieldCheck,
};

export default function Sidebar({ sidebarOpen, isMobile, setSidebarOpen }) {
  const location = useLocation();
  const { user } = useAuthStore();

  const isAdmin = user?.role === "admin";

  /* -------------------------------------------------
   * COMMON LINKS – mapped to the new App.jsx table
   * ------------------------------------------------- */
  const common = [
    { icon: Home,      label: "Home",         url: "/dashboard",           count: null },
    { icon: Share2,    label: "My Splits",    url: "/dashboard/mysplitz",  count: 3  },
    { icon: MessageSquare, label: "Messages", url: "/dashboard/messages",  count: 8  },
    { icon: Wallet,    label: "Wallet",       url: "/dashboard/wallet",    count: 12 },
    { icon: MapPin,    label: "Nearby",       url: "/dashboard/filter",    count: null },
    { icon: BarChart3, label: "Analytics",    url: "/dashboard/analytics", count: null },
  ];

  /* -------------------------------------------------
   * ADMIN LINKS – match App.jsx /admin/…  routes
   * ------------------------------------------------- */
  const adminOnly = [
    { icon: ADMIN_ICONS.Overview,        label: "Overview",         url: "/admin",                    count: null },
    { icon: ADMIN_ICONS.AllSplitz,       label: "AllSplitz",        url: "/admin/allsplitz",          count: null },
    { icon: ADMIN_ICONS.SplitzAnalytics, label: "SplitzAnalytics",  url: "/admin/splitanalytics",     count: null },
    { icon: ADMIN_ICONS.Message,         label: "Message",          url: "/admin/splitzmessage",      count: null },
    { icon: ADMIN_ICONS["KYC Verification"], label: "KYC Verification", url: "/admin/kyc-verification", count: null },
  ];

  const navItems = isAdmin ? [...common, ...adminOnly] : common;

  /* -------------------------------------------------
   * USER STATS (unchanged)
   * ------------------------------------------------- */
  const stats = {
    level: user?.level || 1,
    name: user?.full_name || `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "User",
    email: user?.email || "",
    avatar: user?.avatar || null,
  };

  const closeIfMobile = () => isMobile && setSidebarOpen(false);

  /* -------------------------------------------------
   * RENDER (identical to your original)
   * ------------------------------------------------- */
  return (
    <aside
      className={`w-68 bg-white border-r border-gray-200 flex flex-col ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 transition-transform duration-300`}
    >
      {/* ---- LOGO ---- */}
      <div className="px-6 py-5">
        <img src={logo} alt="App logo" className="h-8" />
      </div>

      {/* ---- NAV ---- */}
      <nav className="flex-1 px-4 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              end={item.url === "/dashboard"}
              onClick={closeIfMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-[#1F8225] text-white"
                    : "text-gray-700 hover:bg-gray-50"
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {item.count && (
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700 min-w-[24px] text-center">
                  {item.count}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* ---- Community Standing card (unchanged) ---- */}
        <div className="mt-6 p-4 bg-[#1F8225] rounded-xl space-y-3 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold leading-tight">Community Standing</h3>
            <div className="flex gap-1">
              {[...Array(4)].map((_, i) => (
                <span
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full ${
                    i < 3 ? "bg-white" : "bg-white/30"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-sm font-bold">Level {stats.level}</p>
          <div className="text-sm space-y-1">
            <p>23 Completed Splits</p>
            <p>Reliability Score: 87%</p>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white w-3/4 rounded-full" />
          </div>
        </div>
      </nav>

      {/* ---- USER FOOTER (unchanged) ---- */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
          <img
            src={stats.avatar || userImg}
            alt="User avatar"
            className="w-10 h-10 rounded-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = userImg;
            }}
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-gray-900 truncate">{stats.name}</h4>
            <p className="text-xs text-gray-500 truncate">{stats.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}