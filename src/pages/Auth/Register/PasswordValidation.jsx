// PasswordValidation.jsx - ENHANCED FOR ZOD
import { Check, X } from "lucide-react";
import { z } from "zod";

function PasswordValidation({ password }) {
  // Define password schema for validation rules
  const passwordSchema = z.object({
    length: z.string().min(8),
    uppercase: z.string().regex(/[A-Z]/),
    number: z.string().regex(/\d/),
    special: z.string().regex(/[!@#$%^&*(),.?":{}|<>]/),
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
    { 
      label: "Special character", 
      isValid: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      rule: "special"
    },
  ];

  // Check if all validations pass
  const isPasswordValid = validations.every(v => v.isValid);

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
      
      {/* Password strength indicator */}
      {password.length > 0 && (
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-600">Password strength:</span>
            <span className={`text-xs font-medium ${
              isPasswordValid ? 'text-green-600' : 
              password.length >= 6 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {isPasswordValid ? 'Strong' : 
               password.length >= 6 ? 'Medium' : 'Weak'}
            </span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                isPasswordValid ? 'bg-green-500 w-full' : 
                password.length >= 6 ? 'bg-yellow-500 w-2/3' : 'bg-red-500 w-1/3'
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default PasswordValidation;