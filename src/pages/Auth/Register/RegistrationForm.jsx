import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { PiAppleLogoBold } from 'react-icons/pi';
import { Eye, EyeOff, ChevronDown } from 'lucide-react';
import PasswordValidation from './PasswordValidation';
import { getAllCountries } from '../../../services/countryService';

function RegistrationForm({ formData, handleInputChange, handleFormSubmit, handleSocialRegister, loading, error, validationErrors }) {
  const [showPassword, setShowPassword] = useState(false);
  const [countries, setCountries] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [open, setOpen] = useState(false);
  const nationalityRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    getAllCountries().then(setCountries).catch(console.warn);
  }, []);

  useEffect(() => {
    const outside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && nationalityRef.current && !nationalityRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, []);

  const onNationalityChange = (val) => {
    handleInputChange('nationality', val);
    if (!val.trim()) { setFiltered(countries); setOpen(true); return; }
    setFiltered(countries.filter(c => c.name.toLowerCase().includes(val.toLowerCase())));
    setOpen(true);
  };

  const selectCountry = (name) => {
    handleInputChange('nationality', name);
    setOpen(false);
  };

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl text-center font-bold text-gray-900">Create Your Account</h1>
      <p className="text-gray-500 text-center text-sm mt-1 mb-4">Let's get started with real-time cost sharing.</p>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-3 text-center">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => handleSocialRegister('google')} className="flex items-center justify-center gap-3 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"><FcGoogle size={20} /><span className="text-gray-700 text-sm">Sign Up with Google</span></motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => handleSocialRegister('apple')} className="flex items-center justify-center gap-3 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"><PiAppleLogoBold size={20} /><span className="text-gray-700 text-sm">Sign Up with Apple</span></motion.button>
      </div>

      <div className="flex items-center my-4"><div className="flex-grow border-t border-gray-300"></div><span className="mx-2 text-gray-500 text-sm">Or</span><div className="flex-grow border-t border-gray-300"></div></div>

      <form onSubmit={handleFormSubmit} className="space-y-3">
        {[
          { key: 'firstName', label: 'First Name', type: 'text' },
          { key: 'lastName', label: 'Last Name', type: 'text' },
          { key: 'email', label: 'Email Address', type: 'email' },
        ].map(f => (
          <div key={f.key}>
            <label className="text-sm font-medium text-gray-700 mb-1 block">{f.label} *</label>
            <input type={f.type} value={formData[f.key]} placeholder={`Enter your ${f.label.toLowerCase()}`} onChange={e => handleInputChange(f.key, e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-colors ${validationErrors[f.key] ? 'border-red-300' : 'border-gray-300'}`} required />
            {validationErrors[f.key] && <p className="text-red-600 text-xs mt-1">{validationErrors[f.key]}</p>}
          </div>
        ))}

        {/* nationality */}
        <div className="relative" ref={dropdownRef}>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Nationality</label>
          <div className="relative">
            <input ref={nationalityRef} type="text" value={formData.nationality} placeholder="Select your nationality" onChange={e => onNationalityChange(e.target.value)} onFocus={() => setOpen(true)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-colors pr-10" />
            <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          {open && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filtered.length ? filtered.map(c => <div key={c.code} onClick={() => selectCountry(c.name)} className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm">{c.name}</div>)
                : <div className="px-3 py-2 text-gray-500 text-sm">No countries found</div>}
            </div>
          )}
        </div>

        {/* password */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Password *</label>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} value={formData.password} placeholder="Create your password" onChange={e => handleInputChange('password', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors pr-10 ${validationErrors.password ? 'border-red-300' : 'border-gray-300'}`} required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-2 pr-1 flex items-center text-gray-400 hover:text-gray-600 transition-colors">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </div>
          <PasswordValidation password={formData.password} />
          {validationErrors.password && <p className="text-red-600 text-xs mt-1">{validationErrors.password}</p>}
        </div>

        {/* terms */}
        <div>
          <label className="flex gap-2 text-sm text-gray-600 mt-2 cursor-pointer">
            <input type="checkbox" checked={formData.agreeToTerms} onChange={e => handleInputChange('agreeToTerms', e.target.checked)} className={`rounded focus:ring-green-500 ${validationErrors.agreeToTerms ? 'border-red-300' : ''}`} />
            <span>I agree to the <a href="/terms" className="text-green-600 hover:underline font-medium">Terms</a>, <a href="/privacy" className="text-green-600 hover:underline font-medium">Privacy</a> & <a href="/fees" className="text-green-600 hover:underline font-medium">Fees</a>.</span>
          </label>
          {validationErrors.agreeToTerms && <p className="text-red-600 text-xs mt-1">{validationErrors.agreeToTerms}</p>}
        </div>

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className={`w-full bg-green-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-green-700'}`}>
          {loading ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Creating Account...</span> : 'Create Account'}
        </motion.button>

        <p className="text-center text-sm text-gray-600 mt-3">Already have an account? <Link to="/login" className="text-green-600 hover:underline font-medium">Log In</Link></p>
      </form>
    </div>
  );
}

export default RegistrationForm;