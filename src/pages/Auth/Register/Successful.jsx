import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Checknow from '../../../assets/Check.svg';
import { CheckCircle } from 'lucide-react';

export default function Successful() {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleContinue = () => {
    console.log('User clicked Continue Setup - navigating to post-onboarding');
    setIsNavigating(true);
    // Navigate to post-onboarding when user clicks the button
    // The justRegistered flag is still true at this point
    navigate('/dashboard/post-onboarding', { replace: true });
  };

  return (
    <div className="flex flex-col items-center text-center py-8">
      {/* Success Icon */}
      <div className="mb-6">
        <img src={Checknow} alt="Success" className="w-24 h-24" />
      </div>

      {/* Success Message */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Email Verified Successfully!
        </h2>
        <p className="text-gray-600 max-w-md">
          Your email has been verified. Let's complete your profile setup to start sharing expenses!
        </p>
      </div>

      {/* What's Next Section */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 max-w-md">
        <h3 className="text-sm font-semibold text-green-800 mb-2 flex items-center justify-center gap-2">
          <CheckCircle size={16} />
          Next Steps
        </h3>
        <ul className="text-sm text-green-700 space-y-1 text-left">
          <li>• Complete your profile information</li>
          <li>• Verify your identity (KYC)</li>
          <li>• Start connecting with others</li>
        </ul>
      </div>

      {/* Continue Button */}
      <motion.button
        whileHover={{ scale: isNavigating ? 1 : 1.03 }}
        whileTap={{ scale: isNavigating ? 1 : 0.97 }}
        onClick={handleContinue}
        disabled={isNavigating}
        className={`w-full max-w-md text-white py-3 rounded-lg font-semibold transition-all shadow-md ${
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

      {/* Additional Info */}
      <p className="text-xs text-gray-500 mt-4 max-w-md">
        This will only take a few minutes to complete
      </p>
    </div>
  );
}