import { motion } from 'framer-motion'
import React from 'react'
import loginlogo from '../../assets/loginmain.jpg';

function LeftPanel() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-gray-50"
      >
        <img
          src={loginlogo}
          alt="Illustration"
          className="w-full h-full object-cover rounded-2xl"
        />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="absolute bottom-10 mx-6 bg-white/40 backdrop-blur-xl rounded-2xl p-6 max-w-lg shadow-lg text-center"
        >
          <h1 className="text-4xl font-semibold text-[#2D0D23] mb-2">
            Share Expenses & Resources in Real Time
          </h1>
          <p className="text-lg text-[#4B4B4B] leading-relaxed">
            Connect with students, travelers, and locals to effortlessly manage
            costs and resources — anonymously and securely.
          </p>
        </motion.div>
      </motion.div>    
    </>
  )
}

export default LeftPanel