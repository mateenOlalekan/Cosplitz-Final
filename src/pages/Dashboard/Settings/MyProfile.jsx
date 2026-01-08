import React, { useState } from 'react';
import { Edit2 } from 'lucide-react';

export default function MyProfile() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationalId: '',
    nationality: '',
    city: '',
    district: '',
    address: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form data:', formData);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-2 sm:p-3 md:p-4 overflow-y-auto">
      
      {/* ===== Header ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
          Profile Information
        </h2>
        <button className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors text-xs sm:text-sm">
          <Edit2 size={14} />
          <span className="font-medium">Edit</span>
        </button>
      </div>

      {/* ===== Profile Card ===== */}
      <div className="rounded-lg mb-3 sm:mb-4">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex-shrink-0"></div>
          <div className="text-center sm:text-left">
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
              Alice Badmus
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">View Profiles & Settings</p>
          </div>
        </div>
      </div>

      {/* ===== Personal Details Form ===== */}
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        
        {/* Personal Details Section */}
        <div>
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Personal Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
            {['firstName', 'lastName', 'email', 'phone', 'nationalId'].map((field, idx) => (
              <div key={idx} className={idx >= 4 ? 'md:col-span-2' : ''}>
                <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-1">
                  {field === 'firstName' ? 'First Name' :
                   field === 'lastName' ? 'Last Name' :
                   field === 'email' ? 'Email address' :
                   field === 'phone' ? 'Phone number' : 'National identity number'}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type={field === 'email' ? 'email' : 'text'}
                  name={field}
                  value={formData[field]}
                  onChange={handleInputChange}
                  placeholder={`Enter your ${field === 'nationalId' ? 'national identity number' : field}`}
                  className="w-full px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder:text-gray-400"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Address Section */}
        <div>
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Address</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
            {['nationality', 'city'].map((field, idx) => (
              <div key={idx}>
                <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-1">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                  {field === 'nationality' && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  name={field}
                  value={formData[field]}
                  onChange={handleInputChange}
                  placeholder={`Enter your ${field}`}
                  className="w-full px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder:text-gray-400"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
            {['district', 'address'].map((field, idx) => (
              <div key={idx}>
                <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-1">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type="text"
                  name={field}
                  value={formData[field]}
                  onChange={handleInputChange}
                  placeholder={`Enter your ${field}`}
                  className="w-full px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder:text-gray-400"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end pt-3 sm:pt-4">
          <button
            type="button"
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-lg text-gray-900 text-sm sm:text-base font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-green-500 text-white rounded-lg text-sm sm:text-base font-medium hover:bg-green-600 transition-colors"
          >
            Save changes
          </button>
        </div>

      </form>
    </div>
  );
}