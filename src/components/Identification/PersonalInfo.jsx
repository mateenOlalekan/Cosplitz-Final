// PersonalInfo.jsx
import React from "react";

function PersonalInfoPage({ next, data, updateField }) {
  const [formData, setFormData] = React.useState(data);
  const [errors, setErrors] = React.useState({});

  const handleChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    updateField(field, value);
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName?.trim()) newErrors.firstName = "First name is required";
    else if (formData.firstName.trim().length < 2) newErrors.firstName = "First name must be at least 2 characters";
    
    if (!formData.lastName?.trim()) newErrors.lastName = "Last name is required";
    else if (formData.lastName.trim().length < 2) newErrors.lastName = "Last name must be at least 2 characters";
    
    if (!formData.email?.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Enter a valid email";
    
    if (!formData.nationality?.trim()) newErrors.nationality = "Nationality is required";
    
    return newErrors;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    next();
  };

  return (
    <div className="w-full flex justify-center items-center mt-6">
      <div className="w-full max-w-lg flex flex-col">
        <form onSubmit={onSubmit} className="flex flex-col md:gap-2 gap-6">
          {/* First Name */}
          <div className="flex flex-col">
            <label className="font-medium text-sm">
              First Name <span className="text-red-600">*</span>
            </label>
            <input
              value={formData.firstName || ''}
              onChange={(e) => handleChange("firstName", e.target.value)}
              className="border p-2 rounded focus:border-green-600 focus:outline-none text-sm"
              placeholder="Enter first name"
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs sm:text-sm">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="flex flex-col">
            <label className="font-medium text-sm">
              Last Name <span className="text-red-600">*</span>
            </label>
            <input
              value={formData.lastName || ''}
              onChange={(e) => handleChange("lastName", e.target.value)}
              className="border p-2 rounded focus:border-green-600 focus:outline-none text-sm"
              placeholder="Enter last name"
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs sm:text-sm">{errors.lastName}</p>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="font-medium text-sm">
              Email Address <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleChange("email", e.target.value)}
              className="border p-2 rounded focus:border-green-600 focus:outline-none text-sm"
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="text-red-500 text-xs sm:text-sm">{errors.email}</p>
            )}
          </div>

          {/* Nationality */}
          <div className="flex flex-col">
            <label className="font-medium text-sm">
              Nationality <span className="text-red-600">*</span>
            </label>
            <input
              value={formData.nationality || ''}
              onChange={(e) => handleChange("nationality", e.target.value)}
              className="border p-2 rounded focus:border-green-600 focus:outline-none text-sm"
              placeholder="Enter nationality"
            />
            {errors.nationality && (
              <p className="text-red-500 text-xs sm:text-sm">{errors.nationality}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              className="flex-1 bg-[#1F8225] text-white py-2 rounded-md"
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PersonalInfoPage;