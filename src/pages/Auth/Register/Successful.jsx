import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Checknow from '../../../assets/Check.svg';

export default function Successful() {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleContinue = () => {
    setIsNavigating(true);
    // Navigate immediately to post-onboarding (no timeout)
    navigate('/dashboard/post-onboarding');
  };

  return (
    <div className="flex flex-col items-center text-center py-6">
      <img src={Checknow} alt="Success" className="w-24 h-24 mb-4" />
      <h2 className="text-2xl font-bold text-gray-800">Email Verified Successfully!</h2>
      <p className="text-gray-600 mt-2 max-w-sm">
        Your email has been verified. Let's set up your profile and start sharing expenses!
      </p>
      <motion.button
        whileHover={{ scale: isNavigating ? 1 : 1.03 }}
        whileTap={{ scale: isNavigating ? 1 : 0.97 }}
        onClick={handleContinue}
        disabled={isNavigating}
        className={`w-full mt-6 text-white py-3 rounded-lg font-semibold transition-all ${
          isNavigating 
            ? 'bg-green-400 cursor-not-allowed' 
            : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {isNavigating ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Loading...
          </span>
        ) : (
          'Continue Setup'
        )}
      </motion.button>
    </div>
  );
}