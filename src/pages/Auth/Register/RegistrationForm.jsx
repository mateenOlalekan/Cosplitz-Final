// RegistrationForm.jsx - REFACTORED WITH ZOD
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { PiAppleLogoBold } from "react-icons/pi";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import PasswordValidation from "./PasswordValidation";

// Define Zod schema for form validation
const registrationSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }).trim(),
  lastName: z.string() .min(2, { message: "Last name must be at least 2 characters" }).trim(),
  email: z.string() .email({ message: "Please enter a valid email address" }).min(5, { message: "Email must be at least 5 characters" }) .trim(),
  nationality: z.string().or(z.literal("")),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }).regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" }).regex(/\d/, { message: "Password must contain at least one number" }),
  agreeToTerms: z.boolean().refine((val) => val === true, {message: "You must agree to the terms & conditions",}),
});

function RegistrationForm({ handleFormSubmit, handleSocialRegister, loading,error,}) {
  const [showPassword, setShowPassword] = useState(false);
  const {register,handleSubmit,watch,formState: { errors, isValid, touchedFields },setValue,trigger,} = useForm({resolver: zodResolver(registrationSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      nationality: "",
      password: "",
      agreeToTerms: false,
    },
  });

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
      label: "Nationality", 
      type: "text", 
      placeholder: "Enter your Nationality",
      required: false 
    },
  ];

  // Watch password for validation display
  const passwordValue = watch("password");

  // Custom handler for checkbox to integrate with react-hook-form
  const handleCheckboxChange = (e) => {
    setValue("agreeToTerms", e.target.checked);
    trigger("agreeToTerms");
  };

  // Handle form submission
  const onSubmit = (data) => {
    // Transform data for API
    const apiData = {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      nationality: data.nationality || undefined,
      password: data.password,
      agree_to_terms: data.agreeToTerms,
    };
    
    // Create a synthetic event for compatibility
    const syntheticEvent = { preventDefault: () => {} };
    handleFormSubmit(syntheticEvent, apiData);
  };

  // Handle Enter key press in nationality field
  const handleNationalityKeyPress = (e) => {
    if (e.key === 'Enter' && isValid) {
      handleSubmit(onSubmit)();
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => handleSocialRegister("google")}
          disabled={loading}
          className="flex items-center justify-center gap-3 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          className="flex items-center justify-center gap-3 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PiAppleLogoBold size={20} />
          <span className="text-gray-700 text-sm">Sign Up with Apple</span>
        </motion.button>
      </div>

      {/* Divider */}
      <div className="flex items-center my-4">
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        {/* Form Fields */}
        {formFields.map((field) => {
          const hasError = !!errors[field.key];
          const isTouched = touchedFields[field.key];
          
          return (
            <div key={field.key} className="space-y-1">
              <label className="text-sm font-medium text-gray-700 block">
                {field.label} {field.required && "*"}
              </label>
              <div className="relative">
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  {...register(field.key)}
                  onKeyDown={field.key === "nationality" ? handleNationalityKeyPress : undefined}
                  className={`w-full px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-colors ${
                    hasError && isTouched
                      ? "border-red-400 focus:border-red-400" 
                      : !errors[field.key] && isTouched
                      ? "border-green-400 focus:border-green-600"
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
                  {errors[field.key]?.message}
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
              placeholder="Create a strong password"
              {...register("password")}
              className={`w-full px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-colors pr-10 ${
                errors.password && touchedFields.password
                  ? "border-red-400 focus:border-red-400" 
                  : !errors.password && touchedFields.password
                  ? "border-green-400 focus:border-green-600"
                  : "border-gray-300 focus:border-green-600"
              } disabled:opacity-50`}
              required
              disabled={loading}
              aria-invalid={!!errors.password && touchedFields.password}
              aria-describedby={errors.password ? "password-error" : undefined}
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
          {errors.password && touchedFields.password && (
            <p id="password-error" className="text-red-500 text-xs mt-1">
              {errors.password.message}
            </p>
          )}
          <PasswordValidation password={passwordValue} />
        </div>

        {/* Terms & Conditions */}
        <div className="mt-4">
          <label className="flex items-start gap-3 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              {...register("agreeToTerms")}
              onChange={handleCheckboxChange}
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
              . 
            </span>
          </label>
          {errors.agreeToTerms && touchedFields.agreeToTerms && (
            <p className="text-red-500 text-xs mt-1 ml-7">
              {errors.agreeToTerms.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: isValid && !loading ? 1.02 : 1 }}
          whileTap={{ scale: isValid && !loading ? 0.98 : 1 }}
          type="submit"
          disabled={!isValid || loading}
          className={`w-full py-3 rounded-lg font-semibold mt-6 transition-all duration-200 ${
            !isValid || loading
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
        <p className="text-center text-sm text-gray-600 pt-4">
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