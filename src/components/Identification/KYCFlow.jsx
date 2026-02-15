import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, CheckCircle } from "lucide-react";
import PersonalInfoPage from "./PersonalInfo";
import ProofOfAddress from "./ProofOfAddress";
import UploadDocument from "./UploadDocument";
import KYCConfirmation from "./KYCConfirmation";

function KYCFlow() {
  const [step, setStep] = useState(1);

  const next = () => step < 4 && setStep(step + 1);
  const prev = () => step > 1 && setStep(step - 1);

  const steps = [
    { id: 1, label: "Personal Info", shortLabel: "Personal", icon: Shield },
    { id: 2, label: "Proof Address", shortLabel: "Address", icon: Shield },
    { id: 3, label: "Upload Document", shortLabel: "Documents", icon: Shield },
    { id: 4, label: "Confirmation", shortLabel: "Done", icon: CheckCircle }
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col items-center justify-start md:justify-center md:py-4 px-0 md:px-4">
      {/* Main Container */}
      <div className="w-full max-w-4xl bg-white md:shadow-2xl overflow-hidden md:border border-gray-100 md:rounded-2xl min-h-screen md:min-h-0">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-white/20 p-1.5 sm:p-2 rounded-lg backdrop-blur-sm">
                <Shield className="text-white" size={18} />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-white">KYC Verification</h1>
                <p className="text-green-100 text-xs sm:text-sm hidden sm:block">Complete your identity verification in 4 simple steps</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-4 sm:py-2">
              <span className="text-white text-xs sm:text-sm font-medium">
                {step}/{steps.length}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar Section */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-100 overflow-x-auto">
          <div className="w-full relative min-w-[280px]">
            {/* Progress Line */}
            <div className="absolute left-0 right-0 top-1/2 h-1.5 sm:h-2 bg-gray-200 rounded-full -z-10"></div>
            <motion.div
              className="absolute left-0 top-1/2 h-1.5 sm:h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full -z-10"
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
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />

            {/* Steps */}
            <div className="relative flex justify-between">
              {steps.map((s) => {
                const isCompleted = step > s.id;
                const isCurrent = step === s.id;
                const Icon = s.icon;

                return (
                  <motion.div
                    key={s.id}
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: s.id * 0.1 }}
                  >
                    <motion.div
                      className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                        isCompleted
                          ? "bg-gradient-to-br from-green-500 to-emerald-500"
                          : isCurrent
                          ? "bg-white border-2 border-green-500"
                          : "bg-white border-2 border-gray-300"
                      }`}
                      animate={{
                        scale: isCurrent ? 1.1 : 1,
                        boxShadow: isCurrent ? "0 10px 25px rgba(34, 197, 94, 0.3)" : "0 4px 12px rgba(0, 0, 0, 0.1)"
                      }}
                      whileHover={{ scale: 1.05 }}
                    >
                      {isCompleted ? (
                        <CheckCircle className="text-white w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                        <div className={`font-semibold text-xs sm:text-sm ${isCurrent ? "text-green-600" : "text-gray-400"}`}>
                          {isCurrent ? <Icon className="w-3 h-3 sm:w-4 sm:h-4" /> : s.id}
                        </div>
                      )}
                    </motion.div>
                    <div className="mt-1.5 sm:mt-2 text-center">
                      <p className={`text-xs font-medium ${
                        isCompleted
                          ? "text-green-600"
                          : isCurrent
                          ? "text-gray-900 font-semibold"
                          : "text-gray-500"
                      }`}>
                        <span className="hidden sm:inline">{s.label}</span>
                        <span className="sm:hidden">{s.shortLabel}</span>
                      </p>
                      {isCurrent && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-green-600 mt-0.5 sm:mt-1 hidden sm:block"
                        >
                          Active
                        </motion.p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-0 sm:px-6 overflow-y-auto">
          {step === 1 && <PersonalInfoPage next={next} />}
          {step === 2 && <ProofOfAddress next={next} prev={prev} />}
          {step === 3 && <UploadDocument next={next} prev={prev} />}
          {step === 4 && <KYCConfirmation prev={prev} />}
        </div>
      </div>
    </div>
  );
}

export default KYCFlow;