// src/pages/Auth/Register/EmailVerificationStep.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "../../../store/authStore";
import { ArrowLeft, Mail, RefreshCw } from "lucide-react";

const EmailVerificationStep = ({
  email,
  userId,
  onBack,
  onSuccess,
  onVerificationFailed,
}) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(180); // 3 minutes
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);

  const { 
    verifyOTP,
    resendOTP,
    clearError,
    tempRegister,
    isLoading: storeLoading 
  } = useAuthStore();

  const effectiveEmail = tempRegister?.email || email;
  const effectiveUserId = tempRegister?.userId || userId;

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => Math.max(0, prev - 1));
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
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");
    clearError();

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are filled
    if (newOtp.every(digit => digit !== "")) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleVerify = useCallback(async (otpCode) => {
    if (!effectiveEmail || !effectiveUserId) {
      setError("Verification data missing. Please try again.");
      return;
    }

    setIsVerifying(true);
    
    try {
      const result = await verifyOTP(effectiveUserId, otpCode);
      
      if (result.success) {
        setError("");
        onSuccess?.();
      } else {
        setError(result.error || "Invalid verification code. Please try again.");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        onVerificationFailed?.(result.error);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  }, [effectiveEmail, effectiveUserId, verifyOTP, onSuccess, onVerificationFailed]);

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
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
      handleVerify(pasted);
    } else {
      setError("Please paste a valid 6-digit code.");
    }
  };

  const handleResend = async () => {
    if (timer > 0 || !effectiveUserId) return;

    setIsResending(true);
    setError("");
    clearError();

    try {
      const result = await resendOTP(effectiveUserId);
      
      if (result.success) {
        setTimer(180);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        setError(result.error || "Failed to resend code. Please try again.");
      }
    } catch (err) {
      setError("Failed to resend verification code.");
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const isComplete = otp.every(digit => digit !== "");
  const loading = storeLoading || isVerifying;
  const canResend = timer === 0;

  return (
    <div className="flex flex-col items-center gap-5 py-8 px-4 relative w-full max-w-md mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute left-0 top-0 text-gray-600 hover:text-green-600 transition-colors disabled:opacity-50"
        type="button"
        disabled={loading}
        aria-label="Go back"
      >
        <ArrowLeft size={24} />
      </button>

      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
        <p className="text-gray-500 text-sm mt-2">
          Enter the 6-digit code sent to
        </p>
        <p className="text-green-600 font-medium mt-1">{effectiveEmail}</p>
      </div>

      {/* Mail icon */}
      <div className="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mt-2">
        <Mail className="text-green-600" size={28} />
      </div>

      {/* OTP input fields */}
      <div className="w-full mt-6">
        <label className="text-sm font-medium text-gray-700 mb-3 block text-center">
          Verification Code
        </label>
        <div className="flex justify-center gap-3" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength={1}
              inputMode="numeric"
              pattern="\d*"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={loading}
              className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg outline-none transition-all ${
                error 
                  ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200" 
                  : digit 
                  ? "border-green-500 focus:border-green-600 focus:ring-2 focus:ring-green-200"
                  : "border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              autoComplete="one-time-code"
              aria-label={`Digit ${index + 1} of verification code`}
            />
          ))}
        </div>
      </div>

      {/* Timer / Resend */}
      <div className="text-center mt-6">
        {timer > 0 ? (
          <p className="text-sm text-gray-600">
            You can request a new code in{" "}
            <span className="font-semibold text-green-600">{formatTime(timer)}</span>
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={loading || isResending}
            className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium text-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={isResending ? "animate-spin" : ""} />
            {isResending ? "Sending..." : "Resend Code"}
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="w-full mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center">
          {error}
        </div>
      )}

      {/* Verify button */}
      <button
        type="button"
        disabled={loading || !isComplete}
        onClick={() => handleVerify(otp.join(""))}
        className={`w-full py-3 rounded-lg font-semibold mt-6 transition-all ${
          loading || !isComplete
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-green-600 text-white hover:bg-green-700 active:scale-[0.98] shadow-sm"
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

      {/* Additional help text */}
      <p className="text-xs text-gray-400 text-center mt-4">
        Didn't receive the code? Check your spam folder or{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={!canResend || isResending}
          className="text-green-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          request a new one
        </button>
      </p>
    </div>
  );
};

export default EmailVerificationStep;