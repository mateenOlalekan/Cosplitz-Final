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
  const token = options.getToken ? options.getToken() : null; // Get token from callback
  const isForm = options.body instanceof FormData;

  const headers = {
    ...(isForm ? {} : { 'Content-Type': 'application/json', Accept: 'application/json' }),
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const config = { method: options.method || 'GET', headers, ...options };
  if (config.body && !isForm && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  log(`→ ${config.method} ${url}`, COL.info, config.body ? 'Has body' : 'No body');

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
    json = { message: 'Invalid server response (not JSON).' };
  }
  
  log(`← ${resp.status} ${resp.statusText}`, resp.ok ? COL.ok : COL.err, json);

  // ==== STANDARDIZED ERROR HANDLING ====
  if (!resp.ok) {
    const status = resp.status;
    const message = json?.message || 'Request failed';
    
    const errorMap = {
      400: 'Invalid request data',
      401: 'Unauthorized. Please log in',
      409: 'This email is already registered',
      404: 'Resource not found',
      500: 'Server error. Please try again',
    };
    
    return {
      status,
      data: { ...json, message },
      error: true,
      unauthorized: status === 401,
    };
  }

  return { status: resp.status, data: json, success: true };
}

/* ---------- auth service ---------- */
export const authService = {
  register: async (userData, getToken) => {
    try {
      return await request('/register/', { 
        method: 'POST', 
        body: userData,
        getToken, // Pass token getter
      });
    } catch (err) {
      log('Registration error', COL.err, err);
      return { status: 0, data: { message: 'Registration failed. Please try again.' }, error: true };
    }
  },

  login: async (credentials, getToken) => {
    try {
      const normalized = {
        email: credentials.email.toLowerCase().trim(),
        password: credentials.password,
      };
      return await request('/login/', { 
        method: 'POST', 
        body: normalized,
        getToken,
      });
    } catch (err) {
      log('Login error', COL.err, err);
      return { status: 0, data: { message: 'Login failed. Please try again.' }, error: true };
    }
  },

  getUserInfo: async (getToken) => {
    try {
      return await request('/user/info', { 
        method: 'GET',
        getToken,
      });
    } catch (err) {
      log('Get user info error', COL.err, err);
      return { status: 0, data: { message: 'Failed to fetch user information.' }, error: true };
    }
  },

  getOTP: async (userId, getToken) => {
    if (!userId) return { status: 400, data: { message: 'User ID is required.' }, error: true };
    
    try {
      return await request(`/otp/${userId}`, { 
        method: 'GET',
        getToken,
      });
    } catch (err) {
      log('Get OTP error', COL.err, err);
      return { status: 0, data: { message: 'Failed to send OTP. Try resend button.' }, error: true };
    }
  },

  verifyOTP: async (identifier, otp, getToken) => {
    if (!identifier || !otp) {
      return { status: 400, data: { message: 'Email and OTP are required.' }, error: true };
    }
    
    const body = /@/.test(identifier)
      ? { email: identifier.toLowerCase().trim(), otp: otp.toString().trim() }
      : { user_id: identifier.toString(), otp: otp.toString().trim() };
    
    try {
      return await request('/verify_otp', { 
        method: 'POST', 
        body,
        getToken,
      });
    } catch (err) {
      log('Verify OTP error', COL.err, err);
      return { status: 0, data: { message: 'OTP verification failed.' }, error: true };
    }
  },

  resendOTP: async (userId, getToken) => authService.getOTP(userId, getToken),

  logout: async (getToken) => {
    try {
      return await request('/logout/', { 
        method: 'POST',
        getToken,
      });
    } catch (err) {
      log('Logout API error', COL.warn, err);
      return { status: 0, data: { message: 'Logged out locally.' }, success: true };
    }
  },

  forgotPassword: async (email, getToken) => {
    try {
      return await request('/forgot-password/', { 
        method: 'POST', 
        body: { email: email.toLowerCase().trim() },
        getToken,
      });
    } catch (err) {
      log('Forgot password error', COL.err, err);
      return { status: 0, data: { message: 'Failed to send reset email.' }, error: true };
    }
  },

  resetPassword: async (data, getToken) => {
    try {
      return await request('/reset-password/', { 
        method: 'POST', 
        body: data,
        getToken,
      });
    } catch (err) {
      log('Reset password error', COL.err, err);
      return { status: 0, data: { message: 'Password reset failed.' }, error: true };
    }
  },
};

export default { request, authService };