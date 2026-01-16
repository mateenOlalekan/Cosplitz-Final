const API_BASE_URL = 'https://cosplitz-backend.onrender.com/api';

/* ---------- logger ---------- */
const COL = {
  ok: 'color: #2ecc71; font-weight: bold',
  err: 'color: #e74c3c; font-weight: bold',
  info: 'color: #3498db; font-weight: bold',
  warn: 'color: #f39c12; font-weight: bold',
};
const log = (msg, style = COL.info, ...rest) =>
  console.log(`%c[AuthApi] ${msg}`, style, ...rest);

/* ---------- core request ---------- */
async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  let token = null;
  try {
    token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  } catch (_) {}

  const isForm = options.body instanceof FormData;

  const headers = {
    ...(isForm ? {} : { 'Content-Type': 'application/json' }),
    ...(options.auth !== false && token
      ? { Authorization: `Bearer ${token}` }
      : {}),
  };

  const method = (options.method || 'GET').toUpperCase();
  let body;
  if (options.body) {
    body = isForm ? options.body : JSON.stringify(options.body);
  }

  const config = { method, headers, body };
  log(`→ ${config.method} ${url}`, COL.info, body ? 'Has body' : 'No body');

  let resp;
  try {
    resp = await fetch(url, config);
  } catch (netErr) {
    log('× NETWORK FAIL', COL.err, netErr);
    return { status: 0, data: { message: 'Network error. Check connection.' }, error: true };
  }

  const responseText = await resp.text();
  
  // DEBUG: Check if response is HTML error page
  if (responseText.trim().startsWith('<!DOCTYPE') || responseText.includes('</html>')) {
    log('× HTML ERROR PAGE RETURNED', COL.err, responseText.substring(0, 200));
    return {
      status: resp.status,
      data: { message: `Server error (${resp.status}). Check backend logs.` },
      error: true,
      htmlResponse: true,
    };
  }

  let json = null;
  try {
    json = responseText ? JSON.parse(responseText) : null;
  } catch (parseError) {
    console.error('❌ JSON Parse Error:', parseError);
    return {
      status: resp.status,
      data: { message: `Server error (${resp.status}). Invalid JSON response.`, debug: responseText?.substring(0, 300) },
      error: true,
    };
  }

  if (resp.status === 500) {
    return { status: 500, data: { message: json?.message || 'Server error. Try again or contact support.' }, error: true };
  }
  if (resp.status === 401) {
    return { status: 401, data: { ...json, message: json?.message || 'Unauthorized. Please log in.' }, error: true, unauthorized: true };
  }
  if (resp.status === 400) return { status: 400, data: { ...json, message: json?.message || 'Invalid request data.' }, error: true };
  if (resp.status === 409) return { status: 409, data: { ...json, message: json?.message || 'Email already registered.' }, error: true };
  if (resp.status === 404) return { status: 404, data: { ...json, message: json?.message || 'API endpoint not found.' }, error: true };
  if (!resp.ok) return { status: resp.status, data: { ...json, message: json?.message || `Request failed (${resp.status})` }, error: true };

  return { status: resp.status, data: json, success: true };
}

/* ---------- auth service ---------- */
export const authService = {
  register: async (userData) => {
    log('📝 Registering user...', COL.info);
    try {
      const res = await request('/register/', { method: 'POST', body: userData });
      if (res.status === 409) {
        res.data.message = 'Email already registered. Try logging in.';
      }
      return res;
    } catch (err) {
      log('× Registration error', COL.err, err);
      return { status: 0, data: { message: 'Registration failed. Try again.' }, error: true };
    }
  },

  login: async ({ email, password }) => {
    log('🔐 Logging in...', COL.info, { email });
    try {
      return await request('/login/', { method: 'POST', body: { email: email.toLowerCase().trim(), password } });
    } catch (err) {
      log('× Login error', COL.err, err);
      return { status: 0, data: { message: 'Login failed. Try again.' }, error: true };
    }
  },

  getUserInfo: async () => {
    log('👤 Fetching user info...', COL.info);
    try {
      return await request('/user/info', { method: 'GET' });
    } catch (err) {
      log('× Get user info error', COL.err, err);
      return { status: 0, data: { message: 'Failed to fetch user info.' }, error: true };
    }
  },

  // ✅ FIXED: No userId in path
  getOTP: async () => {
    log('📧 Requesting OTP...', COL.info);
    try {
      const res = await request('/otp/', { method: 'GET', auth: false });
      
      // Show OTP in console for dev
      if (res.success && res.data?.otp) {
        console.log('🔢 OTP CODE (DEV):', res.data.otp);
      }
      return res;
    } catch (err) {
      log('× OTP request error', COL.err, err);
      return { status: 0, data: { message: 'Failed to request OTP.' }, error: true };
    }
  },

  // ✅ FIXED: Send email instead of user_id
  verifyOTP: async (otp) => {
    if (!otp) {
      return { status: 400, data: { message: 'OTP is required.' }, error: true };
    }

    const temp = JSON.parse(localStorage.getItem('tempRegister') || '{}');
    if (!temp.email) {
      return { status: 400, data: { message: 'No registration data found.' }, error: true };
    }

    log('🔢 Verifying OTP...', COL.info);
    try {
      return await request('/verify_otp', {
        method: 'POST',
        body: { email: temp.email, otp: String(otp).trim() },
        auth: false,
      });
    } catch (err) {
      log('× Verify OTP error', COL.err, err);
      return { status: 0, data: { message: 'OTP verification failed.' }, error: true };
    }
  },

  resendOTP: () => authService.getOTP(),

  forgotPassword: async (email) => {
    log('🔑 Forgot password...', COL.info);
    try {
      return await request('/forgot-password/', { method: 'POST', body: { email: email.toLowerCase().trim() } });
    } catch (err) {
      log('× Forgot password error', COL.err, err);
      return { status: 0, data: { message: 'Failed to send reset email.' }, error: true };
    }
  },

  resetPassword: async (data) => {
    log('🔄 Resetting password...', COL.info);
    try {
      return await request('/reset-password/', { method: 'POST', body: data });
    } catch (err) {
      log('× Reset password error', COL.err, err);
      return { status: 0, data: { message: 'Password reset failed.' }, error: true };
    }
  },

  logout: async () => {
    log('🚪 Logging out...', COL.info);
    try {
      return await request('/logout/', { method: 'POST' });
    } catch (err) {
      log('× Logout error', COL.warn, err);
      return { status: 0, data: { message: 'Logged out locally.' }, success: true };
    }
  },
};

export default { request, authService };