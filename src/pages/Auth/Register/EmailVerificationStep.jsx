import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Mail, AlertCircle } from 'lucide-react';

const OTP_DURATION = 180; // ✅ 3 minutes

export default function EmailVerificationStep({
  email,
  onVerify,
  onResend,
  onBack,
  isLoading
}) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(OTP_DURATION);
  const [localError, setLocalError] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const inputRefs = useRef([]);
  const intervalRef = useRef(null);

  // ✅ Timer logic (safe + clean)
  useEffect(() => {
    if (timer === 0) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [timer]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    setLocalError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (updated.every(d => d !== '')) {
      handleVerifyClick(updated.join(''));
    }
  };

  const handleVerifyClick = async (code) => {
    if (verificationLoading || isLoading) return;

    const otpCode = code || otp.join('');

    if (otpCode.length !== 6) {
      setLocalError('Enter full 6 digit code');
      return;
    }

    setVerificationLoading(true);
    const res = await onVerify(otpCode);

    if (!res.success) {
      setLocalError(res.message || 'Invalid code');
    }

    setVerificationLoading(false);
  };

  const handleResendClick = async () => {
    if (timer > 0) return;

    setResendLoading(true);
    await onResend();

    setOtp(['', '', '', '', '', '']);
    setTimer(OTP_DURATION); // ✅ reset to 3 minutes

    setResendLoading(false);
  };

  const formatTime = (sec) =>
    `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col items-center gap-4 py-6">

      <button onClick={onBack} className="self-start text-gray-600 hover:text-green-600">
        <ArrowLeft />
      </button>

      <h2 className="text-xl font-bold">Verify Your Email</h2>

      <p className="text-gray-500 text-sm">
        Code sent to <span className="text-green-600">{email}</span>
      </p>

      <div className="bg-green-100 p-4 rounded-full">
        <Mail className="text-green-600" />
      </div>

      <div className="flex gap-2">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={el => (inputRefs.current[i] = el)}
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target.value, i)}
            className="w-12 h-12 text-center border rounded-lg text-lg"
          />
        ))}
      </div>

      {localError && (
        <div className="flex items-center gap-1 text-red-600 text-sm">
          <AlertCircle size={16} /> {localError}
        </div>
      )}

      <div className="text-sm text-gray-500">
        {timer > 0 ? (
          `Resend in ${formatTime(timer)}`
        ) : (
          <button
            onClick={handleResendClick}
            disabled={resendLoading}
            className="text-green-600"
          >
            {resendLoading ? 'Resending...' : 'Resend Code'}
          </button>
        )}
      </div>

      <button
        onClick={() => handleVerifyClick()}
        disabled={verificationLoading}
        className="bg-green-600 text-white px-8 py-3 rounded-lg"
      >
        {verificationLoading ? 'Verifying...' : 'Verify Email'}
      </button>
    </div>
  );
}
