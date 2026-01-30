import { useState } from "react";
import { MapPin, Navigation, Home, AlertCircle } from "lucide-react";

function ProofOfAddress({ next, prev }) {
  const [formData, setFormData] = useState({
    city: '',
    district: '',
    fullAddress: ''
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
    if (!value.trim()) {
      const fieldName = field === 'fullAddress' ? 'Full address' : field.charAt(0).toUpperCase() + field.slice(1);
      error = `${fieldName} is required`;
    }
    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  const validateForm = () => {
    const fields = ['city', 'district', 'fullAddress'];
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
      city: true,
      district: true,
      fullAddress: true
    });

    if (validateForm()) {
      localStorage.setItem('kycAddressInfo', JSON.stringify(formData));
      next();
    }
  };

  const InputField = ({ label, name, icon: Icon, placeholder, multiline = false }) => (
    <div className="flex flex-col gap-1 sm:gap-1.5">
      <label htmlFor={name} className="font-medium text-[11px] sm:text-xs text-gray-700 flex items-center gap-0.5">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <div className="absolute left-2 sm:left-2.5 top-2.5 sm:top-3 text-gray-400 pointer-events-none">
          <Icon size={14} className="sm:w-4 sm:h-4" />
        </div>
        {multiline ? (
          <textarea
            id={name}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            onBlur={() => handleBlur(name)}
            rows="3"
            autoComplete="street-address"
            className="w-full border border-gray-300 py-2 sm:py-2.5 px-2 pl-7 sm:pl-9 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-400 text-xs sm:text-sm resize-none bg-white"
            placeholder={placeholder}
          />
        ) : (
          <input
            id={name}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            onBlur={() => handleBlur(name)}
            autoComplete={name === 'city' ? 'address-level2' : 'off'}
            className="w-full border border-gray-300 py-2 sm:py-2.5 px-2 pl-7 sm:pl-9 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-400 text-xs sm:text-sm bg-white"
            placeholder={placeholder}
          />
        )}
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
            <MapPin className="text-green-600" size={18} />
            Proof of Address
          </h2>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
            Please provide your current residential address
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <InputField
              label="City"
              name="city"
              icon={Navigation}
              placeholder="New York"
            />
            <InputField
              label="District"
              name="district"
              icon={Navigation}
              placeholder="Manhattan"
            />
          </div>

          <InputField
            label="Full Address"
            name="fullAddress"
            icon={Home}
            placeholder="123 Main Street, Apartment 4B"
            multiline={true}
          />

          {/* Important Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-md p-2.5 sm:p-3 mt-1">
            <div className="flex items-start gap-2">
              <div className="bg-amber-100 p-1.5 rounded-md flex-shrink-0">
                <AlertCircle className="text-amber-600" size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[10px] sm:text-xs font-semibold text-amber-800 mb-1">Important Notice</h4>
                <p className="text-[9px] sm:text-[10px] text-amber-700 leading-relaxed">
                  Ensure that your address exactly matches the one on your government-issued ID or passport. 
                  Inconsistencies may delay verification by 5-7 business days.
                </p>
              </div>
            </div>
          </div>

          {/* Address Example */}
          <div className="bg-gray-50 border border-gray-200 rounded-md p-2.5 sm:p-3">
            <h5 className="text-[10px] sm:text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              <MapPin size={12} className="text-gray-500 flex-shrink-0" />
              Address Format Example
            </h5>
            <div className="text-[9px] sm:text-[10px] text-gray-600 bg-white p-2 sm:p-2.5 rounded border border-gray-100">
              <p className="font-medium">Correct:</p>
              <p className="text-gray-500 break-words">123 Main Street, Apt 4B, Manhattan, New York, NY 10001</p>
              <p className="font-medium mt-1.5">Avoid:</p>
              <p className="text-gray-500">Near the park, blue house (too vague)</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-3 mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={prev}
              className="w-full sm:w-auto px-5 sm:px-6 py-2 sm:py-2.5 border border-gray-300 text-gray-700 text-xs sm:text-sm font-medium rounded-md hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 flex items-center justify-center gap-1.5 hover:border-gray-400"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

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

export default ProofOfAddress;