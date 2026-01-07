import { useState } from "react";
import PersonalInfoPage from "./PersonalInfo";
import ProofOfAddress from "./ProofOfAddress";
import UploadDocument from "./UploadDocument";
import KYCConfirmation from "./KYCConfirmation";
import { motion } from "framer-motion";

function KYCFlow() {
  const [step, setStep] = useState(1);

  const next = () => step < 4 && setStep(step + 1);
  const prev = () => step > 1 && setStep(step - 1);

  const steps = [
    { id: 1, label: "Personal Info" },
    { id: 2, label: "Proof Address" },
    { id: 3, label: "Upload Document" },
    
  ];

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center md:py-10 md:px-4">

      {/* ---- PROGRESS BAR ---- */}


      {/* ---- MAIN FORM ---- */}
      <div className="w-full max-w-xl b rounded-2xl shadow-none md:shadow-xl border-none md:border-[1px] md:border-slate-200 p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col gap-2 my-6 md:mb-4 text-center">
          <h1 className="text-3xl sm:text-3xl md:text-4xl font-bold">
            Identification Page
          </h1>
          <p className="text-sm text-gray-600">
            Verify your identity and get started
          </p>
        </div>

<div className="w-full mb-6 relative flex items-center justify-between">

  {/* --- GRAY BACKGROUND LINE --- */}
  <div className="absolute left-0 right-0 top-1/2 h-4 bg-gray-300 -z-10"></div>

  {/* --- GREEN PROGRESS LINE --- */}
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
          : "100%", // Step 4 complete
    }}
    transition={{ duration: 0.4, ease: "easeInOut" }}
  />

  {/* --- DOTS --- */}
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

        {step === 1 && <PersonalInfoPage next={next} />}
        {step === 2 && <ProofOfAddress next={next} prev={prev} />}
        {step === 3 && <UploadDocument next={next} prev={prev} />}
        {step === 4 && <KYCConfirmation prev={prev} />}
      </div>
    </div>
  );
}

export default KYCFlow;
