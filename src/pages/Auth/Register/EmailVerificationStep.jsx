import { useState, useEffect, useRef } from "react";
import { authService } from "../../../services/authApi";
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
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(180); // 3 minutes
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef([]);

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
    // Only allow digits
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Move to next input if value entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify once all 6 digits are filled
    if (newOtp.every((d) => d !== "") && !isVerifying) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current is empty
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    // Move to next input on arrow right
    else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    // Move to previous input on arrow left
    else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text/plain").trim();

    // Validate pasted content is 6 digits
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split("");
      setOtp(digits);
      setError("");
      
      // Focus last input
      inputRefs.current[5]?.focus();
      
      // Auto-verify
      if (!isVerifying) {
        handleVerify(pasted);
      }
    } else {
      setError("Please paste a valid 6-digit code.");
    }
  };

  const handleVerify = async (code = null) => {
    const otpCode = code || otp.join("");

    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    if (!email || !userId) {
      setError("Missing email or user ID. Please try again.");
      return;
    }

    // Prevent multiple simultaneous verifications
    if (isVerifying) {
      console.log("Verification already in progress");
      return;
    }

    setIsVerifying(true);
    setLoading(true);
    setError("");

    try {
      console.log("Verifying OTP:", { email, code: otpCode });
      const response = await authService.verifyOTP(email, otpCode);
      
      console.log("OTP Verification Response:", response);

      if (response?.success) {
        console.log("OTP verified successfully");
        setError("");
        
        // Call success callback
        if (onSuccess) {
          onSuccess();
        }
      } else {
        // Handle verification failure
        const errorMsg = 
          response?.data?.message || 
          response?.data?.error ||
          "Invalid OTP. Please check the code and try again.";
        
        console.error("OTP verification failed:", errorMsg);
        setError(errorMsg);
        
        // Clear OTP fields on error
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        
        if (onVerificationFailed) {
          onVerificationFailed(errorMsg);
        }
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      const errorMsg = err.message || "Verification failed. Please try again.";
      setError(errorMsg);
      
      // Clear OTP fields on error
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      
      if (onVerificationFailed) {
        onVerificationFailed(errorMsg);
      }
    } finally {
      setLoading(false);
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;

    if (!userId) {
      setError("Cannot resend OTP. User ID is missing.");
      return;
    }

    setResendLoading(true);
    setError("");

    try {
      console.log("Resending OTP for user:", userId);
      const response = await authService.resendOTP(userId);
      
      if (response?.success) {
        console.log("OTP resent successfully");
        setTimer(180); // Reset timer to 3 minutes
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        
        // Show success feedback
        setError("");
      } else {
        const errorMsg = response?.data?.message || "Could not resend OTP. Please try again.";
        console.error("OTP resend failed:", errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.error("OTP resend error:", err);
      setError(err.message || "Failed to resend OTP. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="flex flex-col items-center gap-5 py-4 relative w-full">
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
        <span className="text-green-600 font-medium">{email}</span>
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
            id={`otp-input-${i}`}
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
            disabled={resendLoading}
            className="text-green-600 hover:text-green-700 font-medium text-sm transition-colors disabled:opacity-50"
          >
            {resendLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                Resending...
              </span>
            ) : (
              "Resend Code"
            )}
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
        disabled={loading || otp.some((d) => d === "")}
        onClick={() => handleVerify()}
        className={`w-full py-3 rounded-lg font-semibold mt-2 transition-all ${
          loading || otp.some((d) => d === "")
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