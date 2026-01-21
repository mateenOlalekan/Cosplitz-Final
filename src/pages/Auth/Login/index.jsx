]import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Checknow from '../../../assets/Check.svg';

export default function Successful() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect after 3 seconds
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center text-center py-6">
      <img src={Checknow} alt="Success" className="w-24 h-24 mb-4" />
      <h2 className="text-2xl font-bold text-gray-800">Email Verified Successfully!</h2>
      <p className="text-gray-600 mt-2 max-w-sm">
        Your email has been verified. Welcome to CoSplitz!
      </p>
      <p className="text-sm text-gray-500 mt-2">Redirecting to dashboard...</p>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate('/dashboard')}
        className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
      >
        Go to Dashboard Now
      </motion.button>
    </div>
  );
}