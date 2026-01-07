import { motion } from "framer-motion";
import loginlogo from "../../../assets/loginmain.jpg";
import logo from "../../../assets/newlogo.svg";
import { useNavigate } from "react-router-dom";

export default function PasswordResetSuccess() {
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-white overflow-hidden">

      {/* === LEFT PANEL (Hidden on small screens) === */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="
          hidden 
          lg:flex 
          lg:w-1/2 
          relative 
          items-center 
          justify-center 
          bg-gray-50
        "
      >
        <img
          src={loginlogo}
          alt="Illustration"
          className="w-full h-full object-cover"
        />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="
            absolute 
            bottom-6 sm:bottom-10 
            mx-4 sm:mx-6 
            bg-white/40 
            backdrop-blur-xl 
            rounded-2xl 
            p-4 sm:p-6 
            max-w-md lg:max-w-lg 
            shadow-lg 
            text-center
          "
        >
          <h1 className="text-2xl sm:text-3xl xl:text-4xl font-semibold text-[#2D0D23] mb-2">
            Share Expenses & Resources in Real Time
          </h1>

          <p className="text-sm sm:text-base xl:text-lg text-[#4B4B4B] leading-relaxed">
            Connect with students, travelers, and locals to manage costs and
            resources — anonymously and securely.
          </p>
        </motion.div>
      </motion.div>

      {/* === RIGHT PANEL === */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex w-full lg:w-1/2 flex-col bg-white px-4 sm:px-8 md:px-14 lg:px-20 py-12 min-h-screen relative">
        {/* LOGO */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-8">
          <motion.img
            src={logo}
            alt="Logo"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-20 sm:w-24 md:w-28 lg:w-32"
          />
        </div>

        {/* CENTER CONTENT */}
        <div className="flex flex-1 items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
            className="
              flex 
              flex-col 
              items-center 
              justify-center 
              text-center
              space-y-6 
              w-full 
              max-w-sm 
              sm:max-w-md 
              md:max-w-lg
              px-2 sm:px-0
            "
          >

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
              Congratulation
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-[#67707E] leading-relaxed px-2">
              Your password has been successfully changed. Please log in again 
              using your new credentials.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoToLogin}
              className="
                w-full 
                max-w-lg 
                text-sm sm:text-base md:text-lg 
                bg-green-600 
                text-white 
                rounded-2xl 
                py-3 
                mt-20
                font-medium 
                shadow-md 
                transition 
                duration-300
              "
            >
              Login
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
