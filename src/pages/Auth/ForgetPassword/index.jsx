import { motion } from "framer-motion";
import { useState } from "react";
import loginlogo from "../../../assets/loginmain.jpg";
import logo from "../../../assets/newlogo.svg";
import { useNavigate } from "react-router-dom";
import LeftPanel from "../../../components/Home/LeftPanel";

export default function PasswordResetSuccess() {
  const navigate = useNavigate();

  // Added missing field + state
  const [formData, setFormData] = useState({
    email: "",
  });

  const field = "email";

  const handleGoToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="flex bg-[#F7F5F9] w-full h-screen justify-center overflow-hidden md:px-6 md:py-4 rounded-2xl">
      <div className="flex max-w-screen-2xl w-full h-full rounded-xl overflow-hidden">
        <LeftPanel/>
      {/* === RIGHT PANEL === */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex w-full h-screen lg:w-1/2 flex-col justify-between items-center bg-white overflow-y-auto px-4 sm:px-6 md:px-8 lg:px-10 py-8"
      >
        {/* === LOGO === */}
        <div className="w-full flex justify-start mb-6">
          <motion.img
            src={logo}
            alt="Logo"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-32 sm:w-28"
          />
        </div>



        {/* === FORM CONTENT === */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          className="flex flex-col justify-center items-center text-center space-y-8 w-full max-w-3xl"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5px font-semibold text-gray-900">
            Forgot your password?
          </h1>

          <p className="text-[#67707E] text-center text-base sm:text-lg leading-relaxed max-w-lg">
            Please enter your recovery email / phone number and follow the steps
            to complete.
          </p>

          {/* === INPUT FIELD === */}
          <div className="flex flex-col w-full text-start  max-w-lg">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              name="email"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          {/* === REMEMBER PASSWORD === */}
          <div className="flex flex-col w-full max-w-lg text-left">
            <div className="text-[#67707E] text-sm">
              Remember password?{" "}
              <span
                className="text-[#1F8225] font-medium cursor-pointer"
                onClick={handleGoToLogin}
              >
                Log In
              </span>
            </div>
          {/* === BUTTON === */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="mt-4 w-full max-w-lg border-2 border-[#1F8225]  text-[#1F8225] rounded-2xl py-3 font-medium  transition duration-300"
          >
            Send Code
          </motion.button>
          
          </div>


        </motion.div>

        <p className="text-gray-400 text-xs mt-6"></p>
      </motion.div>
      </div>
    </div>
  );
}
