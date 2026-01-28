import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Mail, AlertCircle } from 'lucide-react';

export default function EmailVerificationStep({
  email,
  onVerify,
  onResend,
  onBack,
  isLoading
}) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(180); // 3 minutes
  const [localError, setLocalError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  
  const inputRefs = useRef([]);

  // Countdown timer - FIXED: Proper cleanup
  useEffect(() => {
    if (timer <= 0) return;
    
    const interval = setInterval(() => {
      setTimer(t => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (value, index) => {
    // Only allow digits
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setLocalError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (newOtp.every(d => d !== '') && !isLoading) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace to previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    
    // Check if pasted content is 6 digits
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split('');
      setOtp(digits);
      
      // Auto-submit
      if (!isLoading) {
        handleVerify(pasted);
      }
    }
  };

  const handleVerify = async (code) => {
    if (isLoading) return;
    
    const otpCode = code || otp.join('');
    
    if (otpCode.length !== 6) {
      setLocalError('Please enter all 6 digits');
      return;
    }

    try {
      const result = await onVerify(otpCode);
      
      // 🟢 ADD: Check result and show error
      if (!result.success) {
        setLocalError(result.error || 'Invalid verification code');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }
      
      // If success, UI will automatically move to next step
    } catch (error) {
      setLocalError(error?.message || 'Verification failed');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (timer > 0 || resendLoading || isLoading) return;
    
    setResendLoading(true);
    setLocalError('');
    
    try {
      const result = await onResend();
      
      if (result.success) {
        setTimer(180);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setLocalError(result.error || 'Failed to resend code');
      }
    } catch (error) {
      setLocalError(error?.message || 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-5 py-6 relative">
      
      {/* Back Button */}
      <button
        onClick={onBack}
        disabled={isLoading}
        className="absolute left-0 top-0 text-gray-600 hover:text-green-600 transition disabled:opacity-50"
      >
        <ArrowLeft size={28} />
      </button>

      {/* Header */}
      <h2 className="text-xl font-bold text-gray-800 mt-8">
        Verify Your Email
      </h2>

      <p className="text-gray-500 text-sm text-center max-w-xs">
        Enter the verification code sent to{' '}
        <span className="text-green-600 font-medium break-all">
          {email}
        </span>
      </p>

      {/* Icon */}
      <div className="bg-[#1F82250D] rounded-full w-14 h-14 flex items-center justify-center">
        <Mail className="text-[#1F8225]" size={24} />
      </div>

      {/* OTP Inputs */}
      <div 
        className="flex gap-2 mt-2"
        onPaste={handlePaste}
      >
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={el => inputRefs.current[index] = el}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={isLoading}
            className="w-12 h-12 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none disabled:opacity-50 transition-all"
          />
        ))}
      </div>

      {/* Error Message */}
      {localError && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle size={16} />
          <span>{localError}</span>
        </div>
      )}

      {/* Timer / Resend */}
      <div className="text-center">
        {timer > 0 ? (
          <p className="text-sm text-gray-600">
            Resend code in{' '}
            <span className="font-semibold">{formatTime(timer)}</span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={resendLoading || isLoading}
            className="text-green-600 hover:text-green-700 font-medium text-sm disabled:opacity-50 transition-colors"
          >
            {resendLoading ? 'Resending...' : 'Resend Code'}
          </button>
        )}
      </div>

      {/* Verify Button (manual fallback) */}
      <button
        onClick={() => handleVerify()}
        disabled={isLoading || otp.some(d => d === '')}
        className={`mt-4 px-8 py-3 rounded-lg font-semibold transition-all text-white w-full max-w-xs ${
          otp.every(d => d !== '') && !isLoading
            ? 'bg-green-600 hover:bg-green-700 active:scale-[0.98]' 
            : 'bg-green-400 cursor-not-allowed'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Verifying...
          </span>
        ) : (
          'Verify Email'
        )}
      </button>

    </div>
  );
}