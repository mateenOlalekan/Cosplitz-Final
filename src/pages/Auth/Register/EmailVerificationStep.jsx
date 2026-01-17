import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Mail, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';

export default function EmailVerificationStep({ onVerify, onResend, onBack, isLoading }) {
  const { tempRegister, error: storeError, clearIncompleteRegistration } = useAuthStore();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(180);
  const [resendLoading, setResendLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const inputRefs = useRef([]);
  const isMounted = useRef(true);
  const email = tempRegister?.email;
  const userId = tempRegister?.userId;

  useEffect(() => {
    console.log('[DEBUG] useEffect - Checking tempRegister:', tempRegister);
    if (!tempRegister?.email && isMounted.current) {
      console.warn('[DEBUG] No valid temp registration data found, redirecting back');
      setLocalError('No registration data found. Please register again.');
      onBack();
    }
  }, [tempRegister, onBack]);

  useEffect(() => {
    isMounted.current = true;
    const interval = setInterval(() => {
      if (isMounted.current) {
        setTimer(t => (t <= 1 ? 0 : t - 1));
      }
    }, 1000);
    return () => {
      clearInterval(interval);
      isMounted.current = false;
    };
  }, []);

  // Store error → local error with better handling
  useEffect(() => {
    console.log('[DEBUG] useEffect - storeError changed:', storeError);
    if (storeError && isMounted.current) {
      setLocalError(storeError);
      setVerificationLoading(false);
    }
  }, [storeError]);

  // Clear error on typing
  useEffect(() => {
    if (otp.every(d => d !== '') && localError) {
      setLocalError('');
    }
  }, [otp, localError]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setLocalError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when complete
    if (newOtp.every(d => d !== '') && !isLoading && !verificationLoading) {
      console.log('[DEBUG] Auto-verifying OTP:', newOtp.join(''));
      handleVerifyClick(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text/plain').trim();
    console.log('[DEBUG] Pasted OTP:', pasted);

    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split('');
      setOtp(digits);
      setLocalError('');

      if (!isLoading && !verificationLoading) {
        handleVerifyClick(pasted);
      }
    }
  };

  const handleVerifyClick = async (code = null) => {
    console.log('[DEBUG] handleVerifyClick called with code:', code);
    
    if (isLoading || verificationLoading) {
      console.log('[DEBUG] Already loading, skipping');
      return;
    }

    const otpCode = code || otp.join('');
    console.log('[DEBUG] OTP to verify:', otpCode);

    if (otpCode.length !== 6) {
      setLocalError('Please enter the complete 6-digit code.');
      return;
    }

    if (!email) {
      console.error('[DEBUG] Missing email:', { email, userId });
      setLocalError('Missing email information. Please register again.');
      return;
    }

    setLocalError('');
    setVerificationLoading(true);
    console.log('[DEBUG] Calling onVerify with OTP...');

    try {
      const result = await onVerify(otpCode);
      console.log('[DEBUG] onVerify result:', result);
      
      if (isMounted.current) {
        setVerificationLoading(false);
      }
      return result;
    } catch (err) {
      console.error('[DEBUG] Verify error:', err);
      if (isMounted.current) {
        setVerificationLoading(false);
        setLocalError('Verification failed. Please try again.');
      }
      return false;
    }
  };

  const handleResend = async () => {
    console.log('[DEBUG] handleResend called');
    if (timer > 0 || isLoading || resendLoading) {
      console.log('[DEBUG] Cannot resend - timer:', timer, 'isLoading:', isLoading);
      return;
    }
    if (!email) {
      setLocalError('Cannot resend OTP. Email is missing.');
      return;
    }

    setResendLoading(true);
    setLocalError('');
    console.log('[DEBUG] Calling onResend...');

    try {
      const result = await onResend();
      console.log('[DEBUG] onResend result:', result);
      
      if (isMounted.current) {
        setTimer(180);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error('[DEBUG] Resend error:', err);
      if (isMounted.current) {
        setLocalError(err.message || 'Failed to resend OTP.');
      }
    } finally {
      if (isMounted.current) {
        setResendLoading(false);
      }
    }
  };

  const handleBackClick = () => {
    clearIncompleteRegistration();
    onBack();
  };

  const formatTime = (seconds) =>
    `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

  const canVerify = otp.every(d => d !== '') && !isLoading && !verificationLoading;
  const verifyButtonText = verificationLoading ? 'Verifying...' : 'Verify Email';

  return (
    <div className="flex flex-col items-center gap-5 py-4 relative w-full"> 
      <div className='flex flex-col justify-center items-center max-w-xl gap-4'>
        <button
          onClick={handleBackClick}
          disabled={isLoading || verificationLoading}
          className="absolute left-4 top-4 text-gray-600 hover:text-green-600 transition disabled:opacity-50"
        >
          <ArrowLeft size={28} />
        </button>

        <h2 className="text-xl font-bold text-gray-800 mt-4">Verify Your Email</h2>

        <p className="text-gray-500 text-sm text-center max-w-xs">
          Enter the code sent to{' '}
          <span className="text-green-600 font-medium break-all">
            {email || 'your email'}
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
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={isLoading || verificationLoading}
              className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none disabled:opacity-50 transition-all"
            />
          ))}
        </div>

        {(localError || storeError) && (
          <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
            <AlertCircle size={16} />
            <span>{localError || storeError}</span>
          </div>
        )}

        <div className="text-center mt-4">
          {timer > 0 ? (
            <p className="text-sm text-gray-600">
              Resend code in <span className="font-semibold">{formatTime(timer)}</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading || isLoading || verificationLoading}
              className="text-green-600 hover:text-green-700 font-medium text-sm disabled:opacity-50 transition-colors"
            >
              {resendLoading ? 'Resending...' : 'Resend Code'}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => handleVerifyClick()}
          disabled={!canVerify}
          className={`mt-6 px-8 py-3 rounded-lg font-semibold transition-all text-white w-full flex items-center justify-center gap-2 ${
            canVerify ? 'bg-green-600 hover:bg-green-700 active:scale-[0.98]' : 'bg-green-500 cursor-not-allowed'
          }`}
        >
          {verificationLoading && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          {verifyButtonText}
        </button>
      </div>
    </div>
  );
}