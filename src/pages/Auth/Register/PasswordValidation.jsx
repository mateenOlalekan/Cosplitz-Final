// PasswordValidation.jsx
import { Check, X } from "lucide-react";
import { z } from "zod";

function PasswordValidation({ password = "" }) {
  // Individual Zod rules
  const rules = {
    length: z.string().min(8),
    uppercase: z.string().regex(/[A-Z]/),
    number: z.string().regex(/\d/),
  };

  // Helper to check rule validity safely
  const isValid = (schema) => schema.safeParse(password).success;

  const validations = [
    {
      label: "8+ characters",
      isValid: isValid(rules.length),
    },
    {
      label: "Uppercase letter",
      isValid: isValid(rules.uppercase),
    },
    {
      label: "Digit (0-9)",
      isValid: isValid(rules.number),
    },
  ];

  return (
    <div className="mt-2">
      <div className="flex flex-col gap-2">
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
    </div>
  );
}

export default PasswordValidation;
