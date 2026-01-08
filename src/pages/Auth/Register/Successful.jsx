// Successful.jsx - REFACTORED
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import Checknow from "../../../assets/Check.svg";

function Successful() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // Redirect to dashboard if already authenticated
  const handleContinue = () => {
    if (isAuthenticated()) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="flex flex-col items-center text-center py-6">
      <img src={Checknow} alt="Success" className="w-24 h-24 mb-4" />

      <h2 className="text-2xl font-bold text-gray-800">
        Registration Successful!
      </h2>

      <p className="text-gray-600 mt-2 max-w-sm">
        Your account has been created successfully. Welcome to Cosplitz!
      </p>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleContinue}
        className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
      >
        Continue to Dashboard
      </motion.button>
    </div>
  );
}

export default Successful;