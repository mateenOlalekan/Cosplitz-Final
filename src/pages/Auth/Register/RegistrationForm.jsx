// src/pages/Register/RegistrationForm.jsx  (COMPLETED)
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { PiAppleLogoBold } from 'react-icons/pi';
import { Eye, EyeOff, ChevronDown } from 'lucide-react';
import { z } from 'zod';
import { registrationSchema } from '../../../store/authStore';
import PasswordValidation from './PasswordValidation';
import { getAllCountries } from '../../../services/countryService';

/* -------------- Zod helpers -------------- */
const fieldRules = {
  firstName   : registrationSchema.shape.firstName,
  lastName    : registrationSchema.shape.lastName,
  email       : registrationSchema.shape.email,
  nationality : registrationSchema.shape.nationality,
  password    : registrationSchema.shape.password,
  agreeToTerms: registrationSchema.shape.agreeToTerms,
};

function RegistrationForm({
  formData,
  handleInputChange,
  handleFormSubmit,
  handleSocialRegister,
  loading,
  error,
}) {
  /* ---------- local state ---------- */
  const [showPassword, setShowPassword] = useState(false);
  const [countries, setCountries]       = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [open, setOpen]                 = useState(false);

  const nationalityRef = useRef(null);
  const dropdownRef    = useRef(null);

  /* ---------- country list ---------- */
  useEffect(() => {
    getAllCountries().then(setCountries).catch(console.warn);
  }, []);

  /* ---------- click-outside ---------- */
  useEffect(() => {
    const outside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && nationalityRef.current && !nationalityRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, []);

  /* ---------- Zod validation helpers ---------- */
  const validateField = (field, value) => {
    try {
      fieldRules[field].parse(value);
      return ''; // no error
    } catch (err) {
      return err.issues?.[0]?.message || 'Invalid value';
    }
  };

  const [fieldErrors, setFieldErrors] = useState({
    firstName   : '',
    lastName    : '',
    email       : '',
    nationality : '',
    password    : '',
    agreeToTerms: '',
  });

  const handleBlur = (field) => {
    const msg = validateField(field, formData[field]);
    setFieldErrors((f) => ({ ...f, [field]: msg }));
  };

  const handleChange = (field, value) => {
    handleInputChange(field, value); // parent state
    const msg = validateField(field, value);
    setFieldErrors((f) => ({ ...f, [field]: msg }));
  };

  /* ---------- nationality ---------- */
  const onNationalityChange = (val) => {
    handleChange('nationality', val);
    if (!val.trim()) { setFiltered(countries); setOpen(true); return; }
    setFiltered(countries.filter((c) => c.name.toLowerCase().includes(val.toLowerCase())));
    setOpen(true);
  };

  const selectCountry = (name) => {
    handleChange('nationality', name);
    setOpen(false);
  };

  /* ---------- submit wrapper ---------- */
  const onSubmit = (e) => {
    e.preventDefault();
    // validate all
    const full = registrationSchema.safeParse(formData);
    if (!full.success) {
      const errs = {};
      full.error.issues.forEach((i) => (errs[i.path[0]] = i.message));
      setFieldErrors(errs);
      return;
    }
    handleFormSubmit(e); // parent handler
  };

  /* ---------- UI helpers ---------- */
  const fieldClass = (err) =>
    `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-colors ${
      err ? 'border-red-300' : 'border-gray-300'
    }`;

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl text-center font-bold text-gray-900">Create Your Account</h1>
      <p className="text-gray-500 text-center text-sm mt-1 mb-4">Let's get started with real-time cost sharing.</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-3 text-center">{error}</div>
      )}

      {/* Social */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => handleSocialRegister('google')} className="flex items-center justify-center gap-3 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <FcGoogle size={20} />
          <span className="text-gray-700 text-sm">Sign Up with Google</span>
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => handleSocialRegister('apple')} className="flex items-center justify-center gap-3 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <PiAppleLogoBold size={20} />
          <span className="text-gray-700 text-sm">Sign Up with Apple</span>
        </motion.button>
      </div>

      <div className="flex items-center my-4">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-2 text-gray-500 text-sm">Or</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        {/* firstName */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">First Name *</label>
          <input
            type="text"
            value={formData.firstName}
            placeholder="Enter your first name"
            onChange={(e) => handleChange('firstName', e.target.value)}
            onBlur={() => handleBlur('firstName')}
            className={fieldClass(fieldErrors.firstName)}
            required
          />
          {fieldErrors.firstName && <p className="text-red-600 text-xs mt-1">{fieldErrors.firstName}</p>}
        </div>

        {/* lastName */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Last Name *</label>
          <input
            type="text"
            value={formData.lastName}
            placeholder="Enter your last name"
            onChange={(e) => handleChange('lastName', e.target.value)}
            onBlur={() => handleBlur('lastName')}
            className={fieldClass(fieldErrors.lastName)}
            required
          />
          {fieldErrors.lastName && <p className="text-red-600 text-xs mt-1">{fieldErrors.lastName}</p>}
        </div>

        {/* email */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Email Address *</label>
          <input
            type="email"
            value={formData.email}
            placeholder="Enter your email"
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            className={fieldClass(fieldErrors.email)}
            required
          />
          {fieldErrors.email && <p className="text-red-600 text-xs mt-1">{fieldErrors.email}</p>}
        </div>

        {/* nationality (autocomplete) */}
        <div className="relative" ref={dropdownRef}>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Nationality</label>
          <div className="relative">
            <input
              ref={nationalityRef}
              type="text"
              value={formData.nationality}
              placeholder="Select your nationality"
              onChange={(e) => onNationalityChange(e.target.value)}
              onFocus={() => setOpen(true)}
              onBlur={() => handleBlur('nationality')}
              className={fieldClass(fieldErrors.nationality) + ' pr-10'}
            />
            <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          {open && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filtered.length ? (
                filtered.map((c) => (
                  <div key={c.code} onClick={() => selectCountry(c.name)} className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm">
                    {c.name}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-500 text-sm">No countries found</div>
              )}
            </div>
          )}
          {fieldErrors.nationality && <p className="text-red-600 text-xs mt-1">{fieldErrors.nationality}</p>}
        </div>

        {/* password */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Password *</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              placeholder="Create your password"
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              className={fieldClass(fieldErrors.password) + ' pr-10'}
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-2 pr-1 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <PasswordValidation password={formData.password} />
          {fieldErrors.password && <p className="text-red-600 text-xs mt-1">{fieldErrors.password}</p>}
        </div>

        {/* agreeToTerms */}
        <div>
          <label className="flex gap-2 text-sm text-gray-600 mt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={(e) => handleChange('agreeToTerms', e.target.checked)}
              onBlur={() => handleBlur('agreeToTerms')}
              className={`rounded focus:ring-green-500 ${fieldErrors.agreeToTerms ? 'border-red-300' : ''}`}
            />
            <span>
              I agree to the{' '}
              <a href="/terms" className="text-green-600 hover:underline font-medium">
                Terms
              </a>
              ,{' '}
              <a href="/privacy" className="text-green-600 hover:underline font-medium">
                Privacy
              </a>{' '}
              &{' '}
              <a href="/fees" className="text-green-600 hover:underline font-medium">
                Fees
              </a>
              .
            </span>
          </label>
          {fieldErrors.agreeToTerms && <p className="text-red-600 text-xs mt-1">{fieldErrors.agreeToTerms}</p>}
        </div>

        {/* submit */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className={`w-full bg-green-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 ${
            loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-green-700'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating Account...
            </span>
          ) : (
            'Create Account'
          )}
        </motion.button>

        <p className="text-center text-sm text-gray-600 mt-3">
          Already have an account?{' '}
          <Link to="/login" className="text-green-600 hover:underline font-medium">
            Log In
          </Link>
        </p>
      </form>
    </div>
  );
}

export default RegistrationForm;