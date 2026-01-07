import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function LogoutModal({ open, onClose, onConfirm }) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-[#1A051D]/80"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white rounded-xl p-6 shadow-lg z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Logout</h3>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to logout from your account?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
