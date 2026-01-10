import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { PiAppleLogoBold } from "react-icons/pi";
import { Eye, EyeOff } from "lucide-react";
import PasswordValidation from "./PasswordValidation";
import { z } from "zod";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  nationality: z.string().optional(),
  password: z.string().min(8).regex(/[A-Z]/, "Uppercase required").regex(/\d/, "Number required"),
  agreeToTerms: z.boolean().refine((v) => v, "You must agree to the terms"),
});

function RegistrationForm({ formData, handleInputChange, handleFormSubmit, handleSocialRegister, loading, error }) {
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});

  const submit = (e) => {
    e.preventDefault();
    setErrors({});
    try {
      schema.parse(formData);
      handleFormSubmit(e);
    } catch (err) {
      const obj = {};
      err.errors.forEach((v) => (obj[v.path[0]] = v.message));
      setErrors(obj);
    }
  };

  const fieldErr = (k) => errors[k];

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl text-center font-bold text-gray-900">Create Your Account</h1>
      <p className="text-gray-500 text-center text-sm mt-1 mb-4">Let's get started with real-time cost sharing.</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-3 text-center">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => handleSocialRegister("google")} className="flex items-center justify-center gap-3 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <FcGoogle size={20} />
          <span className="text-gray-700 text-sm">Sign Up with Google</span>
        </motion.button>

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => handleSocialRegister("apple")} className="flex items-center justify-center gap-3 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <PiAppleLogoBold size={20} />
          <span className="text-gray-700 text-sm">Sign Up with Apple</span>
        </motion.button>
      </div>

      <div className="flex items-center my-4">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-2 text-gray-500 text-sm">Or</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <form onSubmit={submit} className="space-y-3">
        {[
          { k: "firstName", l: "First Name", t: "text" },
          { k: "lastName", l: "Last Name", t: "text" },
          { k: "email", l: "Email Address", t: "email" },
          { k: "nationality", l: "Nationality", t: "text" },
        ].map((f) => (
          <div key={f.k}>
            <label className="text-sm font-medium text-gray-700 mb-1 block">{f.l} *</label>
            <input
              type={f.t}
              value={formData[f.k]}
              placeholder={`Enter your ${f.l.toLowerCase()}`}
              onChange={(e) => handleInputChange(f.k, e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-colors ${fieldErr(f.k) ? "border-red-300" : "border-gray-300"}`}
              required
            />
            {fieldErr(f.k) && <p className="text-red-500 text-xs mt-1">{fieldErr(f.k)}</p>}
          </div>
        ))}

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Password *</label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={formData.password}
              placeholder="Create your password"
              onChange={(e) => handleInputChange("password", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-colors pr-10 ${fieldErr("password") ? "border-red-300" : "border-gray-300"}`}
              required
            />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute inset-y-0 right-2 pr-1 flex items-center text-gray-400 hover:text-gray-600">
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {fieldErr("password") && <p className="text-red-500 text-xs mt-1">{fieldErr("password")}</p>}
          <PasswordValidation password={formData.password} />
        </div>

        <label className="flex gap-2 text-sm text-gray-600 mt-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={(e) => handleInputChange("agreeToTerms", e.target.checked)}
          />
          <span>
            I agree to the <a href="/terms" className="text-green-600 hover:underline font-medium">Terms</a>,{" "}
            <a href="/privacy" className="text-green-600 hover:underline font-medium">Privacy</a> &{" "}
            <a href="/fees" className="text-green-600 hover:underline font-medium">Fees</a>.
          </span>
        </label>
        {fieldErr("agreeToTerms") && <p className="text-red-500 text-xs">{fieldErr("agreeToTerms")}</p>}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className={`w-full bg-green-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 ${
            loading ? "opacity-60 cursor-not-allowed" : "hover:bg-green-700"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating Account...
            </span>
          ) : (
            "Create Account"
          )}
        </motion.button>

        <p className="text-center text-sm text-gray-600 mt-3">
          Already have an account?{" "}
          <Link to="/login" className="text-green-600 hover:underline font-medium">
            Log In
          </Link>
        </p>
      </form>
    </div>
  );
}

export default RegistrationForm;