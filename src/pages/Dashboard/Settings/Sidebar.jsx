import { NavLink } from "react-router-dom";
import {
  Bell,
  Shield,
  CircleUserRound,
  Headphones,
  Lock,
  ChevronLeft,
  Trash2,
} from "lucide-react";
import { IoLogOutOutline } from "react-icons/io5";

const settingsLinks = [
  { icon: CircleUserRound, label: "My Profile", path: "/dashboard/settings/profile" },
  { icon: Bell, label: "Notifications", path: "/dashboard/settings/notifications" },
  { icon: Shield, label: "Verification Status", path: "/dashboard/settings/verification" },
  { icon: Lock, label: "Reset Password", path: "/dashboard/settings/reset-password" },
  { icon: Headphones, label: "Support", path: "/dashboard/settings/support" },
];

export default function SettingsSidebar({ onLogout, onDelete }) {
  return (
    <aside className="rounded-xl bg-white p-4">
      <div className="flex h-full flex-col rounded-xl bg-[#F7F5F9] p-4">
        
        {/* ===== HEADER ===== */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <ChevronLeft
              size={18}
              className="cursor-pointer text-gray-600 hover:text-gray-900"
            />
            <h2 className="text-lg font-semibold text-gray-900">
              Settings
            </h2>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            You can find all settings here
          </p>
        </div>

        {/* ===== NAVIGATION ===== */}
        <nav className="space-y-1">
          {settingsLinks.map(({ icon: Icon, label, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-4 rounded-lg px-3 py-1 transition
                ${
                  isActive
                    ? "bg-green-200 text-green-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Icon Container */}
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full
                    ${
                      isActive ? "bg-white" : "bg-green-100"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={isActive ? "text-[#009951]" : "text-[#67707E]"}
                    />
                  </div>

                  <span className="text-sm font-medium">
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ===== FOOTER ACTIONS ===== */}
        <div className="mt-auto space-y-1 pt-6">
          
          {/* Logout */}
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-4 rounded-lg px-3 py-2.5 transition hover:bg-gray-50"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#65CADF80]">
              <IoLogOutOutline size={16} className="text-[#67707E]" />
            </div>
            <span className="text-sm font-medium text-[#67707E]">
              Logout
            </span>
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={onDelete}
            className="flex w-full items-center gap-4 rounded-lg px-3 py-2.5 transition hover:bg-red-50"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FDD3D0]">
              <Trash2 size={16} className="text-[#E60000]" />
            </div>
            <span className="text-sm font-medium text-[#E60000]">
              Delete Account
            </span>
          </button>

        </div>
      </div>
    </aside>
  );
}
