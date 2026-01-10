import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import loginlogo from "../../../assets/login.jpg";
import logo from "../../../assets/logo.svg";
import { useAuthStore } from "../../../store/authStore";
import EmailVerificationStep from "./EmailVerificationStep";
import RegistrationForm from "./RegistrationForm";
import Successful from "./Successful";

const STEP_FORM = 1;
const STEP_VERIFY = 2;
const STEP_SUCCESS = 3;

export default function Register() {
  const navigate = useNavigate();
  const { register, tempRegister, error, clearError } = useAuthStore();

  const [step, setStep] = useState(STEP_FORM);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    nationality: "",
    password: "",
    agreeToTerms: false,
  });

  /* ---------- keep UI in sync with store ---------- */
  useEffect(() => {
    if (tempRegister?.email && step === STEP_FORM) setStep(STEP_VERIFY);
  }, [tempRegister, step]);

  useEffect(() => clearError(), [step, clearError]);

  /* ---------- handlers ---------- */
  const updateForm = useCallback((field, value) => {
    setFormData((p) => ({ ...p, [field]: value }));
  }, []);

  const submitForm = useCallback(
    async (e) => {
      e.preventDefault();
      clearError();
      const payload = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        nationality: formData.nationality,
      };
      const res = await register(payload);
      if (res.success) setStep(STEP_VERIFY); // store already filled tempRegister
    },
    [formData, register, clearError]
  );

  const goBackToForm = useCallback(() => {
    clearError();
    setStep(STEP_FORM);
  }, [clearError]);

  const onVerifySuccess = useCallback(() => setStep(STEP_SUCCESS), []);

  /* ---------- render ---------- */
  const steps = [
    { id: STEP_FORM, label: "Account", description: "Create your account" },
    { id: STEP_VERIFY, label: "Verify Email", description: "Verify your email address" },
    { id: STEP_SUCCESS, label: "Success", description: "Account created successfully" },
  ];

  return (
    <div className="flex bg-[#F7F5F9] w-full h-screen justify-center overflow-hidden md:px-6 md:py-4 rounded-2xl">
      <div className="flex max-w-screen-2xl w-full h-full rounded-xl overflow-hidden">
        {/* Left illustration panel */}
        <div className="hidden lg:flex w-1/2 bg-[#F8EACD] rounded-xl p-6 items-center justify-center">
          <div className="w-full flex flex-col items-center">
            <img src={loginlogo} alt="Register" className="rounded-lg w-full h-auto max-h-[400px] object-contain" />
            <div className="bg-gradient-to-br max-w-lg from-[#FAF3E8] to-[#F8EACD] mt-4 p-4 rounded-2xl shadow-sm text-center">
              <h1 className="text-3xl font-semibold text-[#2D0D23] mb-1">Share Expenses & Resources in Real Time</h1>
              <p className="text-xl font-medium text-[#4B4B4B] leading-relaxed">Connect with students, travelers, and locals to effortlessly manage costs and resources.</p>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex flex-1 flex-col items-center p-3 sm:p-5 overflow-y-auto">
          <div className="w-full mb-4 flex justify-center md:justify-start items-center md:items-start">
            <img src={logo} alt="Logo" className="h-10 md:h-12" />
          </div>

          <div className="w-full max-w-2xl p-5 rounded-xl shadow-none md:shadow-md border-none md:border border-gray-100 bg-white">
            {/* Stepper */}
            <div className="w-full flex flex-col items-center py-4 mb-4">
              <div className="flex items-center gap-2 justify-center mb-2">
                {steps.map((s, i) => (
                  <div key={s.id} className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step >= s.id ? "bg-green-600 border-green-600 text-white" : "bg-white border-gray-300 text-gray-400"}`}>{s.id}</div>
                    {i < steps.length - 1 && <div className={`w-16 md:w-24 lg:w-32 border-t-2 mx-2 ${step > s.id ? "border-green-600" : "border-gray-300"}`}></div>}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 text-center">{steps.find((s) => s.id === step)?.description}</p>
            </div>

            {step === STEP_FORM && (
              <RegistrationForm
                formData={formData}
                handleInputChange={updateForm}
                handleFormSubmit={submitForm}
                handleSocialRegister={(p) => clearError() & alert(`${p} registration coming soon!`)}
                loading={false}
                error={error}
              />
            )}

            {step === STEP_VERIFY && (
              <EmailVerificationStep
                email={tempRegister.email}
                userId={tempRegister.userId}
                onBack={goBackToForm}
                onSuccess={onVerifySuccess}
              />
            )}

            {step === STEP_SUCCESS && <Successful />}
          </div>
        </div>
      </div>
    </div>
  );
}