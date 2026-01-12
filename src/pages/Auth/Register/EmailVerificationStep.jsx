import { useEffect, useState } from 'react';
import { authService } from '../../../services/authApi';
import { useAuthStore } from '../../../store/authStore';
import { ArrowLeft, Mail } from 'lucide-react';

export default function EmailVerificationStep({
  email,
  userId,
  onBack,
  onSuccess,
  onVerificationFailed,
}) {
  /* ---------- local state ---------- */
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(180); // 3-min cooldown

  const { clearError } = useAuthStore();

  /* ---------- countdown ---------- */
  useEffect(() => {
    if (timer <= 0) return;
    const i = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(i);
  }, [timer]);

  /* ---------- field change + auto-verify ---------- */
  const handleChange = (val, idx) => {
    if (!/^[0-9]?$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    setError('');

    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
    if (newOtp.every((d) => d !== '')) handleVerify(newOtp.join('')); // auto-submit when full
  };

  const handleKey = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0)
      document.getElementById(`otp-${idx - 1}`)?.focus();
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

  /* ---------- verify ---------- */
  const handleVerify = async (code = null) => {
    const codeStr = code || otp.join('');
    if (codeStr.length !== 6) return setError('Please enter the complete 6-digit code.');

    setLoading(true);
    setError('');
    clearError();

    try {
      const res = await authService.verifyOTP(email, codeStr);
      if (res?.success) {
        onSuccess(); // ← parent routes to Success page
      } else {
        const msg = res?.data?.message || 'Invalid OTP. Please try again.';
        setError(msg);
        onVerificationFailed?.(msg);
      }
    } catch (err) {
      console.error('OTP verify error', err);
      const msg = 'Verification failed. Please try again.';
      setError(msg);
      onVerificationFailed?.(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- resend ---------- */
  const handleResend = async () => {
    if (timer > 0) return;
    setResendLoading(true);
    setError('');
    try {
      const res = await authService.resendOTP(userId);
      if (res?.success) {
        setTimer(180);
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-0')?.focus();
      } else {
        setError(res?.data?.message || 'Could not resend OTP.');
      }
    } catch (err) {
      console.error('Resend error', err);
      setError('Failed to resend OTP. Try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const fmtTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col items-center gap-5 py-8 relative w-full">
      {/* back button */}
      <button onClick={onBack} disabled={loading} className="absolute left-4 top-4 text-gray-600 hover:text-green-600 transition disabled:opacity-50">
        <ArrowLeft size={28} />
      </button>

      <h2 className="text-xl font-bold text-gray-800 mt-8">Verify Your Email</h2>
      <p className="text-gray-500 text-sm text-center max-w-xs">
        Enter the code sent to <span className="text-green-600 font-medium">{email}</span>.
      </p>

      <div className="bg-[#1F82250D] rounded-full w-14 h-14 flex items-center justify-center">
        <Mail className="text-[#1F8225]" size={24} />
      </div>

      {/* OTP inputs */}
      <div className="flex gap-2 mt-2" onPaste={handlePaste}>
        {otp.map((d, i) => (
          <input
            key={i}
            id={`otp-${i}`}
            type="text"
            maxLength={1}
            inputMode="numeric"
            pattern="[0-9]*"
            value={d}
            onChange={(e) => handleChange(e.target.value, i)}
            onKeyDown={(e) => handleKey(i, e)}
            disabled={loading}
            className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none disabled:opacity-50"
            autoFocus={i === 0}
          />
        ))}
      </div>

      {/* timer / resend */}
      <div className="text-center mt-4">
        {timer > 0 ? (
          <p className="text-sm text-gray-600">
            Resend code in <span className="font-semibold">{fmtTime(timer)}</span>
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

      {/* manual verify button */}
      <button
        type="button"
        disabled={loading || otp.some((x) => x === '')}
        onClick={() => handleVerify()}
        className={`w-full bg-green-600 text-white py-3 rounded-lg font-semibold mt-4 ${
          loading || otp.some((x) => x === '') ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'
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