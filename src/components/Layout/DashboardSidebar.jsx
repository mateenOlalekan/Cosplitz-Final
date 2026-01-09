import { useState, useMemo, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { 
  Home, 
  Share2, 
  MessageSquare, 
  Wallet, 
  MapPin, 
  BarChart3,
  Users,
  Shield,
  FileCheck,
  LogOut,
  Settings
} from "lucide-react";
import logo from "../../assets/logo.svg";
import userImg from "../../assets/user.svg";
import { useAuthStore } from "../../store/authStore";

const DashboardSidebar = ({ sidebarOpen, isMobile, setSidebarOpen }) => {
  const { user, logout, isAuthenticated, initializeAuth, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications] = useState({
    splits: 3,
    messages: 8,
    wallet: 12,
  });

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated()) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const role = user?.role || user?.is_admin ? "admin" : "user";

  const navItems = useMemo(() => {
    const common = [
      { 
        icon: Home, 
        label: "Home", 
        path: "/dashboard", 
        exact: true,
        count: null 
      },
      {
        icon: Share2,
        label: "My Splits",
        path: "/dashboard/splits",
        count: notifications.splits,
      },
      {
        icon: MessageSquare,
        label: "Messages",
        path: "/dashboard/messages",
        count: notifications.messages,
      },
      {
        icon: Wallet,
        label: "Wallet",
        path: "/dashboard/wallet",
        count: notifications.wallet,
      },
      { 
        icon: MapPin, 
        label: "Nearby", 
        path: "/dashboard/nearby", 
        count: null 
      },
      {
        icon: BarChart3,
        label: "Analytics",
        path: "/dashboard/analytics",
        count: null,
      },
      {
        icon: Settings,
        label: "Settings",
        path: "/dashboard/settings",
        count: null,
      },
    ];

    const adminOnly = [
      {
        icon: Users,
        label: "Users",
        path: "/dashboard/admin/users",
        count: null,
      },
      {
        icon: Share2,
        label: "All Splits",
        path: "/dashboard/admin/splits",
        count: null,
      },
      {
        icon: BarChart3,
        label: "Split Analytics",
        path: "/dashboard/admin/analytics",
        count: null,
      },
      {
        icon: Shield,
        label: "Admin Panel",
        path: "/dashboard/admin",
        count: null,
      },
      {
        icon: FileCheck,
        label: "KYC Verification",
        path: "/dashboard/admin/kyc",
        count: null,
      },
    ];

    return role === "admin" ? [...common, ...adminOnly] : common;
  }, [role, notifications]);

  const isRouteActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const userStats = useMemo(() => ({
    level: user?.level || 1,
    name: user?.first_name || user?.name || user?.email?.split('@')[0] || "User",
    email: user?.email || "",
    avatar: user?.avatar || userImg,
    completedSplits: user?.completed_splits || 23,
    reliabilityScore: user?.reliability_score || 87,
  }), [user]);

  const handleLogout = () => {
    logout(); // This already handles redirect in authStore
  };

  const handleProfileClick = () => {
    navigate("/dashboard/profile");
    if (isMobile) setSidebarOpen(false);
  };

  // Show loading while checking auth
  if (isLoading) {
    return (
      <aside className="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </aside>
    );
  }

  // Don't render sidebar if not authenticated
  if (!isAuthenticated()) {
    return null;
  }

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
          fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50
          flex flex-col
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static
          transition-transform duration-300 ease-in-out
          shadow-lg lg:shadow-none
        `}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100">
          <img 
            src={logo} 
            alt="Cosplitz Logo" 
            className="h-8 cursor-pointer"
            onClick={() => navigate("/dashboard")}
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = isRouteActive(item.path, item.exact);
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  onClick={() => isMobile && setSidebarOpen(false)}
                  className={`
                    flex items-center justify-between
                    px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${isActive
                      ? "bg-green-50 text-green-700 border-l-4 border-green-600"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <item.icon 
                      size={20} 
                      className={isActive ? "text-green-600" : "text-gray-500"} 
                    />
                    <span className="text-sm font-medium">
                      {item.label}
                    </span>
                  </div>

                  {item.count !== null && (
                    <span className={`
                      text-xs font-semibold px-2 py-1 rounded-full
                      ${isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-700"
                      }
                    `}>
                      {item.count}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Community Standing */}
          <div className="mt-6 p-4 bg-gradient-to-br from-green-600 to-green-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white leading-tight">
                Community Standing
              </h3>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <span
                    key={level}
                    className={`w-2.5 h-2.5 rounded-full ${level <= userStats.level ? "bg-white" : "bg-white/30"}`}
                  />
                ))}
              </div>
            </div>

            <p className="text-lg font-bold text-white">
              Level {userStats.level}
            </p>

            <div className="text-sm text-white/90 space-y-1">
              <p>{userStats.completedSplits} Completed Splits</p>
              <p>Reliability Score: {userStats.reliabilityScore}%</p>
            </div>

            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${userStats.reliabilityScore}%` }}
              />
            </div>
          </div>
        </nav>

        {/* User Profile */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div 
            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
            onClick={handleProfileClick}
          >
            <img
              src={userStats.avatar}
              alt="User avatar"
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
            />

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 truncate">
                {userStats.name}
              </h4>
              <p className="text-xs text-gray-500 truncate">
                {userStats.email}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button 
            onClick={handleLogout} 
            className="w-full mt-3 flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;