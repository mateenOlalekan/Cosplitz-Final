import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import logo from "../../../assets/newlogo.svg";
import LeftPanel from "../../../components/Home/LeftPanel";

// === ZOD VALIDATION SCHEMA ===
const schema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Must include at least one uppercase letter")
      .regex(/[0-9]/, "Must include at least one number")
      .regex(/[^A-Za-z0-9]/, "Must include at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function CreateNewPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data) => {
    // TODO: Implement password reset API call
    alert("Password reset successfully!");
    reset();
  };

  return (
    <div className="h-screen flex flex-col px-8 py-4 lg:flex-row bg-white relative  xl:flex-row  w-full overflow-hidden  p-4 rounded-2xl">
      {/* === LEFT PANEL === */}
      <LeftPanel />

      {/* === RIGHT PANEL === */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative flex w-full lg:w-1/2 flex-col justify-center items-center bg-white overflow-hidden px-4 sm:px-8 md:px-16 lg:px-20"
      >
        {/* === LOGO (TOP LEFT) === */}
        <div className="absolute top-6 left-6 sm:left-10">
          <motion.img
            src={logo}
            alt="Logo"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-28 sm:w-32"
          />
        </div>

        {/* === MAIN CONTENT === */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          className="flex flex-col justify-center items-center text-center space-y-6 h-full w-full max-w-lg"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Create New Password
          </h1>
          <p className="text-[#67707E] text-base sm:text-lg leading-relaxed">
            Please enter and confirm your new password below.
          </p>

          {/* === FORM === */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full space-y-4 mt-2"
            noValidate
          >
            {/* Password */}
            <div className="relative text-left">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password <span className="text-red-500">*</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Enter new password"
                className={`w-full px-3 py-2 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-green-500 outline-none`}
              />
              <span
                className="absolute right-3 top-9 text-gray-500 cursor-pointer"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="relative text-left">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                placeholder="Confirm new password"
                className={`w-full px-3 py-2 border ${
                  errors.confirmPassword
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-green-500 outline-none`}
              />
              <span
                className="absolute right-3 top-9 text-gray-500 cursor-pointer"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </span>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full text-lg bg-green-600 text-white rounded-2xl py-3 font-medium transition duration-300 hover:bg-green-700"
            >
              {isSubmitting ? "Saving..." : "Reset Password"}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
