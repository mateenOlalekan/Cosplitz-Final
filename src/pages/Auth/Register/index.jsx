import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { authService } from '../../../services/authApi';
import loginlogo from "../../../assets/login.jpg";
import logo from "../../../assets/logo.svg";
import RegistrationForm from './RegistrationForm';
import EmailVerificationStep from './EmailVerificationStep';
import Successful from './Successful';


export default function Register() {
  const navigate = useNavigate();
  const cleanupTimer = useRef(null);

  // Global auth state
  const {
    setError,
    clearError,
    error: storeError,
    setLoading: setStoreLoading,
    setPendingVerification,
    completeRegistration,
  } = useAuthStore();

  // Local step state
  const [currentStep, setCurrentStep] = useState(1);
  const [userId, setUserId] = useState(null);
  const [registeredEmail, setRegisteredEmail] = useState('');

  // Form data (collected in Step 1)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    nationality: '',
    password: '',
    agreeToTerms: false,
  });

  // Step labels for progress indicator
  const steps = [
    { id: 1, label: 'Account', description: 'Create your account' },
    { id: 2, label: 'Verify Email', description: 'Verify your email address' },
    { id: 3, label: 'Success', description: 'Account created successfully' },
  ];

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (cleanupTimer.current) clearTimeout(cleanupTimer.current);
      clearError();
    };
  }, [clearError]);

  // Reset errors when step changes
  useEffect(() => {
    clearError();
  }, [currentStep, clearError]);


  const handleFormSubmit = async (submittedData) => {
    if(!submittedData){
      setError("Forn Submision failed, Please try again.")
    }
    const {firstName,lastName,email,password} = submittedData;
    if(!firstName || !lastName || !email || !password ){
      setError("All required filed must be filled")
      return;
    }
    clearError();
    setStoreLoading(true);

    try {
      // Transform form data to API payload
      const payload = {
        first_name: submittedData.firstName.trim(),
        last_name: submittedData.lastName.trim(),
        email: submittedData.email.toLowerCase().trim(),
        password: submittedData.password,
        username: submittedData.email.split('@')[0],
        nationality: submittedData.nationality || '',
      };

      const res = await authService.register(payload);

      if (res.error || !res.success) {
        setError(res.data?.message || 'Registration failed. Please try again.');
        setStoreLoading(false);
        return;
      }

      const id = res.data?.user?.id || res.data?.user_id || res.data?.id;
      const email = res.data?.user?.email || res.data?.email || payload.email;

      if (!id) {
        setError('Registration succeeded but user ID is missing. Please try logging in.');
        setStoreLoading(false);
        return;
      }

      setUserId(id);
      setRegisteredEmail(email);

      // Store temporary data for OTP verification
      setPendingVerification({
        email,
        userId: id,
        firstName: submittedData.firstName,
        lastName: submittedData.lastName,
      });

      // Advance to Step 2
      setCurrentStep(2);

      // Auto-send OTP after a short delay
      setTimeout(async () => {
        const otpRes = await authService.getOTP(id);
        if (otpRes.error) {
          console.warn('OTP auto-send failed:', otpRes.data?.message);
          setError('Failed to send OTP. Use the resend button.');
        }
      }, 500);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Network error. Please check your connection.');
    } finally {
      setStoreLoading(false);
    }
  };


  const handleEmailVerificationSuccess = async () => {
    try {
      // Auto-login to obtain token
      const loginRes = await authService.login({
        email: registeredEmail || formData.email,
        password: formData.password,
      });

      if (loginRes.success && loginRes.data?.token) {
        const userData = {
          id: userId,
          email: registeredEmail || formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          name: `${formData.firstName} ${formData.lastName}`,
          role: 'user', // Default role; backend can override
          is_active: true,
          email_verified: true,
          username: formData.email.split('@')[0],
          nationality: formData.nationality,
        };

        completeRegistration(userData, loginRes.data.token);
        setCurrentStep(3);

        // Redirect to dashboard after success animation
        cleanupTimer.current = setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        // Auto-login failed; ask user to login manually
        setError('Email verified! Please log in with your credentials.');
        setCurrentStep(3);
        cleanupTimer.current = setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      console.error('Auto-login failed:', err);
      setError('Email verified! Please log in with your credentials.');
      setCurrentStep(3);
      cleanupTimer.current = setTimeout(() => navigate('/login'), 2000);
    }
  };


  const handleVerificationFailed = (message) => {
    setError(message);
    // Optional: reload after delay to reset form
    cleanupTimer.current = setTimeout(() => window.location.reload(), 1500);
  };


  const handleBackToStep1 = () => {
    clearError();
    setCurrentStep(1);
  };


  const handleSocialRegister = (provider) => {
    setError(`${provider} registration is coming soon!`);
  };

  return (
    <div className="flex bg-[#F7F5F9] w-full h-screen justify-center overflow-hidden md:px-6 md:py-4 rounded-2xl">
      <div className="flex max-w-screen-2xl w-full h-full rounded-xl overflow-hidden">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex w-1/2 bg-[#F8EACD] rounded-xl p-6 items-center justify-center">
          <div className="w-full flex flex-col items-center">
            <img
              src={loginlogo}
              alt="Register"
              className="rounded-lg w-full h-auto max-h-[400px] object-contain"
            />
            <div className="bg-gradient-to-br max-w-lg from-[#FAF3E8] to-[#F8EACD] mt-4 p-4 rounded-2xl shadow-sm text-center">
              <h1 className="text-3xl font-semibold text-[#2D0D23] mb-1">
                Share Expenses & Resources in Real Time
              </h1>
              <p className="text-xl font-medium text-[#4B4B4B] leading-relaxed">
                Connect with students, travelers, and locals to effortlessly manage costs and resources.
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Registration Form */}
        <div className="flex flex-1 flex-col items-center p-3 sm:p-5 overflow-y-auto">
          <div className="w-full mb-4 flex justify-center md:justify-start items-center md:items-start">
            <img src={logo} alt="Logo" className="h-10 md:h-12" />
          </div>

          <div className="w-full max-w-2xl p-5 rounded-xl shadow-none md:shadow-md border-none md:border border-gray-100 bg-white">
            {/* Progress Indicator */}
            <div className="w-full flex flex-col items-center py-4 mb-4">
              <div className="flex items-center gap-2 justify-center mb-2">
                {steps.map((s, i) => (
                  <div key={s.id} className="flex items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border-2 text-xs font-semibold ${
                        currentStep >= s.id
                          ? 'bg-green-600 border-green-600 text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}
                    >
                      {s.id}
                    </div>
                    {i < steps.length - 1 && (
                      <div
                        className={`w-16 md:w-24 lg:w-32 border-t-2 mx-2 ${
                          currentStep > s.id ? 'border-green-600' : 'border-gray-300'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 text-center">
                {steps.find((s) => s.id === currentStep)?.description}
              </p>
            </div>

            {/* Step Content */}
            {currentStep === 1 && (
              <RegistrationForm
                formData={formData}
                handleInputChange={setFormData}
                handleFormSubmit={handleFormSubmit}
                handleSocialRegister={handleSocialRegister}
                loading={useAuthStore((s) => s.isLoading)}
                error={storeError}
              />
            )}
            {currentStep === 2 && (
              <EmailVerificationStep
                email={registeredEmail || formData.email}
                userId={userId}
                onBack={handleBackToStep1}
                onSuccess={handleEmailVerificationSuccess}
                onVerificationFailed={handleVerificationFailed}
              />
            )}
            {currentStep === 3 && <Successful />}
          </div>
        </div>
      </div>
    </div>
  );
}