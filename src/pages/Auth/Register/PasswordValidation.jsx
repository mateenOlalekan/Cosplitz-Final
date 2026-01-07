import { Check, X } from "lucide-react";

function PasswordValidation({ password }) {
  const validations = [
    { label: "8+ characters", isValid: password.length >= 8 },
    { label: "Uppercase letter", isValid: /[A-Z]/.test(password) },
    { label: "Digit", isValid: /\d/.test(password) },
  ];

  return (
    <div className="flex flex-col gap-2 mt-2">
      {validations.map((v, i) => (
        <div key={i} className="flex items-center gap-3">
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center ${
              v.isValid ? "bg-green-100" : "bg-gray-100"
            }`}
          >
            {v.isValid ? (
              <Check size={14} className="text-green-600" />
            ) : (
              <X size={14} className="text-gray-400" />
            )}
          </div>
          <span
            className={`text-xs ${
              v.isValid ? "text-green-600" : "text-gray-500"
            }`}
          >
            {v.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default PasswordValidation;
