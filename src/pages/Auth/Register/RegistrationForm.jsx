// RegistrationForm.jsx - FULLY INTEGRATED
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { PiAppleLogoBold } from "react-icons/pi";
import { Eye, EyeOff } from "lucide-react";
import PasswordValidation from "./PasswordValidation";

function RegistrationForm({
  formData,
  handleInputChange,
  handleFormSubmit,
  handleSocialRegister,
  loading,
  error,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});

  const handleBlur = (field) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  // Field validation functions
  const validateField = (field, value) => {
    if (!touchedFields[field]) return true; // Only validate after touch
    
    switch (field) {
      case "firstName":
      case "lastName":
        return value.trim().length >= 2;
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value.trim());
      case "password":
        return value.length >= 8 && /[A-Z]/.test(value) && /\d/.test(value);
      default:
        return true;
    }
  };

  const getFieldError = (field, value) => {
    if (!touchedFields[field] || !value) return null;
    
    switch (field) {
      case "firstName":
      case "lastName":
        return value.trim().length < 2 ? "Must be at least 2 characters" : null;
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value.trim()) ? "Please enter a valid email" : null;
      case "password":
        if (value.length < 8) return "Must be at least 8 characters";
        if (!/[A-Z]/.test(value)) return "Must contain an uppercase letter";
        if (!/\d/.test(value)) return "Must contain a number";
        return null;
      default:
        return null;
    }
  };

  const isFormValid = () => {
    const { firstName, lastName, email, password, agreeToTerms } = formData;
    
    return (
      firstName.trim().length >= 2 &&
      lastName.trim().length >= 2 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      agreeToTerms
    );
  };

  const formFields = [
    { key: "firstName", label: "First Name", type: "text", placeholder: "Enter your first name" },
    { key: "lastName", label: "Last Name", type: "text", placeholder: "Enter your last name" },
    { key: "email", label: "Email Address", type: "email", placeholder: "you@example.com" },
    { key: "nationality", label: "Nationality (Optional)", type: "text", placeholder: "e.g., Indian, American" },
  ];

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Create Your Account
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Let's get started with real-time cost sharing.
        </p>
      </div>

      {/* Social Login Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => handleSocialRegister("google")}
          disabled={loading}
          className="flex items-center justify-center gap-3 px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FcGoogle size={20} />
          <span className="text-gray-700 text-sm">Sign Up with Google</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => handleSocialRegister("apple")}
          disabled={loading}
          className="flex items-center justify-center gap-3 px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PiAppleLogoBold size={20} />
          <span className="text-gray-700 text-sm">Sign Up with Apple</span>
        </motion.button>
      </div>

      {/* Divider */}
      <div className="flex items-center my-6">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-4 text-gray-500 text-sm">Or sign up with email</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">
          {error}
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* Form Fields */}
        {formFields.map((field) => {
          const fieldError = getFieldError(field.key, formData[field.key]);
          const isValid = validateField(field.key, formData[field.key]);
          
          return (
            <div key={field.key} className="space-y-1">
              <label className="text-sm font-medium text-gray-700 block">
                {field.label} {field.key !== "nationality" && "*"}
              </label>
              <div className="relative">
                <input
                  type={field.type}
                  value={formData[field.key]}
                  placeholder={field.placeholder}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  onBlur={() => handleBlur(field.key)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && field.key === 'nationality' && isFormValid()) {
                      handleFormSubmit(e);
                    }
                  }}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-colors ${
                    fieldError 
                      ? "border-red-400 focus:border-red-400" 
                      : isValid && touchedFields[field.key]
                      ? "border-green-400 focus:border-green-600"
                      : "border-gray-300 focus:border-green-600"
                  } disabled:opacity-50`}
                  required={field.key !== "nationality"}
                  disabled={loading}
                  aria-invalid={!!fieldError}
                  aria-describedby={fieldError ? `${field.key}-error` : undefined}
                />
              </div>
              {fieldError && (
                <p id={`${field.key}-error`} className="text-red-500 text-xs mt-1">
                  {fieldError}
                </p>
              )}
            </div>
          );
        })}

        {/* Password Field */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 block">
            Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              placeholder="Create a strong password"
              onChange={(e) => handleInputChange("password", e.target.value)}
              onBlur={() => handleBlur("password")}
              className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-colors pr-10 ${
                getFieldError("password", formData.password) 
                  ? "border-red-400 focus:border-red-400" 
                  : validateField("password", formData.password) && touchedFields.password
                  ? "border-green-400 focus:border-green-600"
                  : "border-gray-300 focus:border-green-600"
              } disabled:opacity-50`}
              required
              disabled={loading}
              aria-invalid={!!getFieldError("password", formData.password)}
              aria-describedby={getFieldError("password", formData.password) ? "password-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {getFieldError("password", formData.password) && (
            <p id="password-error" className="text-red-500 text-xs mt-1">
              {getFieldError("password", formData.password)}
            </p>
          )}
          <PasswordValidation password={formData.password} />
        </div>

        {/* Terms & Conditions */}
        <div className="mt-4">
          <label className="flex items-start gap-3 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={(e) => handleInputChange("agreeToTerms", e.target.checked)}
              className="mt-0.5 rounded focus:ring-green-500 text-green-600 disabled:opacity-50"
              disabled={loading}
            />
            <span className="text-left">
              I agree to the{" "}
              <a 
                href="/terms" 
                className="text-green-600 hover:underline font-medium hover:text-green-700 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms
              </a>
              ,{" "}
              <a 
                href="/privacy" 
                className="text-green-600 hover:underline font-medium hover:text-green-700 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy
              </a>{" "}
              &{" "}
              <a 
                href="/fees" 
                className="text-green-600 hover:underline font-medium hover:text-green-700 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Fees
              </a>
              . I understand that I must be at least 18 years old to use this service.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: isFormValid() && !loading ? 1.02 : 1 }}
          whileTap={{ scale: isFormValid() && !loading ? 0.98 : 1 }}
          type="submit"
          disabled={!isFormValid() || loading}
          className={`w-full py-3 rounded-lg font-semibold mt-6 transition-all duration-200 ${
            !isFormValid() || loading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Creating Account...
            </span>
          ) : (
            "Create Account"
          )}
        </motion.button>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-600 mt-6 pt-4 border-t border-gray-100">
          Already have an account?{" "}
          <Link 
            to="/login" 
            className="text-green-600 hover:underline font-medium hover:text-green-700 transition-colors"
          >
            Log In
          </Link>
        </p>
      </form>

      {/* Demo Account Info (Optional) */}

    </div>
  );
}

export default RegistrationForm;