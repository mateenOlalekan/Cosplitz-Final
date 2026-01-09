import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { PiAppleLogoBold } from "react-icons/pi";
import { Eye, EyeOff } from "lucide-react";
import PasswordValidation from "./PasswordValidation";
import { z } from "zod";

const registrationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  nationality: z.string().optional(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/\d/, "Password must contain at least one number"),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms & conditions",
  }),
});

function RegistrationForm({
  formData,
  handleInputChange,
  handleFormSubmit,
  handleSocialRegister,
  loading,
  error,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationErrors({});
    
    // Validate with Zod
    try {
      registrationSchema.parse(formData);
      handleFormSubmit(e);
    } catch (validationError) {
      const errors = {};
      validationError.errors.forEach((err) => {
        const path = err.path[0];
        errors[path] = err.message;
      });
      setValidationErrors(errors);
      
      // Set first error to main error display
      if (validationError.errors[0]) {
        handleInputChange("error", validationError.errors[0].message);
      }
    }
  };

  const getFieldError = (fieldName) => {
    return validationErrors[fieldName];
  };

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl text-center font-bold text-gray-900">
        Create Your Account
      </h1>
      <p className="text-gray-500 text-center text-sm mt-1 mb-4">
        Let's get started with real-time cost sharing.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-3 text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => handleSocialRegister("google")}
          className="flex items-center justify-center gap-3 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <FcGoogle size={20} />
          <span className="text-gray-700 text-sm">Sign Up with Google</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => handleSocialRegister("apple")}
          className="flex items-center justify-center gap-3 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <PiAppleLogoBold size={20} />
          <span className="text-gray-700 text-sm">Sign Up with Apple</span>
        </motion.button>
      </div>

      <div className="flex items-center my-4">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-2 text-gray-500 text-sm">Or</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {[
          { key: "firstName", label: "First Name", type: "text" },
          { key: "lastName", label: "Last Name", type: "text" },
          { key: "email", label: "Email Address", type: "email" },
          { key: "nationality", label: "Nationality", type: "text" },
        ].map((field) => (
          <div key={field.key}>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              {field.label} *
            </label>
            <input
              type={field.type}
              value={formData[field.key]}
              placeholder={`Enter your ${field.label.toLowerCase()}`}
              onChange={(e) => {
                handleInputChange(field.key, e.target.value);
                if (validationErrors[field.key]) {
                  setValidationErrors(prev => ({ ...prev, [field.key]: undefined }));
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-colors ${
                getFieldError(field.key) ? "border-red-300" : "border-gray-300"
              }`}
              required
            />
            {getFieldError(field.key) && (
              <p className="text-red-500 text-xs mt-1">{getFieldError(field.key)}</p>
            )}
          </div>
        ))}

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              placeholder="Create your password"
              onChange={(e) => {
                handleInputChange("password", e.target.value);
                if (validationErrors.password) {
                  setValidationErrors(prev => ({ ...prev, password: undefined }));
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors pr-10 ${
                getFieldError("password") ? "border-red-300" : "border-gray-300"
              }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-2 pr-1 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {getFieldError("password") && (
            <p className="text-red-500 text-xs mt-1">{getFieldError("password")}</p>
          )}
          <PasswordValidation password={formData.password} />
        </div>

        <label className="flex gap-2 text-sm text-gray-600 mt-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={(e) => {
              handleInputChange("agreeToTerms", e.target.checked);
              if (validationErrors.agreeToTerms) {
                setValidationErrors(prev => ({ ...prev, agreeToTerms: undefined }));
              }
            }}
            className="rounded focus:ring-green-500"
          />
          <span>
            I agree to the{" "}
            <a href="/terms" className="text-green-600 hover:underline font-medium">
              Terms
            </a>
            ,{" "}
            <a href="/privacy" className="text-green-600 hover:underline font-medium">
              Privacy
            </a>{" "}
            &{" "}
            <a href="/fees" className="text-green-600 hover:underline font-medium">
              Fees
            </a>
            .
          </span>
        </label>
        {getFieldError("agreeToTerms") && (
          <p className="text-red-500 text-xs">{getFieldError("agreeToTerms")}</p>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className={`w-full bg-green-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 ${
            loading ? "opacity-60 cursor-not-allowed" : "hover:bg-green-700"
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

        <p className="text-center text-sm text-gray-600 mt-3">
          Already have an account?{" "}
          <Link to="/login" className="text-green-600 hover:underline font-medium">
            Log In
          </Link>
        </p>
      </form>
    </div>
  );
}

export default RegistrationForm;