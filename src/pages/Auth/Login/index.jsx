// src/pages/Auth/Login/index.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../../services/authApi";
import { useAuthStore } from "../../../store/authStore";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { PiAppleLogoBold } from "react-icons/pi";
import { Eye, EyeOff } from "lucide-react";
import logo from "../../../assets/logo.svg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const setError = useAuthStore((state) => state.setError);
  const clearError = useAuthStore((state) => state.clearError);
  const error = useAuthStore((state) => state.error);
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    clearError();
    setLoading(true);

    if (!email || !password) {
      setError("Please fill in both email and password.");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const response = await authService.login({ email, password });
      
      console.log("Login response:", response);
      
      if (response.success && response.data?.token) {
        // Store token according to "remember me" selection
        setToken(response.data.token, remember);
        
        // Get user info
        try {
          const userInfo = await authService.getUserInfo();
          if (userInfo.success) {
            setUser(userInfo.data);
          } else {
            // Fallback user data
            setUser({
              email: email,
              name: email.split("@")[0],
              role: "user"
            });
          }
        } catch (userInfoError) {
          console.warn("Could not fetch user info:", userInfoError);
          // Set basic user data
          setUser({
            email: email,
            name: email.split("@")[0],
            role: "user"
          });
        }
        
        // Redirect to dashboard
        navigate("/dashboard");
      } else {
        setError(response.data?.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Social login with ${provider}`);
    setError(`${provider} login coming soon!`);
  };

  return (
    <div className="flex bg-[#F7F5F9] w-full h-screen justify-center overflow-hidden md:px-6 md:py-4 rounded-2xl">
      <div className="flex max-w-screen-2xl w-full h-full rounded-xl overflow-hidden">
        {/* LEFT - You need to create or import LeftPanel component */}
        <div className="hidden lg:flex w-1/2 bg-[#F8EACD] rounded-xl p-6 items-center justify-center">
          <div className="w-full flex flex-col items-center">
            <div className="bg-gradient-to-br max-w-lg from-[#FAF3E8] to-[#F8EACD] mt-4 p-4 rounded-2xl shadow-sm text-center">
              <h1 className="text-3xl font-semibold text-[#2D0D23] mb-1">
                Welcome Back to Cosplitz
              </h1>
              <p className="text-xl font-medium text-[#4B4B4B] leading-relaxed">
                Sign in to continue sharing expenses with your community.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-1 flex-col items-center p-3 overflow-y-auto">
          <div className="w-full mb-4 flex justify-center md:justify-start items-center md:items-start">
            <img src={logo} alt="Logo" className="h-10 md:h-12" />
          </div>

          <div className="w-full max-w-2xl p-5 rounded-xl shadow-none md:shadow-md border-none md:border border-gray-100 bg-white space-y-6">
            <h1 className="text-2xl sm:text-3xl text-center font-bold text-gray-900">
              Welcome Back
            </h1>
            <p className="text-gray-500 text-center text-sm mt-1 mb-4">
              Sign in to continue sharing expenses.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-3 text-center">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleSocialLogin("google")}
                className="flex items-center justify-center gap-3 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FcGoogle size={20} />
                <span className="text-gray-700 text-sm">Sign in with Google</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleSocialLogin("apple")}
                className="flex items-center justify-center gap-3 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <PiAppleLogoBold size={20} />
                <span className="text-gray-700 text-sm">Sign in with Apple</span>
              </motion.button>
            </div>

            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-2 text-gray-500 text-sm">Or</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) clearError();
                    }}
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
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
                    placeholder="Enter your password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <label className="flex gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="rounded focus:ring-green-500"
                  />
                  <span>Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-green-600 hover:underline font-medium"
                >
                  Forgot Password?
                </Link>
              </div>

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
                    Signing In...
                  </span>
                ) : (
                  "Sign In"
                )}
              </motion.button>

              <p className="text-center text-sm text-gray-600 mt-3">
                Don't have an account?{" "}
                <Link to="/register" className="text-green-600 hover:underline font-medium">
                  Sign Up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}