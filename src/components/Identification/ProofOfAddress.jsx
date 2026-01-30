import React, { useState } from "react";
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
    <div className="flex flex-col gap-2">
      <label className="font-medium text-sm text-gray-700 flex items-center gap-1">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative group">
        <div className="absolute left-3 top-3 text-gray-400 group-focus-within:text-green-600 transition-colors">
          <Icon size={18} />
        </div>
        {multiline ? (
          <textarea
            name={name}
            value={formData[name]}
            onChange={handleChange}
            onBlur={() => handleBlur(name)}
            rows="3"
            className="w-full border border-gray-300 p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 text-sm resize-none"
            placeholder={placeholder}
          />
        ) : (
          <input
            name={name}
            value={formData[name]}
            onChange={handleChange}
            onBlur={() => handleBlur(name)}
            className="w-full border border-gray-300 p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 text-sm"
            placeholder={placeholder}
          />
        )}
      </div>
      {touched[name] && errors[name] && (
        <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
          <AlertCircle size={12} />
          <span>{errors[name]}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full flex justify-center items-center">
      <div className="w-full max-w-lg flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <MapPin className="text-green-600" size={20} />
            Proof of Address
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Please provide your current residential address
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-2">
            <div className="flex items-start gap-3">
              <div className="bg-amber-100 p-2 rounded-lg">
                <AlertCircle className="text-amber-600" size={18} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-amber-800 mb-2">Important Notice</h4>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Ensure that your address exactly matches the one on your government-issued ID or passport. 
                  Inconsistencies may delay verification by 5-7 business days.
                </p>
              </div>
            </div>
          </div>

          {/* Address Example */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <MapPin size={14} className="text-gray-500" />
              Address Format Example
            </h5>
            <div className="text-xs text-gray-600 bg-white p-3 rounded border border-gray-100">
              <p className="font-medium">Correct:</p>
              <p className="text-gray-500">123 Main Street, Apt 4B, Manhattan, New York, NY 10001</p>
              <p className="font-medium mt-2">Avoid:</p>
              <p className="text-gray-500">Near the park, blue house (too vague)</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={prev}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 hover:border-gray-400"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <button
              type="submit"
              className="px-8 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              Continue
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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