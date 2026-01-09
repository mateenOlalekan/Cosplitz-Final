// src/pages/Auth/Register/index.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import loginlogo from "../../../assets/login.jpg";
import logo from "../../../assets/logo.svg";
import EmailVerificationStep from "./EmailVerificationStep";
import RegistrationForm from "./RegistrationForm";
import Successful from "./Successful";
import LoadingSpinner from "../../Public/LoadingScreen";

const Register = () => {
  const navigate = useNavigate();
  const {
    user,
    token,
    error,
    isLoading,
    isInitialized,
    tempRegister,
    isAuthenticated,
    initializeAuth,
    register,
    clearError,
  } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { id: 1, label: "Account", description: "Create your account" },
    { id: 2, label: "Verify Email", description: "Verify your email address" },
    { id: 3, label: "Success", description: "Account created successfully" },
  ];

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isInitialized && isAuthenticated()) {
      navigate("/dashboard", { replace: true });
    }
  }, [isInitialized, isAuthenticated, navigate]);

  // Auto-advance to OTP step when tempRegister is set
  useEffect(() => {
    if (tempRegister && currentStep === 1) {
      setCurrentStep(2);
    }
  }, [tempRegister, currentStep]);

  // Clear errors on step change
  useEffect(() => {
    clearError();
  }, [currentStep, clearError]);

  const handleRegistrationSubmit = async (formData) => {
    clearError();
    
    const result = await register({
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      nationality: formData.nationality || undefined,
      password: formData.password,
    });

    if (result.success) {
      if (result.requiresVerification) {
        console.log("Registration successful, OTP verification required");
      } else {
        // Auto-login case (no verification needed)
        setCurrentStep(3);
      }
    }
  };

  const handleEmailVerificationSuccess = () => {
    setCurrentStep(3);
  };

  const handleBackToStep1 = () => {
    clearError();
    setCurrentStep(1);
  };

  const handleSocialRegister = (provider) => {
    useAuthStore.getState().setError(`${provider} registration is coming soon!`);
  };

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F5F9]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="flex bg-[#F7F5F9] w-full min-h-screen justify-center overflow-hidden md:px-6 md:py-4 rounded-2xl">
      <div className="flex max-w-screen-2xl w-full h-full rounded-xl overflow-hidden">
        {/* Left Side (Image/Illustration) */}
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

        {/* Right Side (Form) */}
        <div className="flex flex-1 flex-col items-center p-3 sm:p-5 overflow-y-auto">
          <div className="w-full mb-4 flex justify-center md:justify-start items-center md:items-start">
            <img src={logo} alt="Logo" className="h-10 md:h-12" />
          </div>

          <div className="w-full max-w-2xl p-5 rounded-xl shadow-none md:shadow-md border-none md:border border-gray-100 bg-white">
            {/* Steps Indicator */}
            <div className="w-full flex flex-col items-center py-4 mb-4">
              <div className="flex items-center gap-2 justify-center mb-2">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      currentStep >= step.id 
                        ? "bg-green-600 border-green-600 text-white" 
                        : "bg-white border-gray-300 text-gray-400"
                    }`}>
                      {step.id}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-16 md:w-24 lg:w-32 border-t-2 mx-2 ${
                          currentStep > step.id ? "border-green-600" : "border-gray-300"
                        }`}
                      ></div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 text-center">
                {steps.find(step => step.id === currentStep)?.description}
              </p>
            </div>

            {/* Step Content */}
            {currentStep === 1 && (
              <RegistrationForm
                onSubmit={handleRegistrationSubmit}
                onSocialRegister={handleSocialRegister}
                loading={isLoading}
                error={error}
              />
            )}

            {currentStep === 2 && (
              <EmailVerificationStep
                email={tempRegister?.email}
                userId={tempRegister?.userId}
                onBack={handleBackToStep1}
                onSuccess={handleEmailVerificationSuccess}
              />
            )}

            {currentStep === 3 && <Successful />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;