// PasswordValidation.jsx - ENHANCED FOR ZOD
import { Check, X } from "lucide-react";
import { z } from "zod";

function PasswordValidation({ password }) {
  // Define password schema for validation rules
  const passwordSchema = z.object({
    length: z.string().min(8),
    uppercase: z.string().regex(/[A-Z]/),
    number: z.string().regex(/\d/),
  });

  // Check each validation rule
  const validations = [
    { 
      label: "8+ characters", 
      isValid: password.length >= 8,
      rule: "length"
    },
    { 
      label: "Uppercase letter", 
      isValid: /[A-Z]/.test(password),
      rule: "uppercase"
    },
    { 
      label: "Digit (0-9)", 
      isValid: /\d/.test(password),
      rule: "number"
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