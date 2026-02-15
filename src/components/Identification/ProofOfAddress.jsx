import { useState } from "react";
import { MapPin, Navigation, Home, AlertCircle } from "lucide-react";

/* -------------------- Reusable Input Field -------------------- */
const InputField = ({
  label,
  name,
  icon: Icon,
  placeholder,
  formData,
  errors,
  touched,
  handleChange,
  handleBlur,
  multiline = false
}) => (
  <div className="flex flex-col gap-1">
    <label className="font-medium text-sm text-gray-700 flex items-center gap-1">
      {label} <span className="text-red-500">*</span>
    </label>

    <div className="relative group">
      <div className={`absolute left-3 ${multiline ? 'top-3' : 'top-1/2 transform -translate-y-1/2'} text-gray-400 group-focus-within:text-green-600 transition-colors`}>
        <Icon size={18} />
      </div>

      {multiline ? (
        <textarea
          name={name}
          value={formData[name] || ""}
          onChange={handleChange}
          onBlur={() => handleBlur(name)}
          rows="3"
          className="w-full border border-gray-300 p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 text-sm resize-none"
          placeholder={placeholder}
        />
      ) : (
        <input
          name={name}
          value={formData[name] || ""}
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

/* -------------------- Main Component -------------------- */
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

  return (
    <div className="w-full flex justify-center items-center py-4 px-4 sm:px-6">
      <div className="w-full max-w-4xl flex flex-col">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
            <MapPin className="text-green-600" size={20} />
            Proof of Address
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Please provide your current residential address
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <InputField
              label="City"
              name="city"
              icon={Navigation}
              placeholder="New York"
              formData={formData}
              errors={errors}
              touched={touched}
              handleChange={handleChange}
              handleBlur={handleBlur}
            />
            
            <InputField
              label="District"
              name="district"
              icon={Navigation}
              placeholder="Manhattan"
              formData={formData}
              errors={errors}
              touched={touched}
              handleChange={handleChange}
              handleBlur={handleBlur}
            />
          </div>

          <InputField
            label="Full Address"
            name="fullAddress"
            icon={Home}
            placeholder="123 Main Street, Apartment 4B"
            formData={formData}
            errors={errors}
            touched={touched}
            handleChange={handleChange}
            handleBlur={handleBlur}
            multiline={true}
          />



          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={prev}
              className="w-full sm:w-auto px-5 sm:px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2 hover:border-gray-400 text-sm sm:text-base"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 sm:px-8 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm sm:text-base"
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