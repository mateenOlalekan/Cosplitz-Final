// ProofOfAddress.jsx
import React from "react";
import Vector from "../../assets/Vector.svg";

function ProofOfAddress({ next, prev, data, updateField }) {
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
    
    if (!formData.city?.trim()) newErrors.city = "City is required";
    if (!formData.district?.trim()) newErrors.district = "District is required";
    if (!formData.fullAddress?.trim()) newErrors.fullAddress = "Full address is required";
    
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
    <div className="w-full flex justify-center items-center bg-white">
      <div className="w-full max-w-lg flex flex-col">
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          {/* City */}
          <div className="flex flex-col gap-y-1">
            <label className="font-medium text-sm">
              City <span className="text-red-600">*</span>
            </label>
            <input
              value={formData.city || ''}
              onChange={(e) => handleChange("city", e.target.value)}
              className="border p-2 rounded focus:border-green-600 focus:outline-none"
              placeholder="Enter city"
            />
            {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}
          </div>

          {/* District */}
          <div className="flex flex-col gap-y-1">
            <label className="font-medium text-sm">
              District <span className="text-red-600">*</span>
            </label>
            <input
              value={formData.district || ''}
              onChange={(e) => handleChange("district", e.target.value)}
              className="border p-2 rounded focus:border-green-600 focus:outline-none"
              placeholder="Enter district"
            />
            {errors.district && <p className="text-red-500 text-xs">{errors.district}</p>}
          </div>

          {/* Full Address */}
          <div className="flex flex-col gap-y-1">
            <label className="font-medium text-sm">
              Full Address <span className="text-red-600">*</span>
            </label>
            <input
              value={formData.fullAddress || ''}
              onChange={(e) => handleChange("fullAddress", e.target.value)}
              className="border p-2 rounded focus:border-green-600 focus:outline-none"
              placeholder="Enter full address"
            />
            {errors.fullAddress && (
              <p className="text-red-500 text-xs">{errors.fullAddress}</p>
            )}
          </div>

          <div className="flex justify-between gap-3 items-start">
            <div className="items-start flex justify-items-start -mt-0">
              <img src={Vector} className="w-5 h-5" alt="info" />
            </div>

            <p className="text-[#67707E] text-[12px]">
              Please ensure that your address matches the one on your passport or ID card. If your
              information does not match, your documents cannot be verified.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex  justify-between mt-4 gap-3">
            <button
              type="button"
              onClick={prev}
              className="flex-1 bg-white py-2 rounded-md text-[#1F8225] border border-[#1F8225]"
            >
              Previous
            </button>

            <button type="submit" className="flex-1 bg-[#1F8225] text-white py-2 rounded-md">
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProofOfAddress;