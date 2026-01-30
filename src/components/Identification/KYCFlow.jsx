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
    { id: 1, label: "Personal Info", icon: Shield },
    { id: 2, label: "Proof Address", icon: Shield },
    { id: 3, label: "Upload Document", icon: Shield },
    { id: 4, label: "Confirmation", icon: CheckCircle }
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col items-center justify-center md:py-10 md:px-4">
      {/* Main Container */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Shield className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">KYC Verification</h1>
                <p className="text-green-100 text-sm">Complete your identity verification in 4 simple steps</p>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="text-white text-sm font-medium">
                  Step {step} of {steps.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar Section */}
        <div className="px-6 py-8 border-b border-gray-100">
          <div className="w-full relative">
            {/* Progress Line */}
            <div className="absolute left-0 right-0 top-1/2 h-2 bg-gray-200 rounded-full -z-10"></div>
            <motion.div
              className="absolute left-0 top-1/2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full -z-10"
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
                      className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
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
                        <CheckCircle className="text-white w-6 h-6" />
                      ) : (
                        <div className={`font-semibold ${isCurrent ? "text-green-600" : "text-gray-400"}`}>
                          {isCurrent ? <Icon className="w-5 h-5" /> : s.id}
                        </div>
                      )}
                    </motion.div>
                    <div className="mt-3 text-center">
                      <p className={`text-xs font-medium ${
                        isCompleted
                          ? "text-green-600"
                          : isCurrent
                          ? "text-gray-900 font-semibold"
                          : "text-gray-500"
                      }`}>
                        {s.label}
                      </p>
                      {isCurrent && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-green-600 mt-1"
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
        <div className="p-6 md:p-8">
          {step === 1 && <PersonalInfoPage next={next} />}
          {step === 2 && <ProofOfAddress next={next} prev={prev} />}
          {step === 3 && <UploadDocument next={next} prev={prev} />}
          {step === 4 && <KYCConfirmation prev={prev} />}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield size={14} />
              <span>Your information is secured with 256-bit SSL encryption</span>
            </div>
            <div className="mt-2 md:mt-0">
              <span>© 2024 Verification Platform • </span>
              <a href="#" className="text-green-600 hover:text-green-700 font-medium">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KYCFlow;