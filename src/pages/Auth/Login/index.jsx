// src/pages/Auth/Login/index.jsx - FIXED WITH PROPER REDIRECT
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { PiAppleLogoBold } from "react-icons/pi";
import { Eye, EyeOff } from "lucide-react";
import logo from "../../../assets/logo.svg";
import loginImage from "../../../assets/login.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const { login, error, isLoading, clearError, isAuthenticated, initializeAuth, isAuthInitialized } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Only check authentication after auth is initialized
  useEffect(() => {
    if (isAuthInitialized() && isAuthenticated()) {
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location, isAuthInitialized]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleLogin = async (e) => {
    e.preventDefault();
    clearError();
    
    if (!email.trim()) {
      useAuthStore.getState().setError("Email is required");
      return;
    }
    
    if (!password) {
      useAuthStore.getState().setError("Password is required");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      useAuthStore.getState().setError("Please enter a valid email address");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await login({ email, password });
      
      if (result.success) {
        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
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

  const handleDemoLogin = () => {
    setEmail("demo@cosplitz.com");
    setPassword("Demo@1234");
    useAuthStore.getState().setError("Demo login is disabled in production. Use your own credentials.");
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && email && password) {
      handleLogin(e);
    }
  };

  // Don't show anything while loading
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F5F9]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-[#F7F5F9] w-full min-h-screen justify-center items-center md:px-6 md:py-4 rounded-2xl">
      <div className="flex max-w-screen-2xl w-full h-full rounded-xl overflow-hidden">
        <div className="hidden lg:flex w-1/2 bg-[#F8EACD] rounded-xl p-6 items-center justify-center">
          <div className="w-full flex flex-col items-center">
            <img 
              src={loginImage} 
              alt="Login" 
              className="rounded-lg w-full h-auto max-h-[400px] object-contain"
            />
            <div className="bg-gradient-to-br max-w-lg from-[#FAF3E8] to-[#F8EACD] mt-4 p-4 rounded-2xl shadow-sm text-center">
              <h1 className="text-3xl font-semibold text-[#2D0D23] mb-1">
                Welcome Back to Cosplitz
              </h1>
              <p className="text-xl font-medium text-[#4B4B4B] leading-relaxed">
                Sign in to manage your shared expenses and connect with others.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="w-full max-w-md">
            <div className="w-full mb-6 flex justify-center">
              <img src={logo} alt="Cosplitz Logo" className="h-12" />
            </div>

            <div className="w-full p-5 md:p-8 rounded-xl shadow-md border border-gray-100 bg-white">
              <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Welcome Back
                </h1>
                <p className="text-gray-500 text-sm mt-1 mb-4">
                  Sign in to continue sharing expenses.
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-4 text-center"
                >
                  {error}
                </motion.div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => handleSocialLogin("google")}
                  disabled={isSubmitting || isLoading}
                  className="flex items-center justify-center gap-3 px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FcGoogle size={20} />
                  <span className="text-gray-700 text-sm">Google</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => handleSocialLogin("apple")}
                  disabled={isSubmitting || isLoading}
                  className="flex items-center justify-center gap-3 px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PiAppleLogoBold size={20} />
                  <span className="text-gray-700 text-sm">Apple</span>
                </motion.button>
              </div>

              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="mx-4 text-gray-500 text-sm">Or continue with email</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

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
                    onKeyDown={handleKeyPress}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors disabled:opacity-50"
                    required
                    disabled={isSubmitting || isLoading}
                    autoComplete="email"
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
                      onKeyDown={handleKeyPress}
                      placeholder="Enter your password"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors pr-10 disabled:opacity-50"
                      required
                      disabled={isSubmitting || isLoading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                      disabled={isSubmitting || isLoading}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded focus:ring-green-500 text-green-600 disabled:opacity-50"
                      disabled={isSubmitting || isLoading}
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-green-600 hover:underline font-medium hover:text-green-700 transition-colors disabled:opacity-50"
                    disabled={isSubmitting || isLoading}
                  >
                    Forgot Password?
                  </button>
                </div>

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

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleDemoLogin}
                    disabled={isSubmitting || isLoading}
                    className="text-sm text-gray-600 hover:text-gray-800 underline py-2 disabled:opacity-50"
                  >
                    Try demo account
                  </button>
                </div>
              </form>

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

            <div className="text-center mt-6">
              <p className="text-xs text-gray-500">
                By signing in, you agree to our{" "}
                <a href="/terms" className="text-green-600 hover:underline">Terms</a>,{" "}
                <a href="/privacy" className="text-green-600 hover:underline">Privacy Policy</a>, and{" "}
                <a href="/fees" className="text-green-600 hover:underline">Fees</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}