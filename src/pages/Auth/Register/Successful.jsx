// import { motion } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';
// import Checknow from '../../../assets/Check.svg';

// export default function Successful() {
//   const navigate = useNavigate();
//   return (
//     <div className="flex flex-col items-center text-center py-6">
//       <img src={Checknow} alt="Success" className="w-24 h-24 mb-4" />
//       <h2 className="text-2xl font-bold text-gray-800">Email Verified Successfully!</h2>
//       <p className="text-gray-600 mt-2 max-w-sm">Your email has been verified. Let's set up your profile!</p>
//       <motion.button
//         whileHover={{ scale: 1.03 }}
//         whileTap={{ scale: 0.97 }}
//         onClick={() => navigate('/dashboard')}
//         className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
//       >
//         Continue to Onboarding
//       </motion.button>
//     </div>
//   );
// }

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useUser } from '../../../services/queries/auth';
import Checknow from '../../../assets/Check.svg';

export default function Successful() {
  const navigate = useNavigate();
  const { data: user, isLoading, isError } = useUser();

  // Auto-redirect when user data is confirmed
  useEffect(() => {
    if (user && !isLoading && !isError) {
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, isLoading, isError, navigate]);

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
        {isLoading ? 'Loading...' : 'Continue to Dashboard'}
      </motion.button>
    </div>
  );
}