import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Notifications() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your password reset logic here
    console.log('Form submitted:', formData);
    
    if (formData.newPassword !== formData.confirmPassword) {
      alert("New password and confirm password don't match!");
      return;
    }
    
    if (formData.newPassword.length < 8) {
      alert("Password must be at least 8 characters long!");
      return;
    }
    
    alert("Password reset successful!");
    // Reset form
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="px-5 h-full overflow-hidden bg-gray-100 max-w-xl ">
      <div className="mb-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Password Setting</h2>
        <p className="text-sm font-normal text-gray-600">
          Your new password must be different from<br />
          your previously used password
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mt-10">
        {/* Current Password */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700">Current Password</label>
          <div className="flex justify-between bg-white/93 items-center border border-gray-300 rounded-sm px-2 hover:border-gray-400 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500">
            <input
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              className="text-black flex-1 py-2 outline-none bg-transparent"
              type={showCurrentPassword ? 'text' : 'password'}
              placeholder="Enter current password"
              required
            />
            <button 
              type="button" 
              onClick={() => setShowCurrentPassword(!showCurrentPassword)} 
              className="p-1 text-gray-500 hover:text-gray-700"
              aria-label={showCurrentPassword ? "Hide password" : "Show password"}
            >
              {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700">New Password</label>
          <div className="flex justify-between bg-white/93 items-center border border-gray-300 rounded-sm px-2 hover:border-gray-400 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500">
            <input
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              className="text-black flex-1 py-2 outline-none bg-transparent"
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              required
              minLength="8"
            />
            <button 
              type="button" 
              onClick={() => setShowNewPassword(!showNewPassword)} 
              className="p-1 text-gray-500 hover:text-gray-700"
              aria-label={showNewPassword ? "Hide password" : "Show password"}
            >
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700">Confirm Password</label>
          <div className="flex justify-between bg-white/93 items-center border border-gray-300 rounded-sm px-2 hover:border-gray-400 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500">
            <input
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="text-black flex-1 py-2 outline-none bg-transparent"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              required
              minLength="8"
            />
            <button 
              type="button" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
              className="p-1 text-gray-500 hover:text-gray-700"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Password Requirements Hint */}
        <div className="text-xs text-gray-500 mt-2">
          <p>Password must be at least 8 characters long</p>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className="mt-4 mb-7 w-full border-2 border-[#1F8225] text-[#1F8225] font-medium py-2.5 rounded-lg hover:bg-[#1F8225] hover:text-white transition-all duration-200 active:scale-[0.98]"
        >
          Reset Password
        </button>
      </form>


    </div>
  );
}