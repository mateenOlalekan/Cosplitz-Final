// src/pages/Auth/Login/index.jsx - REFACTORED & DEBUGGED
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { PiAppleLogoBold } from "react-icons/pi";
import { Eye, EyeOff } from "lucide-react";
import logo from "../../../assets/logo.svg";
import LeftPanel from "../../../components/Home/LeftPanel";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get auth store actions and state
  const {login,error,    isLoading,    clearError,    isAuthenticated,
    initializeAuth } = useAuthStore();

  // Check if user is already authenticated
  useEffect(() => {
    // Initialize auth from storage
    initializeAuth();
    
    // If already logged in, redirect to dashboard or intended page
    if (isAuthenticated()) {
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location, initializeAuth]);

  // Clear errors when component unmounts or when inputs change
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const handleLogin = async (e) => {
    e.preventDefault();
    clearError();
    
    // Form validation
    if (!email.trim()) {
      useAuthStore.getState().setError("Email is required");
      return;
    }
    
    if (!password) {
      useAuthStore.getState().setError("Password is required");
      return;
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      useAuthStore.getState().setError("Please enter a valid email address");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await login({ email, password });
      
      if (result.success) {
        // Successfully logged in
        const from = location.state?.from?.pathname || "/dashboard";
        
        // Small delay to ensure state is updated
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 100);
      } else {
        // Error is already set in the store by the login action
        console.error("Login failed:", result.error);
      }
    } catch (err) {
      console.error("Login process error:", err);
      useAuthStore.getState().setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Social login with ${provider}`);
    useAuthStore.getState().setError(`${provider} login coming soon!`);
  };

  const handleDemoLogin = async () => {
    // Optional: Add demo login for testing
    useAuthStore.getState().setError("Demo login feature coming soon!");
  };

  return (
    <div className="flex bg-[#F7F5F9] w-full h-screen justify-center overflow-hidden md:px-6 md:py-4 rounded-2xl">
      <div className="flex max-w-screen-2xl w-full h-full rounded-xl overflow-hidden">
        {/* LEFT */}
        <LeftPanel />

        {/* RIGHT */}
        <div className="flex flex-1 flex-col items-center p-3 overflow-y-auto">
          <div className="w-full mb-4 flex justify-center md:justify-start items-center md:items-start">
            <img src={logo} alt="Logo" className="h-10 md:h-12" />
          </div>

          <div className="w-full max-w-2xl p-5 md:p-8 rounded-xl shadow-none md:shadow-md border-none md:border border-gray-100 bg-white space-y-6">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Welcome Back
              </h1>
              <p className="text-gray-500 text-sm mt-1 mb-4">
                Sign in to continue sharing expenses.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-3 text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Social Login Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleSocialLogin("google")}
                className="flex items-center justify-center gap-3 px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FcGoogle size={20} />
                <span className="text-gray-700 text-sm">Google</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleSocialLogin("apple")}
                className="flex items-center justify-center gap-3 px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <PiAppleLogoBold size={20} />
                <span className="text-gray-700 text-sm">Apple</span>
              </motion.button>
            </div>

            {/* Divider */}
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-4 text-gray-500 text-sm">Or continue with email</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) clearError();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && password) {
                      handleLogin(e);
                    }
                  }}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
                  required
                  disabled={isSubmitting || isLoading}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) clearError();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && email) {
                        handleLogin(e);
                      }
                    }}
                    placeholder="Enter your password"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors pr-10"
                    required
                    disabled={isSubmitting || isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isSubmitting || isLoading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded focus:ring-green-500 text-green-600"
                    disabled={isSubmitting || isLoading}
                  />
                  <span>Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-green-600 hover:underline font-medium hover:text-green-700 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: isSubmitting || isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting || isLoading ? 1 : 0.98 }}
                type="submit"
                disabled={isSubmitting || isLoading}
                className={`w-full bg-green-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 ${
                  isSubmitting || isLoading 
                    ? "opacity-70 cursor-not-allowed" 
                    : "hover:bg-green-700"
                }`}
              >
                {isSubmitting || isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing In...
                  </span>
                ) : (
                  "Sign In"
                )}
              </motion.button>

              {/* Demo Login Button (Optional) */}
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full text-sm text-gray-600 hover:text-gray-800 underline py-2"
              >
                Try demo account
              </button>
            </form>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-gray-600 mt-6 pt-4 border-t border-gray-100">
              Don't have an account?{" "}
              <Link 
                to="/register" 
                className="text-green-600 hover:underline font-medium hover:text-green-700 transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}