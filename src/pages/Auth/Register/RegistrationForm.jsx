// src/pages/Register/RegistrationForm.jsx
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { PiAppleLogoBold } from 'react-icons/pi';
import { Eye, EyeOff, ChevronDown } from 'lucide-react';
import { registrationSchema } from '../../../schemas/authSchemas';
import PasswordValidation from './PasswordValidation';
import { getAllCountries } from '../../../services/countryService';

export default function RegistrationForm({ onSubmit, loading }) {
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    nationality: '',
    password: '',
    agreeToTerms: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [countries, setCountries] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [open, setOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nationalityRef = useRef(null);
  const dropdownRef = useRef(null);

  // Load countries
  useEffect(() => {
    getAllCountries().then(setCountries).catch(console.warn);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        nationalityRef.current &&
        !nationalityRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Validation
  const validateField = (field, value) => {
    try {
      registrationSchema.shape[field].parse(value);
      return '';
    } catch (err) {
      return err.issues?.[0]?.message || 'Invalid value';
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    const errorMsg = validateField(field, value);
    setFieldErrors(prev => ({ ...prev, [field]: errorMsg }));
    setSubmitError('');
  };

  const handleBlur = (field) => {
    const errorMsg = validateField(field, formData[field]);
    setFieldErrors(prev => ({ ...prev, [field]: errorMsg }));
  };

  // Nationality dropdown
  const handleNationalityChange = (value) => {
    handleChange('nationality', value);
    if (!value.trim()) {
      setFiltered(countries);
      setOpen(true);
      return;
    }
    setFiltered(countries.filter(c => 
      c.name.toLowerCase().includes(value.toLowerCase())
    ));
    setOpen(true);
  };

  const selectCountry = (name) => {
    handleChange('nationality', name);
    setOpen(false);
  };

  // Submit - FIXED: Convert to snake_case for API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    const result = registrationSchema.safeParse(formData);

    if (!result.success) {
      const errors = {};
      result.error.issues.forEach(issue => {
        errors[issue.path[0]] = issue.message;
      });
      setFieldErrors(errors);
      setIsSubmitting(false);
      return;
    }

    // 🟢 FIX: Convert camelCase to snake_case for API
    const apiFormData = {
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim(),
      email: formData.email.toLowerCase().trim(),
      password: formData.password,
      nationality: formData.nationality.trim(),
    };

    const res = await onSubmit(apiFormData);

    if (!res.success) {
      setSubmitError(res.error || 'Registration failed');
    }

    setIsSubmitting(false);
  };

  const inputClass = (hasError) =>
    `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-colors ${
      hasError ? 'border-red-300' : 'border-gray-300 focus:border-green-500'
    }`;

  const isFormValid = !Object.values(fieldErrors).some(error => error) && 
                     formData.agreeToTerms && 
                     formData.firstName && 
                     formData.lastName && 
                     formData.email && 
                     formData.password;

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl text-center font-bold text-gray-900">
        Create Your Account
      </h1>
      <p className="text-gray-500 text-center text-sm mt-1 mb-4">
        Let's get started with real-time cost sharing.
      </p>

      {/* Social Login */}
      <div className="grid grid-cols-1 gap-2 mb-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => alert('Google signup coming soon!')}
          className="flex items-center justify-center gap-3 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <FcGoogle size={20} />
          <span className="text-gray-700 text-sm">Sign Up with Google</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => alert('Apple signup coming soon!')}
          className="flex items-center justify-center gap-3 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <PiAppleLogoBold size={20} />
          <span className="text-gray-700 text-sm">Sign Up with Apple</span>
        </motion.button>
      </div>

      <div className="flex items-center my-4">
        <div className="flex-grow border-t border-gray-300" />
        <span className="mx-2 text-gray-500 text-sm">Or</span>
        <div className="flex-grow border-t border-gray-300" />
      </div>

      {/* Submit Error */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* First Name */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            First Name *
          </label>
          <input
            type="text"
            value={formData.firstName}
            placeholder="Enter your first name"
            onChange={(e) => handleChange('firstName', e.target.value)}
            onBlur={() => handleBlur('firstName')}
            className={inputClass(fieldErrors.firstName)}
            required
          />
          {fieldErrors.firstName && (
            <p className="text-red-600 text-xs mt-1">{fieldErrors.firstName}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Last Name *
          </label>
          <input
            type="text"
            value={formData.lastName}
            placeholder="Enter your last name"
            onChange={(e) => handleChange('lastName', e.target.value)}
            onBlur={() => handleBlur('lastName')}
            className={inputClass(fieldErrors.lastName)}
            required
          />
          {fieldErrors.lastName && (
            <p className="text-red-600 text-xs mt-1">{fieldErrors.lastName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Email Address *
          </label>
          <input
            type="email"
            value={formData.email}
            placeholder="Enter your email"
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            className={inputClass(fieldErrors.email)}
            required
          />
          {fieldErrors.email && (
            <p className="text-red-600 text-xs mt-1">{fieldErrors.email}</p>
          )}
        </div>

        {/* Nationality Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Nationality
          </label>
          <div className="relative">
            <input
              ref={nationalityRef}
              type="text"
              value={formData.nationality}
              placeholder="Select your nationality"
              onChange={(e) => handleNationalityChange(e.target.value)}
              onFocus={() => {
                setFiltered(countries);
                setOpen(true);
              }}
              onBlur={() => handleBlur('nationality')}
              className={`${inputClass(fieldErrors.nationality)} pr-10`}
            />
            <ChevronDown 
              size={18} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
            />
          </div>
          
          {open && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filtered.length > 0 ? (
                filtered.map((c) => (
                  <div 
                    key={c.code} 
                    onClick={() => selectCountry(c.name)} 
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  >
                    {c.name}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  No countries found
                </div>
              )}
            </div>
          )}
          
          {fieldErrors.nationality && (
            <p className="text-red-600 text-xs mt-1">{fieldErrors.nationality}</p>
          )}
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              placeholder="Create your password"
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              className={`${inputClass(fieldErrors.password)} pr-10`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-2 pr-1 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <PasswordValidation password={formData.password} />
          {fieldErrors.password && (
            <p className="text-red-600 text-xs mt-1">{fieldErrors.password}</p>
          )}
        </div>

        {/* Terms */}
        <div>
          <label className="flex gap-2 text-sm text-gray-600 mt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={(e) => handleChange('agreeToTerms', e.target.checked)}
              className="rounded focus:ring-green-500"
            />
            <span>
              I agree to the{' '}
              <a href="/terms" className="text-green-600 hover:underline font-medium">
                Terms
              </a>
              ,{' '}
              <a href="/privacy" className="text-green-600 hover:underline font-medium">
                Privacy
              </a>
              {' & '}
              <a href="/fees" className="text-green-600 hover:underline font-medium">
                Fees
              </a>
              .
            </span>
          </label>
          {fieldErrors.agreeToTerms && (
            <p className="text-red-600 text-xs mt-1">{fieldErrors.agreeToTerms}</p>
          )}
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading || isSubmitting || !isFormValid}
          className={`w-full bg-green-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 ${
            loading || isSubmitting || !isFormValid 
              ? 'opacity-60 cursor-not-allowed' 
              : 'hover:bg-green-700'
          }`}
        >
          {loading || isSubmitting ? (
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