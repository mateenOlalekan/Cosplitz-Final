const API_BASE_URL = 'https://cosplitz-backend.onrender.com/api';

/* ---------- logger ---------- */
const COL = {
  ok  : 'color: #2ecc71; font-weight: bold',
  err : 'color: #e74c3c; font-weight: bold',
  info: 'color: #3498db; font-weight: bold',
  warn: 'color: #f39c12; font-weight: bold',
};
const log = (msg, style = COL.info, ...rest) =>
  console.log(`%c[AuthApi] ${msg}`, style, ...rest);

/* ---------- store ---------- */
import { useAuthStore } from '../store/authStore';

/* ---------- core request ---------- */
async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const token = options.getToken ? options.getToken() : useAuthStore.getState().token;
  const isForm = options.body instanceof FormData;

  const headers = {
    ...(isForm ? {} : { 'Content-Type': 'application/json', Accept: 'application/json' }),
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const config = { method: options.method || 'GET', headers, ...options };
  if (config.body && !isForm && typeof config.body === 'object') config.body = JSON.stringify(config.body);

  log(`→ ${config.method} ${url}`, COL.info, config.body ?? '(no body)');

  let resp;
  try {
    resp = await fetch(url, config);
  } catch (netErr) {
    log('× NETWORK FAIL', COL.err, netErr);
    return { status: 0, data: { message: 'Network error. Check connection.' }, error: true };
  }

  let json = null;
  try {
    const txt = await resp.text();
    json = txt ? JSON.parse(txt) : null;
  } catch {
    json = { message: 'Invalid server response.' };
  }
  log(`← ${resp.status} ${resp.statusText}`, resp.ok ? COL.ok : COL.err, json);

  if (resp.status === 401) {
    return { status: 401, data: { ...json, message: json?.message || 'Unauthorized. Please log in.' }, error: true, unauthorized: true };
  }
  if (resp.status === 400) return { status: 400, data: { ...json, message: json?.message || 'Invalid request data.' }, error: true };
  if (resp.status === 409) return { status: 409, data: { ...json, message: json?.message || 'This email is already registered.' }, error: true };
  if (resp.status === 404) return { status: 404, data: { ...json, message: json?.message || 'Resource not found.' }, error: true };
  if (resp.status >= 500) return { status: resp.status, data: { ...json, message: json?.message || 'Server error. Try again later.' }, error: true };
  if (!resp.ok) return { status: resp.status, data: { ...json, message: json?.message || `Request failed (${resp.status})` }, error: true };

  return { status: resp.status, data: json, success: true };
}

/* ---------- auth ---------- */
export const authService = {
  register: async (userData) => {
    try {
      const res = await request('/register/', { method: 'POST', body: userData });
      if (res.status === 409) res.data.message = 'This email is already registered. Please use a different email or try logging in.';
      return res;
    } catch (err) {
      log('Registration error', COL.err, err);
      return { status: 0, data: { message: 'Registration failed. Please try again.' }, error: true };
    }
  },

  login: async ({ email, password }) => {
    try {
      return await request('/login/', { method: 'POST', body: { email: email.toLowerCase().trim(), password } });
    } catch (err) {
      log('Login error', COL.err, err);
      return { status: 0, data: { message: 'Login failed. Please try again.' }, error: true };
    }
  },

  getUserInfo: async () => {
    try {
      return await request('/user/info', { method: 'GET' });
    } catch (err) {
      log('Get user info error', COL.err, err);
      return { status: 0, data: { message: 'Failed to fetch user information.' }, error: true };
    }
  },

  getOTP: async (userId) => {
    if (!userId) return { status: 400, data: { message: 'User ID is required.' }, error: true };
    try {
      return await request(`/otp/${userId}/`, { method: 'GET' });
    } catch (err) {
      log('Get OTP error', COL.err, err);
      return { status: 0, data: { message: 'Failed to send OTP.' }, error: true };
    }
  },

  verifyOTP: async (identifier, otp) => {
    if (!identifier || !otp) return { status: 400, data: { message: 'Email and OTP are required.' }, error: true };
    const body = /@/.test(identifier)
      ? { email: identifier.toLowerCase().trim(), otp: otp.toString().trim() }
      : { user_id: identifier, otp: otp.toString().trim() };
    try {
      return await request('/verify_otp', { method: 'POST', body });
    } catch (err) {
      log('Verify OTP error', COL.err, err);
      return { status: 0, data: { message: 'OTP verification failed.' }, error: true };
    }
  },

  resendOTP: (userId) => authService.getOTP(userId),

  logout: async () => {
    try {
      return await request('/logout/', { method: 'POST' });
    } catch (err) {
      log('Logout API error', COL.warn, err);
      return { status: 0, data: { message: 'Logged out locally.' }, success: true };
    }
  },

  forgotPassword: async (email) => {
    try {
      return await request('/forgot-password/', { method: 'POST', body: { email: email.toLowerCase().trim() } });
    } catch (err) {
      log('Forgot password error', COL.err, err);
      return { status: 0, data: { message: 'Failed to send reset email.' }, error: true };
    }
  },

  resetPassword: async (data) => {
    try {
      return await request('/reset-password/', { method: 'POST', body: data });
    } catch (err) {
      log('Reset password error', COL.err, err);
      return { status: 0, data: { message: 'Password reset failed.' }, error: true };
    }
  },
};

/* ---------- default ---------- */
export default { request, authService };