import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from "zod";
import { useAuthStore } from '../../../store/authStore';
import { authService } from '../../../services/authApi';
import loginlogo from "../../../assets/login.jpg";
import logo from "../../../assets/logo.svg";
import RegistrationForm from './RegistrationForm';
import EmailVerificationStep from './EmailVerificationStep';
import Successful from './Successful';

/* ---------------- ZOD SCHEMA ---------------- */
const RegisterSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  nationality: z.string().optional(),
  agreeToTerms: z.boolean().optional(),
});

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

  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    nationality: '',
    password: '',
    agreeToTerms: false,
  });

  const steps = [
    { id: 1, label: 'Account', description: 'Create your account' },
    { id: 2, label: 'Verify Email', description: 'Verify your email address' },
    { id: 3, label: 'Success', description: 'Account created successfully' },
  ];

  useEffect(() => {
    return () => {
      if (cleanupTimer.current) clearTimeout(cleanupTimer.current);
      clearError();
    };
  }, [clearError]);

  useEffect(() => {
    clearError();
  }, [currentStep, clearError]);

  /* ---------------- FORM SUBMIT ---------------- */
  const handleFormSubmit = async (submittedData) => {
    clearError();

    // ZOD VALIDATION
    const result = RegisterSchema.safeParse(submittedData);

    if (!result.success) {
      const firstError = result.error.errors[0]?.message;
      setError(firstError || "Invalid form data");
      return;
    }

    const { firstName, lastName, email, password, nationality } = result.data;

    setStoreLoading(true);

    try {
      const payload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.toLowerCase().trim(),
        password,
        username: email.split('@')[0],
        nationality: nationality || '',
      };

      const res = await authService.register(payload);

      if (res.error || !res.success) {
        setError(res.data?.message || 'Registration failed. Please try again.');
        return;
      }

      const id = res.data?.user?.id || res.data?.user_id || res.data?.id;
      const registeredMail =
        res.data?.user?.email || res.data?.email || payload.email;

      if (!id) {
        setError(
          'Registration succeeded but user ID is missing. Please try logging in.'
        );
        return;
      }

      setUserId(id);
      setRegisteredEmail(registeredMail);

      setPendingVerification({
        email: registeredMail,
        userId: id,
        firstName,
        lastName,
      });

      setCurrentStep(2);

      setTimeout(async () => {
        const otpRes = await authService.getOTP(id);
        if (otpRes.error) {
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

  /* ---------------- EMAIL VERIFIED ---------------- */
  const handleEmailVerificationSuccess = async () => {
    try {
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
          role: 'user',
          is_active: true,
          email_verified: true,
          username: formData.email.split('@')[0],
          nationality: formData.nationality,
        };

        completeRegistration(userData, loginRes.data.token);
        setCurrentStep(3);
        cleanupTimer.current = setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setError('Email verified! Please log in with your credentials.');
        setCurrentStep(3);
        cleanupTimer.current = setTimeout(() => navigate('/login'), 2000);
      }
    } catch {
      setError('Email verified! Please log in with your credentials.');
      setCurrentStep(3);
      cleanupTimer.current = setTimeout(() => navigate('/login'), 2000);
    }
  };

  const handleVerificationFailed = (message) => {
    setError(message);
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
        <div className="hidden lg:flex w-1/2 bg-[#F8EACD] rounded-xl p-6 items-center justify-center">
          <div className="w-full flex flex-col items-center">
            <img src={loginlogo} alt="Register" className="rounded-lg w-full max-h-[400px] object-contain" />
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center p-3 sm:p-5 overflow-y-auto">
          <img src={logo} alt="Logo" className="h-10 md:h-12 mb-4" />

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
  );
}
