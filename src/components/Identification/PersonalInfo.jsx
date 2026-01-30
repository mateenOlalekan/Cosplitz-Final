import { useState } from "react";
import { User, Mail, Globe, AlertCircle } from "lucide-react";

function PersonalInfoPage({ next }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    nationality: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validateField = (field, value) => {
    let error = '';
    switch (field) {
      case 'firstName':
      case 'lastName':
      case 'nationality':
        if (!value.trim()) error = `${field.replace(/([A-Z])/g, ' $1').trim()} is required`;
        break;
      case 'email':
        if (!value.trim()) {
          error = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = "Please enter a valid email address";
        }
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  const validateForm = () => {
    const fields = ['firstName', 'lastName', 'email', 'nationality'];
    let isValid = true;

    fields.forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });

    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      nationality: true
    });

    if (validateForm()) {
      localStorage.setItem('kycPersonalInfo', JSON.stringify(formData));
      next();
    }
  };

  const InputField = ({ label, name, type = 'text', icon: Icon, placeholder }) => (
    <div className="flex flex-col gap-1 sm:gap-1.5">
      <label htmlFor={name} className="font-medium text-[11px] sm:text-xs text-gray-700 flex items-center gap-0.5">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <div className="absolute left-2 sm:left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
          <Icon size={14} className="sm:w-4 sm:h-4" />
        </div>
        <input
          id={name}
          name={name}
          type={type}
          value={formData[name]}
          onChange={handleChange}
          onBlur={() => handleBlur(name)}
          autoComplete={name === 'email' ? 'email' : name === 'firstName' ? 'given-name' : name === 'lastName' ? 'family-name' : 'off'}
          className="w-full border border-gray-300 py-2 sm:py-2.5 px-2 pl-7 sm:pl-9 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-400 text-xs sm:text-sm bg-white"
          placeholder={placeholder}
        />
      </div>
      {touched[name] && errors[name] && (
        <div className="flex items-center gap-0.5 text-red-500 text-[10px] sm:text-xs mt-0.5">
          <AlertCircle size={10} className="flex-shrink-0" />
          <span>{errors[name]}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full min-h-screen flex justify-center items-start px-3 sm:px-4 py-4 sm:py-6">
      <div className="w-full max-w-lg flex flex-col">
        <div className="mb-4 sm:mb-5">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 flex items-center gap-1.5 sm:gap-2">
            <User className="text-green-600" size={18} />
            Personal Information
          </h2>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
            Please provide your personal details for verification
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <InputField
              label="First Name"
              name="firstName"
              icon={User}
              placeholder="John"
            />
            <InputField
              label="Last Name"
              name="lastName"
              icon={User}
              placeholder="Doe"
            />
          </div>

          <InputField
            label="Email Address"
            name="email"
            type="email"
            icon={Mail}
            placeholder="john.doe@example.com"
          />

          <InputField
            label="Nationality"
            name="nationality"
            icon={Globe}
            placeholder="United States"
          />

          {/* Validation Tips */}
          <div className="bg-blue-50 border border-blue-100 rounded-md p-2.5 sm:p-3 mt-1">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-blue-600 mt-0.5 flex-shrink-0" size={14} />
              <div className="flex-1 min-w-0">
                <h4 className="text-[10px] sm:text-xs font-medium text-blue-800 mb-1">Tips for accurate information</h4>
                <ul className="text-[9px] sm:text-[10px] text-blue-700 space-y-0.5">
                  <li>• Use your legal name as it appears on official documents</li>
                  <li>• Provide an email you regularly check for verification updates</li>
                  <li>• Enter your current nationality accurately</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4 sm:mt-5">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs sm:text-sm font-medium rounded-md hover:from-green-700 hover:to-emerald-700 active:from-green-800 active:to-emerald-800 transition-all duration-200 shadow-sm hover:shadow-md transform active:scale-95 flex items-center justify-center gap-2"
            >
              Continue
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PersonalInfoPage;