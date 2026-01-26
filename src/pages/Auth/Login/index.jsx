// src/pages/Login/index.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import logo from '../../../assets/logo.svg';
import LeftPanel from '../../../components/Home/LeftPanel';
import { useLogin, useUser } from '../../../services/queries/auth';
import { loginSchema } from '../../../schemas/authSchemas';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  // TanStack Query hooks - updated to check loading state
  const { data: user, isLoading: isUserLoading } = useUser();
  const login = useLogin();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [submitError, setSubmitError] = useState('');

  // Redirect if already logged in - only when not loading and user exists
  useEffect(() => {
    if (user && !isUserLoading) {
      navigate(from, { replace: true });
    }
  }, [user, isUserLoading, navigate, from]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setFieldErrors({ email: '', password: '' });

    // Validate
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const errors = {};
      result.error.errors.forEach((err) => {
        errors[err.path[0]] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    // Submit
    try {
      await login.mutateAsync({
        credentials: {
          email: email.trim().toLowerCase(),
          password,
        },
        remember,
      });
      // Success - user query will update and trigger redirect
    } catch (error) {
      // Handle specific error types for better UX
      if (error?.status === 401) {
        setSubmitError('Invalid email or password');
      } else {
        setSubmitError(error?.message || 'Login failed. Please try again.');
      }
    }
  };

  const inputClass = (hasError) =>
    `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-colors ${
      hasError ? 'border-red-300' : 'border-gray-300 focus:border-green-500'
    }`;

  // Combined loading state
  const isLoading = login.isPending || isUserLoading;

  // Show loading while checking auth status
  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F7F5F9]">
        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex bg-[#F7F5F9] w-full h-screen justify-center overflow-hidden md:px-6 md:py-4">
      <div className="flex max-w-screen-2xl w-full min-h-full rounded-xl overflow-hidden">
        
        {/* Left Panel */}
        <LeftPanel />

        {/* Right Panel */}
        <div className="flex flex-1 flex-col items-center p-3 overflow-y-auto">
          
          {/* Logo */}
          <div className="w-full mb-4 flex justify-center md:justify-start">
            <img src={logo} alt="Logo" className="h-10 md:h-12" />
          </div>

          <div className="w-full max-w-2xl p-5 rounded-xl shadow-none md:shadow-md border-none md:border border-gray-100 bg-white space-y-6">
            
            {/* Header */}
            <h1 className="text-2xl sm:text-3xl text-center font-bold text-gray-900">
              Welcome Back
            </h1>
            <p className="text-gray-500 text-center text-sm mt-1 mb-4">
              Sign in to continue sharing expenses.
            </p>

            {/* Error Display */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg text-center">
                {submitError}
              </div>
            )}

            {/* Social Login */}
            <div className="grid grid-cols-1 gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => alert('Google login coming soon!')}
                disabled={isLoading}
                className="flex items-center justify-center gap-3 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <span className="text-gray-700 text-sm">Sign in with Google</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => alert('Apple login coming soon!')}
                disabled={isLoading}
                className="flex items-center justify-center gap-3 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <span className="text-gray-700 text-sm">Sign in with Apple</span>
              </motion.button>
            </div>

            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-300" />
              <span className="mx-2 text-gray-500 text-sm">Or</span>
              <div className="flex-grow border-t border-gray-300" />
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-3">
              
              {/* Email */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFieldErrors(prev => ({ ...prev, email: '' }));
                    setSubmitError('');
                  }}
                  placeholder="Enter your email"
                  className={inputClass(fieldErrors.email)}
                  required
                />
                {fieldErrors.email && (
                  <p className="text-red-600 text-xs mt-1">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFieldErrors(prev => ({ ...prev, password: '' }));
                      setSubmitError('');
                    }}
                    placeholder="Enter your password"
                    className={`${inputClass(fieldErrors.password)} pr-10`}
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
                {fieldErrors.password && (
                  <p className="text-red-600 text-xs mt-1">{fieldErrors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
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

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className={`w-full bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors ${
                  isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-green-700'
                }`}
              >
                {login.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing In...
                  </span>
                ) : (
                  'Sign In'
                )}
              </motion.button>

              {/* Sign Up Link */}
              <p className="text-center text-sm text-gray-600 mt-3">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-green-600 hover:underline font-medium"
                >
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