import { useEffect, useRef, useState } from 'react';
import { authService } from '../../../services/authApi';
import { ArrowLeft, Mail, AlertCircle, Info } from 'lucide-react';

export default function EmailVerificationStep({
  email,
  userId,
  onBack,
  onSuccess,
  onVerificationFailed,
}) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(180);
  const [backendError, setBackendError] = useState(null); // Store backend error details
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (newOtp.every((d) => d !== '')) handleVerify(newOtp.join(''));
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
      const digits = pasted.split('');
      setOtp(digits);
      setError('');
      handleVerify(pasted);
    }
  };

  const handleVerify = async (code = null) => {
    const codeStr = code || otp.join('');
    if (codeStr.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    setError('');
    setBackendError(null);

    try {
      const res = await authService.verifyOTP(email, codeStr);
      if (res.success) {
        onSuccess();
      } else {
        const msg = res.data?.message || 'Invalid OTP';
        setError(msg);
        setBackendError(res.data); // Show backend details
        onVerificationFailed?.(msg);
      }
    } catch (err) {
      console.error('OTP verify error:', err);
      const msg = 'Verification failed';
      setError(msg);
      setBackendError({ error: err.message });
      onVerificationFailed?.(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setResendLoading(true);
    setError('');
    setBackendError(null);
    
    try {
      console.log(' Resending OTP for user ID:', userId);
      const res = await authService.resendOTP(userId);
      
      if (res.success) {
        setTimer(180);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(res.data?.message || 'Could not resend OTP');
        setBackendError(res.data);
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError('Failed to resend OTP. Try again.');
      setBackendError({ error: err.message });
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds) =>
    `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col items-center gap-5 py-8 relative w-full">
      {/* Back Button */}
      <button
        onClick={onBack}
        disabled={loading}
        className="absolute left-4 top-4 text-gray-600 hover:text-green-600 transition disabled:opacity-50"
        aria-label="Go back"
      >
        <ArrowLeft size={28} />
      </button>

      <h2 className="text-xl font-bold text-gray-800 mt-8">Verify Your Email</h2>
      
      {/* Backend Error Info (for debugging) */}
      {backendError && (
        <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs p-3 rounded-lg max-w-xs">
          <Info size={14} className="mt-0.5" />
          <div>
            <p className="font-medium">Backend Response:</p>
            <p className="mt-1">{JSON.stringify(backendError)}</p>
          </div>
        </div>
      )}

      <p className="text-gray-500 text-sm text-center max-w-xs">
        Enter the code sent to <span className="text-green-600 font-medium break-all">{email}</span>
      </p>

      <div className="bg-[#1F82250D] rounded-full w-14 h-14 flex items-center justify-center">
        <Mail className="text-[#1F8225]" size={24} />
      </div>

      <div className="flex gap-2 mt-2" onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`otp-${index}`}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={loading}
            className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none disabled:opacity-50"
            autoFocus={index === 0}
            aria-label={`OTP digit ${index + 1}`}
          />
        ))}
      </div>

      <div className="text-center mt-4">
        {timer > 0 ? (
          <p className="text-sm text-gray-600">
            Resend code in <span className="font-semibold">{formatTime(timer)}</span>
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
                <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                Resending...
              </span>
            ) : (
              'Resend Code'
            )}
          </button>
        )}
      </div>

      {error && <p className="text-red-600 text-sm text-center max-w-xs mt-2">{error}</p>}

      <button
        type="button"
        disabled={loading || otp.some((d) => d === '')}
        onClick={() => handleVerify()}
        className={`w-full bg-green-600 text-white py-3 rounded-lg font-semibold mt-4 ${
          loading || otp.some((d) => d === '') ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
        }`}
      >
        {loading ? (
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