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
        if (!value.trim()) error = `${field.replace(/([A-Z])/g, ' $1')} is required`;
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
    const newErrors = {};
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
    <div className="flex flex-col gap-2">
      <label className="font-medium text-sm text-gray-700 flex items-center gap-1">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative group">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors">
          <Icon size={18} />
        </div>
        <input
          name={name}
          type={type}
          value={formData[name]}
          onChange={handleChange}
          onBlur={() => handleBlur(name)}
          className="w-full border border-gray-300 p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 text-sm"
          placeholder={placeholder}
        />
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
    <div className="w-full flex justify-center items-center mt-6">
      <div className="w-full max-w-lg flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <User className="text-green-600" size={20} />
            Personal Information
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Please provide your personal details for verification
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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



          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
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

export default PersonalInfoPage;