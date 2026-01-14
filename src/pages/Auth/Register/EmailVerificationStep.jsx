// src/pages/Register/EmailVerificationStep.jsx
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Mail, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';

export default function EmailVerificationStep({ onVerify, onResend, onBack, isLoading }) {
  const { tempRegister, error: storeError } = useAuthStore();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(180);
  const [resendLoading, setResendLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const inputRefs = useRef([]);

  // Get data from store instead of props
  const email = tempRegister?.email;
  const userId = tempRegister?.userId;

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    // Clear local error when store error changes
    if (storeError) setLocalError(storeError);
  }, [storeError]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setLocalError('');
    
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text/plain').trim();
    if (/^\d{6}$/.test(pasted)) {
      setOtp(pasted.split(''));
      setLocalError('');
    }
  };

  const handleVerifyClick = () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setLocalError('Please enter the complete 6-digit code.');
      return;
    }
    // Call the parent handler with OTP
    onVerify(otpCode);
  };

  const handleResend = async () => {
    if (timer > 0) return;
    
    if (!userId) {
      setLocalError('Cannot resend OTP. User ID is missing.');
      return;
    }

    setResendLoading(true);
    setLocalError('');
    
    try {
      await onResend();
      setTimer(180);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setLocalError(err.message || 'Failed to resend OTP.');
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds) =>
    `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

  // Show verification button states
  const canVerify = otp.every(d => d !== '') && !isLoading;
  const verifyButtonText = isLoading ? 'Verifying...' : 'Verify Email';

  return (
    <div className="flex flex-col items-center gap-5 py-8 relative w-full">
      <button
        onClick={onBack}
        disabled={isLoading}
        className="absolute left-4 top-4 text-gray-600 hover:text-green-600 transition disabled:opacity-50"
        aria-label="Go back"
      >
        <ArrowLeft size={28} />
      </button>

      <h2 className="text-xl font-bold text-gray-800 mt-8">Verify Your Email</h2>
      
      <p className="text-gray-500 text-sm text-center max-w-xs">
        Enter the code sent to{' '}
        <span className="text-green-600 font-medium break-all">
          {email}
        </span>
      </p>

      <div className="bg-[#1F82250D] rounded-full w-14 h-14 flex items-center justify-center">
        <Mail className="text-[#1F8225]" size={24} />
      </div>

      <div className="flex gap-2 mt-2" onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={el => inputRefs.current[index] = el}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={isLoading}
            className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none disabled:opacity-50"
            autoFocus={index === 0}
          />
        ))}
      </div>

      {/* Error Display */}
      {(localError || storeError) && (
        <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
          <AlertCircle size={16} />
          <span>{localError || storeError}</span>
        </div>
      )}

      {/* Timer / Resend */}
      <div className="text-center mt-4">
        {timer > 0 ? (
          <p className="text-sm text-gray-600">
            Resend code in <span className="font-semibold">{formatTime(timer)}</span>
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading || isLoading}
            className="text-green-600 hover:text-green-700 font-medium text-sm disabled:opacity-50"
          >
            {resendLoading ? 'Resending...' : 'Resend Code'}
          </button>
        )}
      </div>

      {/* VERIFY BUTTON - NEW! */}
      <button
        type="button"
        onClick={handleVerifyClick}
        disabled={!canVerify}
        className={`mt-6 px-8 py-3 rounded-lg font-semibold transition-all ${
          canVerify 
            ? 'bg-green-600 text-white hover:bg-green-700 active:scale-[0.98]' 
            : 'bg-greeen-500 text-gray-500 cursor-not-allowed'
        }`}
      >
        {verifyButtonText}
      </button>
    </div>
  );
}