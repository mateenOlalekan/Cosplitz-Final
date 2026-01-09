// RegistrationForm.jsx - FIXED WITH PROPER INTEGRATION
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
  const [formErrors, setFormErrors] = useState({});

  // Form fields configuration
  const formFields = [
    { 
      key: "firstName", 
      label: "First Name", 
      type: "text", 
      placeholder: "Enter your first name",
      required: true 
    },
    { 
      key: "lastName", 
      label: "Last Name", 
      type: "text", 
      placeholder: "Enter your last name",
      required: true 
    },
    { 
      key: "email", 
      label: "Email Address", 
      type: "email", 
      placeholder: "you@example.com",
      required: true 
    },
    { 
      key: "nationality", 
      label: "Nationality (Optional)", 
      type: "text", 
      placeholder: "e.g., Indian, American",
      required: false 
    },
  ];

  // Handle field blur
  const handleBlur = (field) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  // Simple validation function
  const validateField = (field, value) => {
    let error = "";
    
    switch (field) {
      case "firstName":
      case "lastName":
        if (value.length < 2) {
          error = `${field === "firstName" ? "First" : "Last"} name must be at least 2 characters`;
        } else if (!/^[a-zA-Z\s]*$/.test(value)) {
          error = `${field === "firstName" ? "First" : "Last"} name can only contain letters and spaces`;
        }
        break;
        
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          error = "Please enter a valid email address";
        }
        break;
        
      case "password":
        if (value.length < 8) {
          error = "Password must be at least 8 characters";
        } else if (!/[A-Z]/.test(value)) {
          error = "Password must contain at least one uppercase letter";
        } else if (!/\d/.test(value)) {
          error = "Password must contain at least one number";
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          error = "Password must contain at least one special character";
        }
        break;
        
      case "agreeToTerms":
        if (!value) {
          error = "You must agree to the terms & conditions";
        }
        break;
    }
    
    if (error) {
      setFormErrors((prev) => ({ ...prev, [field]: error }));
      return false;
    } else {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
      return true;
    }
  };

  // Validate entire form
  const isFormValid = () => {
    // Required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      return false;
    }
    
    // Validate each field
    const validations = [
      validateField("firstName", formData.firstName),
      validateField("lastName", formData.lastName),
      validateField("email", formData.email),
      validateField("password", formData.password),
      validateField("agreeToTerms", formData.agreeToTerms),
    ];
    
    return validations.every(v => v === true);
  };

  // Handle input change with validation
  const handleInputChangeWithValidation = (field, value) => {
    handleInputChange(field, value);
    if (touchedFields[field]) {
      validateField(field, value);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mark all required fields as touched
    const requiredFields = ["firstName", "lastName", "email", "password", "agreeToTerms"];
    const newTouched = {};
    requiredFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouchedFields(newTouched);
    
    // Validate all fields
    const isValid = isFormValid();
    
    if (isValid) {
      handleFormSubmit(e);
    } else {
      // Show first error
      const firstErrorField = Object.keys(formErrors).find(field => formErrors[field]);
      if (firstErrorField) {
        // Focus on the first error field
        const input = document.querySelector(`[name="${firstErrorField}"]`);
        if (input) input.focus();
      }
    }
  };

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

      {/* Error Message from Store */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">
          {error}
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Form Fields */}
        {formFields.map((field) => {
          const hasError = !!formErrors[field.key];
          const isTouched = touchedFields[field.key];
          
          return (
            <div key={field.key} className="space-y-1">
              <label className="text-sm font-medium text-gray-700 block">
                {field.label} {field.required && "*"}
              </label>
              <div className="relative">
                <input
                  type={field.type}
                  value={formData[field.key]}
                  placeholder={field.placeholder}
                  onChange={(e) => handleInputChangeWithValidation(field.key, e.target.value)}
                  onBlur={() => handleBlur(field.key)}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-colors ${
                    hasError && isTouched
                      ? "border-red-400 focus:border-red-400" 
                      : "border-gray-300 focus:border-green-600"
                  } disabled:opacity-50`}
                  required={field.required}
                  disabled={loading}
                  aria-invalid={hasError && isTouched}
                  aria-describedby={hasError ? `${field.key}-error` : undefined}
                />
              </div>
              {hasError && isTouched && (
                <p id={`${field.key}-error`} className="text-red-500 text-xs mt-1">
                  {formErrors[field.key]}
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
              onChange={(e) => handleInputChangeWithValidation("password", e.target.value)}
              onBlur={() => handleBlur("password")}
              className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-colors pr-10 ${
                formErrors.password && touchedFields.password
                  ? "border-red-400 focus:border-red-400" : "border-gray-300 focus:border-green-600"
              } disabled:opacity-50`}
              required
              disabled={loading}
              aria-invalid={!!formErrors.password && touchedFields.password}
              aria-describedby={formErrors.password ? "password-error" : undefined}
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
          {formErrors.password && touchedFields.password && (
            <p id="password-error" className="text-red-500 text-xs mt-1">
              {formErrors.password}
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
              onChange={(e) => handleInputChangeWithValidation("agreeToTerms", e.target.checked)}
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
          {formErrors.agreeToTerms && touchedFields.agreeToTerms && (
            <p className="text-red-500 text-xs mt-1 ml-7">
              {formErrors.agreeToTerms}
            </p>
          )}
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
    </div>
  );
}

export default RegistrationForm;