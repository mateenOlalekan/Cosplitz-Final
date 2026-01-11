import { useState, useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "../../../store/authStore";
import { ArrowLeft, Mail } from "lucide-react";
import { z } from "zod";

const otpSchema = z.string().length(6).regex(/^\d+$/);

export default function EmailVerificationStep({ email, userId, onBack, onSuccess }) {
  const { verifyOTP, resendOTP, isLoading, error, setError, clearError } = useAuthStore();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(180);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  /* ---------- countdown ---------- */
  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  /* ---------- focus first input ---------- */
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  /* ---------- submit ---------- */
  const handleSubmit = useCallback(
    async (code) => {
      try {
        otpSchema.parse(code);
      } catch (e) {
        return setError(e.errors?.[0]?.message || "Invalid OTP");
      }
      clearError();
      const res = await verifyOTP(email, code);
      if (res.success) return onSuccess();
      setError(res.error || "Verification failed");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    },
    [email, verifyOTP, onSuccess, setError, clearError]
  );

  /* ---------- OTP helpers ---------- */
  const handleChange = useCallback(
    (val, idx) => {
      if (!/^[0-9]?$/.test(val)) return;
      const newOtp = [...otp];
      newOtp[idx] = val;
      setOtp(newOtp);
      if (error) clearError();
      if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
      if (newOtp.every(Boolean)) handleSubmit(newOtp.join(""));
    },
    [otp, error, clearError, handleSubmit]
  );

  const handleKeyDown = useCallback(
    (idx, e) => {
      if (e.key === "Backspace" && !otp[idx] && idx > 0) inputRefs.current[idx - 1]?.focus();
    },
    [otp]
  );

  const handlePaste = useCallback(
    (e) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").trim();
      if (/^\d{6}$/.test(pasted)) {
        setOtp(pasted.split(""));
        if (error) clearError();
        handleSubmit(pasted);
      } else {
        setError("Paste a valid 6-digit code");
      }
    },
    [error, clearError, setError, handleSubmit]
  );

  /* ---------- resend ---------- */
  const handleResend = useCallback(async () => {
    if (timer > 0) return;
    setResending(true);
    const res = await resendOTP(userId);
    if (res.success) {
      setTimer(180);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } else setError(res.error || "Could not resend");
    setResending(false);
  }, [timer, userId, resendOTP, setError]);

  const formatTime = (t) => `${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, "0")}`;

  return (
    <div className="flex flex-col items-center gap-5 py-8 relative w-full">
      <button onClick={onBack} className="absolute left-4 top-4 text-gray-600 hover:text-green-600 transition-colors disabled:opacity-50" disabled={isLoading} aria-label="Go back">
        <ArrowLeft size={28} />
      </button>

      <h2 className="text-xl font-bold text-gray-800 mt-8">Verify Your Email</h2>
      <p className="text-gray-500 text-sm text-center max-w-xs">
        Enter the 6-digit code sent to <span className="text-green-600 font-medium">{email}</span>
      </p>

      <div className="bg-[#1F82250D] rounded-full w-14 h-14 flex items-center justify-center">
        <Mail className="text-[#1F8225]" size={24} />
      </div>

      <div className="flex gap-2 mt-2" onPaste={handlePaste}>
        {otp.map((d, i) => (
          <input
            key={i}
            ref={(el) => (inputRefs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            disabled={isLoading}
            onChange={(e) => handleChange(e.target.value, i)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`w-10 h-10 sm:w-12 sm:h-12 text-center text-lg font-bold border-2 rounded-lg outline-none transition-all ${
              error ? "border-red-400 focus:ring-2 focus:ring-red-300" : "border-gray-300 focus:ring-2 focus:ring-green-600"
            } disabled:opacity-50`}
            autoComplete="off"
            aria-label={`Digit ${i + 1}`}
          />
        ))}
      </div>

      <div className="text-center mt-4">
        {timer > 0 ? (
          <p className="text-sm text-gray-600">
            Resend code in <span className="font-semibold text-green-600">{formatTime(timer)}</span>
          </p>
        ) : (
          <button type="button" onClick={handleResend} disabled={resending} className="text-green-600 hover:text-green-700 font-medium text-sm disabled:opacity-50">
            {resending ? (
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                Resending...
              </span>
            ) : (
              "Resend Code"
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg text-center max-w-xs mt-2">{error}</div>
      )}

      <button
        type="button"
        onClick={() => handleSubmit(otp.join(""))}
        disabled={isLoading || otp.some((d) => !d)}
        className={`w-full py-3 rounded-lg font-semibold mt-4 transition-all ${
          isLoading || otp.some((d) => !d) ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-700 active:scale-[0.98]"
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Verifying...
          </span>
        ) : (
          "Verify Email"
        )}
      </button>
    </div>
  );
}