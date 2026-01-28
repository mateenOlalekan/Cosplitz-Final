import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useUser } from '../../../services/queries/auth';
import Checknow from '../../../assets/Check.svg';
import { getToken } from '../../../services/endpoints/auth';

export default function Successful() {
  const navigate = useNavigate();
  const hasToken = !!getToken();
  const { data: user, isLoading, isError } = useUser({ enabled: hasToken });

  // 🔴 FIXED: Wait for both token AND user data before redirecting
  useEffect(() => {
    if (!hasToken || !user || isLoading) return;

    if (user && !isError) {
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [hasToken, user, isLoading, isError, navigate]);

  return (
    <div className="flex flex-col items-center text-center py-6">
      <img src={Checknow} alt="Success" className="w-24 h-24 mb-4" />
      <h2 className="text-2xl font-bold text-gray-800">Email Verified Successfully!</h2>
      <p className="text-gray-600 mt-2 max-w-sm">
        {isLoading 
          ? 'Loading your dashboard...' 
          : "Your email has been verified. Let's set up your profile!"}
      </p>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate('/dashboard')}
        disabled={isLoading}
        className="w-full mt-6 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 rounded-lg font-semibold transition-colors"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Loading...
          </span>
        ) : 'Continue to Dashboard'}
      </motion.button>
    </div>
  );
}