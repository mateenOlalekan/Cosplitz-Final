// src/pages/KYC/KYCFlow.jsx
// REFACTORED - Tracks completion and navigates to dashboard

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PersonalInfoPage from "./PersonalInfo";
import ProofOfAddress from "./ProofOfAddress";
import UploadDocument from "./UploadDocument";
import KYCConfirmation from "./KYCConfirmation";
import { motion } from "framer-motion";
import { useCompleteKYC } from "../../services/queries/auth";

function KYCFlow() {
  const navigate = useNavigate();
  const completeKYC = useCompleteKYC();
  
  const [step, setStep] = useState(1);
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    nationality: "",
  });
  const [proofOfAddress, setProofOfAddress] = useState({
    city: "",
    district: "",
    fullAddress: "",
  });
  const [files, setFiles] = useState({
    driversId: null,
    passport: null,
    nationalId: null,
  });

  const next = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else if (step === 4) {
      // Save KYC data and complete the flow
      const kycData = {
        personalInfo,
        proofOfAddress,
        files: {
          driversId: files.driversId?.name,
          passport: files.passport?.name,
          nationalId: files.nationalId?.name,
        },
        submittedAt: new Date().toISOString(),
        status: 'pending',
      };
      
      try {
        // Mark KYC as complete
        await completeKYC.mutateAsync(kycData);
        
        console.log('✅ KYC completed, navigating to dashboard');
        
        // Navigate to dashboard
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1000);
      } catch (error) {
        console.error('❌ KYC completion failed:', error);
      }
    }
  };
  
  const prev = () => step > 1 && setStep(step - 1);

  const updatePersonalInfo = (field, value) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  const updateProofOfAddress = (field, value) => {
    setProofOfAddress(prev => ({ ...prev, [field]: value }));
  };

  const updateFiles = (field, value) => {
    setFiles(prev => ({ ...prev, [field]: value }));
  };

  const steps = [
    { id: 1, label: "Personal Info" },
    { id: 2, label: "Proof Address" },
    { id: 3, label: "Upload Document" },
  ];

  // Create dummy files for testing
  const createDummyFile = (name, type = 'application/pdf') => {
    return new File([new Blob(['dummy content'], { type })], name, { type });
  };

  const handleAutoFill = () => {
    if (step === 1) {
      setPersonalInfo({
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        nationality: "United States",
      });
    } else if (step === 2) {
      setProofOfAddress({
        city: "New York",
        district: "Manhattan",
        fullAddress: "123 Main St, Apt 4B, New York, NY 10001",
      });
    } else if (step === 3) {
      setFiles({
        driversId: createDummyFile("driver_license.pdf"),
        passport: createDummyFile("passport.pdf"),
        nationalId: createDummyFile("national_id.pdf"),
      });
    }
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center md:py-10 md:px-4">
      {/* Auto-fill button for testing */}
      {step < 4 && (
        <button
          onClick={handleAutoFill}
          className="mb-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
        >
          Auto-fill Step {step} (Test)
        </button>
      )}

      {/* ---- MAIN FORM ---- */}
      <div className="w-full max-w-xl rounded-2xl shadow-none md:shadow-xl border-none md:border-[1px] md:border-slate-200 p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col gap-2 my-6 md:mb-4 text-center">
          <h1 className="text-3xl sm:text-3xl md:text-4xl font-bold">
            {step === 4 ? 'Verification Complete' : 'Identification Page'}
          </h1>
          <p className="text-sm text-gray-600">
            {step === 4 ? 'Your submission is under review' : 'Verify your identity and get started'}
          </p>
        </div>

        {/* Progress Bar */}
        {step < 4 && (
          <div className="w-full mb-6 relative flex items-center justify-between">
            <div className="absolute left-0 right-0 top-1/2 h-4 bg-gray-300 -z-10"></div>

            <motion.div
              className="absolute left-0 top-1/2 h-4 bg-green-500 -z-10"
              initial={{ width: 0 }}
              animate={{
                width:
                  step === 1
                    ? "0%"
                    : step === 2
                    ? "33%"
                    : step === 3
                    ? "66%"
                    : "100%",
              }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />

            {steps.map((s) => (
              <motion.div
                key={s.id}
                className="flex flex-col items-center gap-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: s.id * 0.1 }}
              >
                <motion.div
                  className={`
                    w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-semibold
                    shadow-md
                    ${
                      step === s.id
                        ? "bg-green-600"
                        : step > s.id
                        ? "bg-green-400"
                        : "bg-gray-300"
                    }
                  `}
                  animate={{
                    scale: step === s.id ? 1.25 : 1,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 12,
                  }}
                >
                  {s.id}
                </motion.div>

                <p
                  className={`
                    text-[10px] font-medium
                    ${
                      step === s.id
                        ? "text-green-700"
                        : step > s.id
                        ? "text-green-500"
                        : "text-gray-400"
                    }
                  `}
                >
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>
        )}

        {step === 1 && (
          <PersonalInfoPage
            next={next}
            data={personalInfo}
            updateField={updatePersonalInfo}
          />
        )}
        {step === 2 && (
          <ProofOfAddress
            next={next}
            prev={prev}
            data={proofOfAddress}
            updateField={updateProofOfAddress}
          />
        )}
        {step === 3 && (
          <UploadDocument
            next={next}
            prev={prev}
            files={files}
            updateFiles={updateFiles}
          />
        )}
        {step === 4 && (
          <KYCConfirmation 
            prev={prev} 
            onDashboard={next}
            isLoading={completeKYC.isPending}
          />
        )}
      </div>
    </div>
  );
}

export default KYCFlow;