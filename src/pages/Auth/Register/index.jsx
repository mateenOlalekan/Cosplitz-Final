import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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

// Mock OTP storage (in real app, this would be in backend)
let MOCK_OTP = '123456';
let MOCK_USERS = JSON.parse(localStorage.getItem('mock_users') || '[]');

export default function Register() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [verificationError, setVerificationError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [tempRegister, setTempRegister] = useState(null);
  const [user, setUser] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Clear errors on step change
  useEffect(() => {
    setError('');
    setVerificationError('');
  }, [currentStep]);

  const simulateApiCall = (duration = 1000) => 
    new Promise(resolve => setTimeout(resolve, duration));

  const handleRegister = async (formData) => {
    console.log('handleRegister called with:', formData);
    setIsLoading(true);
    setError('');

    try {
      await simulateApiCall(1500);
      
      // Check if user already exists
      const existingUser = MOCK_USERS.find(u => u.email === formData.email.toLowerCase().trim());
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Generate new mock OTP
      MOCK_OTP = Math.floor(100000 + Math.random() * 900000).toString();
      console.log('Generated OTP:', MOCK_OTP); // Log it so you can test with different OTPs

      // Store temp registration data
      const tempData = {
        email: formData.email.toLowerCase().trim(),
        userId: Date.now(),
        formData
      };
      setTempRegister(tempData);
      
      // Move to verification step
      setCurrentStep(2);
      return { success: true };
    } catch (err) {
      const errorMsg = err.message || 'Registration failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (otp) => {
    setVerificationError('');
    setIsLoading(true);

    try {
      await simulateApiCall(1000);

      if (otp === MOCK_OTP) {
        // Create user object
        const newUser = {
          id: tempRegister.userId,
          email: tempRegister.email,
          first_name: tempRegister.formData.firstName,
          last_name: tempRegister.formData.lastName,
          nationality: tempRegister.formData.nationality,
          created_at: new Date().toISOString(),
          is_verified: true
        };

        // Save to localStorage
        MOCK_USERS.push(newUser);
        localStorage.setItem('mock_users', JSON.stringify(MOCK_USERS));
        localStorage.setItem('current_user', JSON.stringify(newUser));

        setUser(newUser);
        setCurrentStep(3);
        return { success: true };
      } else {
        throw new Error('Invalid OTP. Try again or click Resend Code.');
      }
    } catch (err) {
      const errorMsg = err.message || 'Verification failed';
      setVerificationError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      await simulateApiCall(1000);
      MOCK_OTP = Math.floor(100000 + Math.random() * 900000).toString();
      console.log('Resent OTP:', MOCK_OTP);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to resend OTP' };
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialRegister = async (provider) => {
    setIsLoading(true);
    try {
      await simulateApiCall(1500);
      // Simulate successful social registration
      const socialUser = {
        id: Date.now(),
        email: `${provider}_user@example.com`,
        first_name: provider,
        last_name: 'User',
        nationality: '',
        created_at: new Date().toISOString(),
        is_verified: true,
        provider: provider
      };
      
      localStorage.setItem('current_user', JSON.stringify(socialUser));
      setUser(socialUser);
      setCurrentStep(3);
    } catch (err) {
      setError(`${provider} registration failed`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToRegistration = () => {
    setCurrentStep(1);
    setTempRegister(null);
    setError('');
    setVerificationError('');
  };

  return (
    <div className="flex bg-[#F7F5F9] w-full h-screen justify-center overflow-hidden md:px-6 md:py-4">
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

            {currentStep === 2 && tempRegister && (
              <EmailVerificationStep
                email={tempRegister.email}
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