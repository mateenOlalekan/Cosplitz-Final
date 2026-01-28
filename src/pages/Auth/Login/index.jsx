// src/pages/Login/index.jsx - REFACTORED VERSION
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import logo from '../../../assets/logo.svg';
import LeftPanel from '../../../components/Home/LeftPanel';
import { useLogin, useUser } from '../../../services/queries/auth';
import { loginSchema } from '../../../schemas/authSchemas';
import { FcGoogle } from "react-icons/fc";
import { PiAppleLogoBold } from "react-icons/pi";
import Loading from '../../../components/Home/Loading';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  const { data: user, isLoading: isUserLoading, isError: isUserError } = useUser();
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [submitError, setSubmitError] = useState('');
  const [comingSoonError, setComingSoonError] = useState('');
  useEffect(() => {
    if (user && !isUserLoading && !isUserError) {
      navigate(from, { replace: true });
    }
  }, [user, isUserLoading, isUserError, navigate, from]);

  const handleComingSoon = (provider) => {
    setComingSoonError(`${provider} sign-in coming soon`);
    setTimeout(() => {
      setComingSoonError('');
    }, 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setFieldErrors({ email: '', password: '' });
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const errors = {};
      result.error.errors.forEach((err) => {
        errors[err.path[0]] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    try {
      await login.mutateAsync({
        credentials: {
          email: email.trim().toLowerCase(),
          password,
        },
        remember,
      });
    } catch (error) {
      console.error('Login error:', error);
      let message = 'Login failed. Please try again.';
      
      if (error?.status === 401) {
        message = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error?.status === 403) {
        message = 'Your account is not verified. Please check your email for the verification link.';
      } else if (error?.status === 429) {
        message = 'Too many login attempts. Please try again later.';
      } else if (error?.message) {
        const errorMsg = error.message.toLowerCase();
        if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
          message = 'Network error. Please check your internet connection and try again.';
        } else if (errorMsg.includes('not verified') || errorMsg.includes('verify')) {
          message = 'Your email is not verified. Please check your inbox for the verification link.';
        } else if (errorMsg.includes('disabled') || errorMsg.includes('suspended')) {
          message = 'Your account has been disabled. Please contact support.';
        } else if (errorMsg.includes('invalid') && errorMsg.includes('credentials')) {
          message = 'Invalid email or password. Please check your credentials.';
        } else {
          message = error.message;
        }
      }
      setSubmitError(message);
    }
  };

  const inputClass = (hasError) =>    `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-colors ${hasError ? 'border-red-300' : 'border-gray-300 focus:border-green-500'    }`;
  const isLoading = login.isPending || isUserLoading;
  if (isUserLoading) {
    return <Loading />;
  }

  return (
    <div className="flex bg-[#F7F5F9] w-full h-screen justify-center overflow-hidden md:px-6 md:py-4">
      <div className="flex max-w-screen-2xl w-full min-h-full rounded-xl overflow-hidden">
        <LeftPanel />
        <div className="flex flex-1 flex-col items-center p-3 overflow-y-auto">
          <div className="w-full mb-4 flex justify-center md:justify-start">
            <img src={logo} alt="Logo" className="h-10 md:h-12" />
          </div>
          <div className="w-full max-w-2xl p-5 rounded-xl shadow-none md:shadow-md border-none md:border border-gray-100 bg-white space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl text-center font-bold text-gray-900">
                Welcome Back
              </h1>
              <p className="text-gray-500 text-center text-sm mt-1">
                Sign in to continue sharing expenses.
              </p>
            </div>

            {comingSoonError && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm p-3 rounded-lg text-center">
                {comingSoonError}
              </div>
            )}

            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg text-center">
                {submitError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleComingSoon('Google')}
                className="flex items-center justify-center gap-3 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FcGoogle size={20} />
                <span className="text-gray-700 text-sm">Sign in with Google</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleComingSoon('Apple')}
                className="flex items-center justify-center gap-3 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <PiAppleLogoBold size={20} />
                <span className="text-gray-700 text-sm">Sign in with Apple</span>
              </motion.button>
            </div>

            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-300" />
              <span className="mx-2 text-gray-500 text-sm">Or</span>
              <div className="flex-grow border-t border-gray-300" />
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {  setEmail(e.target.value);  setFieldErrors(prev => ({ ...prev, email: '' }));    setSubmitError('');   }}
                  placeholder="Enter your email"
                  className={inputClass(fieldErrors.email)}
                  required
                  disabled={isLoading}
                />
                {fieldErrors.email && (
                  <p className="text-red-600 text-xs mt-1">{fieldErrors.email}</p>
                )}
              </div>

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
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-2 pr-1 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-red-600 text-xs mt-1">{fieldErrors.password}</p>
                )}
              </div>

              <div className="flex justify-between items-center">
                <label className="flex gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="rounded focus:ring-green-500"
                    disabled={isLoading}
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
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                type="submit"
                disabled={isLoading}
                className={`w-full bg-green-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 ${
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
