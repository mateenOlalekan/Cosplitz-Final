import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";
import { setJustRegistered, setOnboardingComplete } from "../../services/endpoints/auth";
import { useQueryClient } from "@tanstack/react-query";
import { authKeys } from "../../services/queries/auth";

export default function KYCConfirmation({ prev }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleComplete = () => {
    setIsNavigating(true);
    
    // IMPORTANT: Clear the justRegistered flag and mark onboarding as complete
    // This ensures that when user returns to the app, they go directly to dashboard
    setJustRegistered(false);
    setOnboardingComplete(true);
    
    // Update the query cache to reflect these changes
    queryClient.setQueryData(authKeys.justRegistered(), false);
    queryClient.setQueryData(authKeys.onboardingComplete(), true);
    
    console.log('Onboarding completed - flags cleared, redirecting to dashboard');
    
    // Optional: You can also send KYC completion status to backend here
    // await submitKYCCompletion();
    
    // Navigate to main dashboard
    setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="mb-6"
      >
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-16 h-16 text-green-600" />
        </div>
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-gray-900 mb-3 text-center"
      >
        Verification Complete!
      </motion.h2>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-gray-600 text-center max-w-md mb-8"
      >
        Thank you for completing your identity verification. Your account is now fully set up and ready to use.
      </motion.p>

      {/* Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-md space-y-3 mb-8"
      >
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Identity Verified</h3>
              <p className="text-xs text-gray-600 mt-1">
                Your identity has been successfully verified and your account is now active.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Full Access Granted</h3>
              <p className="text-xs text-gray-600 mt-1">
                You now have access to all features including creating splits, payments, and more.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={prev}
          disabled={isNavigating}
          className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: isNavigating ? 1 : 1.02 }}
          whileTap={{ scale: isNavigating ? 1 : 0.98 }}
          onClick={handleComplete}
          disabled={isNavigating}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isNavigating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            <>
              <span>Go to Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </div>

      {/* Additional Info */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-xs text-gray-500 text-center mt-6"
      >
        You can update your verification details anytime in Settings
      </motion.p>
    </div>
  );
}