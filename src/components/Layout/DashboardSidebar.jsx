import { useState, useMemo, useEffect, useCallback } from "react";
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
  FileCheck,
} from "lucide-react";
import logo from "../../assets/logo.svg";
import userImg from "../../assets/user.svg";
import useAuthStore from "../../store/authStore";

// Admin icons configuration
const ADMIN_ICONS = {
  Overview: BarChart3,
  AllSplitz: PieChart,
  SplitzAnalytics: BarChart3,
  Message: Mail,
  "KYC Verification": ShieldCheck,
};

const Sidebar = ({ sidebarOpen, isMobile, setSidebarOpen }) => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const fetchUserInfo = useAuthStore((state) => state.fetchUserInfo);
  const [loading, setLoading] = useState(false);

  const [notifications] = useState({
    splits: 3,
    messages: 8,
    wallet: 12,
  });

  const role = user?.role || "user";

  // Fetch user info only when needed
  useEffect(() => {
    if (!user && !loading) {
      setLoading(true);
      const fetchUser = async () => {
        try {
          await fetchUserInfo();
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [user, fetchUserInfo, loading]);

  const navItems = useMemo(() => {
    const common = [
      { 
        icon: Home, 
        label: "Home", 
        url: "/dashboard", 
        count: null 
      },
      {
        icon: Share2,
        label: "My Splits",
        url: "/dashboard/mysplitz",
        count: notifications.splits,
      },
      {
        icon: MessageSquare,
        label: "Messages",
        url: "/dashboard/messages",
        count: notifications.messages,
      },
      {
        icon: Wallet,
        label: "Wallet",
        url: "/dashboard/wallet",
        count: notifications.wallet,
      },
      { 
        icon: MapPin, 
        label: "Nearby", 
        url: "/dashboard/filter", 
        count: null 
      },
      {
        icon: BarChart3,
        label: "Analytics",
        url: "/dashboard/analytics",
        count: null,
      },
    ];

    const adminOnly = [
      {
        icon: ADMIN_ICONS.Overview,
        label: "Overview",
        url: "/dashboard/overview",
        count: null,
      },
      {
        icon: ADMIN_ICONS.AllSplitz,
        label: "AllSplitz",
        url: "/dashboard/allsplitz",
        count: null,
      },
      {
        icon: ADMIN_ICONS.SplitzAnalytics,
        label: "SplitzAnalytics",
        url: "/dashboard/splitanalytics",
        count: null,
      },
      {
        icon: ADMIN_ICONS.Message,
        label: "Message",
        url: "/dashboard/splitzmessage",
        count: null,
      },
      {
        icon: ADMIN_ICONS["KYC Verification"],
        label: "KYC Verification",
        url: "/dashboard/kyc-verification",
        count: null,
      },
    ];

    return role === "admin" ? [...common, ...adminOnly] : common;
  }, [role, notifications.splits, notifications.messages, notifications.wallet]);

  const userStats = useMemo(() => ({
    level: user?.level || 1,
    name: user?.full_name || 
          `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || 
          "User",
    email: user?.email || "",
    avatar: user?.avatar || null,
  }), [user]);

  const handleNavClick = useCallback(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile, setSidebarOpen]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && sidebarOpen) {
        const sidebar = document.querySelector('aside');
        if (sidebar && !sidebar.contains(event.target)) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobile, sidebarOpen, setSidebarOpen]);

  return (
    <>
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-68 bg-white border-r border-gray-200 z-50
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:w-68
        `}
      >
        <div className="px-6 py-5">
          <img src={logo} alt="App logo" className="h-8" />
        </div>

        <nav className="flex-1 px-4 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.url}
                to={item.url}
                end={item.url === "/dashboard"}
                onClick={handleNavClick}
                className={({ isActive }) => `
                  flex items-center justify-between
                  px-4 py-2.5 rounded-xl
                  transition-all duration-200
                  ${isActive
                    ? "bg-[#1F8225] text-white"
                    : "text-gray-700 hover:bg-gray-50"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} />
                  <span className="text-sm font-medium">
                    {item.label}
                  </span>
                </div>

                {item.count !== null && item.count > 0 && (
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700 min-w-[24px] text-center">
                    {item.count}
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          <div className="mt-6 p-4 bg-[#1F8225] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white leading-tight">
                Community <br /> Standing
              </h3>

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

            <p className="text-sm font-bold text-white">
              Level {userStats.level}
            </p>

            <div className="text-sm text-white space-y-1">
              <p>23 Completed Splits</p>
              <p>Reliability Score: 87%</p>
            </div>

            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white w-3/4 rounded-full" />
            </div>
          </div>
        </nav>

        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
            <img
              src={userStats.avatar || userImg}
              alt="User avatar"
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = userImg;
              }}
            />

            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-gray-900 truncate">
                {userStats.name}
              </h4>
              <p className="text-xs text-gray-500 truncate">
                {userStats.email}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;