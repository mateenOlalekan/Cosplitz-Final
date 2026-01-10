import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { PiAppleLogoBold } from "react-icons/pi";
import { Eye, EyeOff } from "lucide-react";
import logo from "../../../assets/logo.svg";
import LeftPanel from "../../../components/Home/LeftPanel";
import { useAuthStore } from "../../../store/authStore";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, setError, clearError, isAuthenticated } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [clientReady, setClientReady] = useState(false); // hydration guard

  const from = location.state?.from?.pathname || "/dashboard";

  /* ---------- hydration-safe redirect ---------- */
  useEffect(() => {
    setClientReady(true);
  }, []);

  useEffect(() => {
    if (clientReady && isAuthenticated()) navigate(from, { replace: true });
  }, [clientReady, isAuthenticated, navigate, from]);

  /* ---------- submit ---------- */
  const handleLogin = async (e) => {
    e.preventDefault();
    clearError();
    try {
      loginSchema.parse({ email, password });
    } catch (err) {
      setError(err.errors?.[0]?.message || "Validation error");
      return;
    }
    const res = await login({ email, password });
    if (res.success) navigate(from, { replace: true });
  };

  const social = (provider) => setError(`${provider} login coming soon!`);

  if (!clientReady) return null; // avoid SSR flash

  return (
    <div className="flex bg-[#F7F5F9] w-full h-screen justify-center overflow-hidden md:px-6 md:py-4 rounded-2xl">
      <div className="flex max-w-screen-2xl w-full h-full rounded-xl overflow-hidden">
        <LeftPanel />

        <div className="flex flex-1 flex-col items-center p-3 overflow-y-auto">
          <div className="w-full mb-4 flex justify-center md:justify-start items-center md:items-start">
            <img src={logo} alt="Logo" className="h-10 md:h-12" />
          </div>

          <div className="w-full max-w-2xl p-5 rounded-xl shadow-none md:shadow-md border-none md:border border-gray-100 bg-white space-y-6">
            <h1 className="text-2xl sm:text-3xl text-center font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 text-center text-sm mt-1 mb-4">Sign in to continue sharing expenses.</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-3 text-center">{error}</div>
            )}

            <div className="grid grid-cols-1 gap-2 mb-3">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => social("google")} className="flex items-center justify-center gap-3 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <FcGoogle size={20} />
                <span className="text-gray-700 text-sm">Sign in with Google</span>
              </motion.button>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => social("apple")} className="flex items-center justify-center gap-3 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
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
                <label className="text-sm font-medium text-gray-700 mb-1 block">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearError();
                  }}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Password *</label>
                <div className="relative">
                  <input
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearError();
                    }}
                    placeholder="Enter your password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors pr-10"
                    required
                  />
                  <button type="button" onClick={() => setShow((s) => !s)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <label className="flex gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" className="rounded focus:ring-green-500" />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-green-600 hover:underline font-medium">
                  Forgot Password?
                </Link>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className={`w-full bg-green-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 ${
                  isLoading ? "opacity-60 cursor-not-allowed" : "hover:bg-green-700"
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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