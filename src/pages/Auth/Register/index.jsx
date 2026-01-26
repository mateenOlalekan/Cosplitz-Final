// src/pages/Register/index.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegistrationFlow, useTempRegister, useUser } from '../../../services/queries/auth';
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
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [verificationError, setVerificationError] = useState('');

  // TanStack Query hooks - updated to handle loading states properly
  const { data: tempRegister } = useTempRegister();
  const { data: user, isLoading: isUserLoading, isError: isUserError } = useUser();
  const { executeFlow, verifyOTP, resendOTP, isVerifying } = useRegistrationFlow();

  // Redirect if already authenticated - only when user data is actually available
  useEffect(() => {
    if (user && !isUserLoading && !isUserError) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, isUserLoading, isUserError, navigate]);

  // Resume at OTP step if temp registration exists
  useEffect(() => {
    if (tempRegister && currentStep === 1) {
      setCurrentStep(2);
    }
  }, [tempRegister, currentStep]);

  const handleRegister = async (formData) => {
    setVerificationError('');
    
    const payload = {
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim(),
      email: formData.email.toLowerCase().trim(),
      password: formData.password,
      nationality: formData.nationality.trim(),
    };

    try {
      await executeFlow(payload);
      setCurrentStep(2);
      return { success: true };
    } catch (error) {
      const message = error?.message || 'Registration failed';
      setVerificationError(message);
      return { success: false, error: message };
    }
  };

  const handleVerifyOTP = async (otp) => {
    setVerificationError('');
    
    if (!tempRegister?.email) {
      setVerificationError('Session expired. Please register again.');
      return { success: false, error: 'Session expired' };
    }
    
    try {
      await verifyOTP({ 
        email: tempRegister.email, 
        otp 
      });
      setCurrentStep(3);
      return { success: true };
    } catch (error) {
      const message = error?.message || 'Invalid verification code';
      setVerificationError(message);
      return { success: false, error: message };
    }
  };

  const handleResendOTP = async () => {
    if (!tempRegister?.userId) {
      return { success: false, error: 'Session expired' };
    }
    
    try {
      await resendOTP(tempRegister.userId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error?.message || 'Failed to resend code' };
    }
  };

  const handleBackToRegistration = () => {
    localStorage.removeItem('tempRegister');
    window.location.reload();
  };

  // Show loading state while checking auth
  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F7F5F9]">
        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex bg-[#F7F5F9] w-full h-screen justify-center overflow-hidden md:px-6 md:py-4">
      <div className="flex max-w-screen-2xl w-full min-h-full rounded-xl overflow-hidden">
        
        {/* Left Panel */}
        <div className="hidden lg:flex w-1/2 bg-[#F8EACD] rounded-xl p-6 items-center justify-center">
          <div className="w-full flex flex-col items-center">
            <img src={loginlogo} alt="Register" className="rounded-lg w-full h-auto max-h-[400px] object-contain" />
            <div className="bg-gradient-to-br max-w-lg from-[#FAF3E8] to-[#F8EACD] mt-4 p-4 rounded-2xl shadow-sm text-center">
              <h1 className="text-3xl font-semibold text-[#2D0D23] mb-1">
                Share Expenses & Resources in Real Time
              </h1>
              <p className="text-xl font-medium text-[#4B4B4B] leading-relaxed">
                Connect with students, travelers, and locals to effortlessly manage costs.
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex flex-1 flex-col items-center p-3 sm:p-5 overflow-y-auto">
          <div className="w-full mb-4 flex justify-center md:justify-start">
            <img src={logo} alt="Logo" className="h-10 md:h-12" />
          </div>

          <div className="w-full max-w-2xl p-5 rounded-xl shadow-none md:shadow-md bg-white">
            
            {/* Stepper */}
            <div className="w-full flex flex-col items-center py-4 mb-4">
              <div className="flex items-center gap-2 justify-center mb-2">
                {steps.map((s, i) => (
                  <div key={s.id} className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 text-xs font-semibold ${
                      currentStep >= s.id ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {s.id}
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`w-16 md:w-24 border-t-2 mx-2 ${
                        currentStep > s.id ? 'border-green-600' : 'border-gray-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600">
                {steps.find(s => s.id === currentStep)?.description}
              </p>
            </div>

            {/* Error Display */}
            {verificationError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">
                {verificationError}
              </div>
            )}

            {/* Step Content */}
            {currentStep === 1 && (
              <RegistrationForm
                onSubmit={handleRegister}
                loading={false}
              />
            )}

            {currentStep === 2 && tempRegister && (
              <EmailVerificationStep
                email={tempRegister.email}
                onVerify={handleVerifyOTP}
                onResend={handleResendOTP}
                onBack={handleBackToRegistration}
                isLoading={isVerifying}
              />
            )}

            {currentStep === 3 && <Successful />}
          </div>
        </div>
      </div>
    </div>
  );
}