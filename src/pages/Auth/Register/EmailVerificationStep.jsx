// EmailVerificationStep.jsx - FIXED
import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../../../store/authStore";
import { ArrowLeft, Mail } from "lucide-react";

export default function EmailVerificationStep({
  email,
  userId,
  onBack,
  onSuccess,
  onVerificationFailed,
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(180);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef([]);

  const { 
    verifyOTP,
    resendOTP,
    clearError,
    tempRegister,
    isLoading: storeLoading 
  } = useAuthStore();

  // Use store's tempRegister if available
  const effectiveEmail = tempRegister?.email || email;
  const effectiveUserId = tempRegister?.userId || userId;

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((t) => Math.max(0, t - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");
    clearError();

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((d) => d !== "")) {
      handleAutoVerify(newOtp.join(""));
    }
  };

  const handleAutoVerify = async (otpCode) => {
    if (!effectiveEmail || !effectiveUserId) {
      setError("Missing email or user ID. Please try again.");
      return;
    }

    setIsVerifying(true);
    const result = await verifyOTP(effectiveUserId, otpCode); // Use user_id as identifier
    
    if (result.success) {
      setOtp(["", "", "", "", "", ""]);
      onSuccess?.();
    } else {
      setError(result.error || "Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      onVerificationFailed?.(result.error);
    }
    setIsVerifying(false);
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text/plain").trim();

    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split("");
      setOtp(digits);
      setError("");
      inputRefs.current[5]?.focus();
      handleAutoVerify(pasted);
    } else {
      setError("Please paste a valid 6-digit code.");
    }
  };

  const handleManualVerify = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    if (!effectiveEmail || !effectiveUserId) {
      setError("Missing email or user ID. Please try again.");
      return;
    }

    setIsVerifying(true);
    const result = await verifyOTP(effectiveUserId, otpCode); // Use user_id as identifier
    
    if (result.success) {
      setOtp(["", "", "", "", "", ""]);
      onSuccess?.();
    } else {
      setError(result.error || "Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
    setIsVerifying(false);
  };

  const handleResend = async () => {
    if (timer > 0) return;

    if (!effectiveUserId) {
      setError("Cannot resend OTP. User ID is missing.");
      return;
    }

    setError("");
    clearError();

    const result = await resendOTP(effectiveUserId);
    
    if (result.success) {
      setTimer(180);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } else {
      setError(result.error || "Failed to resend OTP. Please try again.");
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const isComplete = otp.every((d) => d !== "");
  const loading = storeLoading || isVerifying;

  return (
    <div className="flex flex-col items-center gap-5 py-8 relative w-full">
      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute left-4 top-4 text-gray-600 hover:text-green-600 transition-colors disabled:opacity-50"
        type="button"
        disabled={loading}
        aria-label="Go back"
      >
        <ArrowLeft size={28} />
      </button>

      {/* Header */}
      <h2 className="text-xl font-bold text-gray-800 mt-8">Verify Your Email</h2>
      <p className="text-gray-500 text-sm text-center max-w-xs">
        Enter the 6-digit code sent to{" "}
        <span className="text-green-600 font-medium">{effectiveEmail}</span>
      </p>

      {/* Mail icon */}
      <div className="bg-[#1F82250D] rounded-full w-14 h-14 flex items-center justify-center">
        <Mail className="text-[#1F8225]" size={24} />
      </div>

      {/* OTP input fields */}
      <div className="flex gap-2 mt-2" onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (inputRefs.current[i] = el)}
            type="text"
            maxLength={1}
            inputMode="numeric"
            pattern="[0-9]*"
            value={digit}
            onChange={(e) => handleChange(e.target.value, i)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={loading}
            className={`w-10 h-10 sm:w-12 sm:h-12 text-center text-lg font-bold border-2 rounded-lg outline-none transition-all ${
              error 
                ? "border-red-400 focus:ring-2 focus:ring-red-300" 
                : "border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-green-600"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            autoComplete="off"
            aria-label={`Digit ${i + 1}`}
          />
        ))}
      </div>

      {/* Timer / Resend */}
      <div className="text-center mt-4">
        {timer > 0 ? (
          <p className="text-sm text-gray-600">
            Resend code in{" "}
            <span className="font-semibold text-green-600">{formatTime(timer)}</span>
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="text-green-600 hover:text-green-700 font-medium text-sm transition-colors disabled:opacity-50"
          >
            Resend Code
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg text-center max-w-xs mt-2">
          {error}
        </div>
      )}

      {/* Verify button */}
      <button
        type="button"
        disabled={loading || !isComplete}
        onClick={handleManualVerify}
        className={`w-full py-3 rounded-lg font-semibold mt-4 transition-all ${
          loading || !isComplete
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-green-600 text-white hover:bg-green-700 active:scale-[0.98]"
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Verifying...
          </span>
        ) : (
          "Verify Email"
        )}
      </button>
    </div>
  );
}