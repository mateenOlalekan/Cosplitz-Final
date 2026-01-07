import { createPortal } from "react-dom";
import { X, AlertTriangle } from "lucide-react";

export default function DeleteAccountModal({ open, onClose, onConfirm }) {
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
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle size={18} />
            <h3 className="text-lg font-semibold">Delete Account</h3>
          </div>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          This action is permanent and cannot be undone.
        </p>

        <p className="text-sm text-red-600 mb-6">
          Are you sure you want to permanently delete your account?
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
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
