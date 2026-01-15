// src/pages/Register/index.jsx
import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../../../store/authStore';
import loginlogo from "../../../assets/login.jpg";
import logo from "../../../assets/logo.svg";
import RegistrationForm from './RegistrationForm';
import EmailVerificationStep from './EmailVerificationStep';
import Successful from './Successful';

const steps = [
  { id: 1, label: 'Account', description: 'Create your account' },
  { id: 2, label: 'Verify Email', description: 'Verify your email address' },
  { id: 3, label: 'Success', description: 'Account created successfully' },
];

export default function Register() {
  const { 
    register, 
    verifyOTP, 
    resendOTP, 
    tempRegister, 
    user, 
    error, 
    isLoading,
    clearError,
    clearIncompleteRegistration,
  } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [verificationError, setVerificationError] = useState('');
  const [hasClearedState, setHasClearedState] = useState(false);
  const isMounted = useRef(true);

  // ✅ Clear incomplete registration on component mount
  useEffect(() => {
    if (!hasClearedState) {
      clearIncompleteRegistration();
      setHasClearedState(true);
    }
  }, [hasClearedState, clearIncompleteRegistration]);

  // Enhanced step transition logic - only transition if we have fresh data
  useEffect(() => {
    if (isMounted.current && tempRegister?.userId && hasClearedState) {
      if (currentStep === 1) {
        setCurrentStep(2);
        clearError();
      }
    }
  }, [tempRegister, currentStep, clearError, hasClearedState]);

  useEffect(() => {
    if (isMounted.current && user && hasClearedState) {
      if (currentStep === 2) {
        setCurrentStep(3);
        clearError();
      }
    }
  }, [user, currentStep, clearError, hasClearedState]);

  // Clear errors on step change
  useEffect(() => {
    clearError();
    setVerificationError('');
  }, [currentStep, clearError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleRegister = async (formData) => {
    const payload = {
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim(),
      email: formData.email.toLowerCase().trim(),
      password: formData.password,
      nationality: formData.nationality.trim(),
    };

    try {
      const res = await register(payload);
      
      if (res.success) {
        return { success: true };
      } else {
        return { success: false, error: res.error || 'Registration failed' };
      }
    } catch (err) {
      return { success: false, error: 'Registration failed' };
    }
  };

  const handleVerifyOTP = async (otp) => {
    setVerificationError('');
    
    try {
      const res = await verifyOTP(null, otp);
      
      if (res.success) {
        return { success: true };
      } else {
        setVerificationError(res.error || 'OTP verification failed');
        return { success: false, error: res.error || 'OTP verification failed' };
      }
    } catch (err) {
      setVerificationError('Verification failed. Please try again.');
      return { success: false, error: 'Verification failed' };
    }
  };

  const handleResendOTP = async () => {
    try {
      await resendOTP();
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to resend OTP' };
    }
  };

  const handleSocialRegister = (provider) => {
    alert(`${provider} registration is coming soon!`);
  };

  const handleBackToRegistration = () => {
    setCurrentStep(1);
    clearError();
    setVerificationError('');
  };

  return (
    <div className="flex bg-[#F7F5F9] w-full min-h-screen justify-center overflow-hidden md:px-6 md:py-4">
      <div className="flex max-w-screen-2xl w-full min-h-full rounded-xl overflow-hidden">
        <div className="hidden lg:flex w-1/2 bg-[#F8EACD] rounded-xl p-6 items-center justify-center">
          <div className="w-full flex flex-col items-center">
            <img src={loginlogo} alt="Register" className="rounded-lg w-full h-auto max-h-[400px] object-contain" />
            <div className="bg-gradient-to-br max-w-lg from-[#FAF3E8] to-[#F8EACD] mt-4 p-4 rounded-2xl shadow-sm text-center">
              <h1 className="text-3xl font-semibold text-[#2D0D23] mb-1">Share Expenses & Resources in Real Time</h1>
              <p className="text-xl font-medium text-[#4B4B4B] leading-relaxed">
                Connect with students, travelers, and locals to effortlessly manage costs and resources.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center p-3 sm:p-5 overflow-y-auto">
          <div className="w-full mb-4 flex justify-center md:justify-start">
            <img src={logo} alt="Logo" className="h-10 md:h-12" />
          </div>

          <div className="w-full max-w-2xl p-5 rounded-xl shadow-none md:shadow-md border-none md:border border-gray-100 bg-white">
            <div className="w-full flex flex-col items-center py-4 mb-4">
              <div className="flex items-center gap-2 justify-center mb-2">
                {steps.map((s, i) => (
                  <div key={s.id} className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 text-xs font-semibold ${
                      currentStep >= s.id ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-gray-300 text-gray-400'
                    }`}
                    >
                      {s.id}
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`w-16 md:w-24 lg:w-32 border-t-2 mx-2 ${
                        currentStep > s.id ? 'border-green-600' : 'border-gray-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 text-center">
                {steps.find((s) => s.id === currentStep)?.description}
              </p>
            </div>

            {(error || verificationError) && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">
                {error || verificationError}
              </div>
            )}

            {currentStep === 1 && (
              <RegistrationForm
                onSubmit={handleRegister}
                onSocialRegister={handleSocialRegister}
                loading={isLoading}
                error={error}
              />
            )}

            {currentStep === 2 && (
              <EmailVerificationStep
                onVerify={handleVerifyOTP}
                onResend={handleResendOTP}
                onBack={handleBackToRegistration}
                isLoading={isLoading}
              />
            )}

            {currentStep === 3 && <Successful />}
          </div>
        </div>
      </div>
    </div>
  );
}