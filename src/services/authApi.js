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

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  
  console.log(`[DEBUG] Request URL: ${url}`);
  console.log(`[DEBUG] Options:`, options);

  let token = null;
  try {
    token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    console.log(`[DEBUG] Token available: ${!!token}`);
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
  const trimmed = responseText ? responseText.trim() : '';
  const isJson = trimmed.startsWith('{') || trimmed.startsWith('[');
  
  console.log(`[DEBUG] Response Status: ${resp.status} ${resp.statusText}`);
  console.log(`[DEBUG] Response Body:`, responseText);
  
  log(`← ${resp.status} ${resp.statusText}`, resp.ok ? COL.ok : COL.err,
    isJson ? responseText : `Non-JSON response: ${responseText.substring(0, 100)}...`);

  let json = null;
  try {
    json = responseText ? JSON.parse(responseText) : null;
  } catch (parseError) {
    console.error('❌ JSON Parse Error:', parseError);
    return {
      status: resp.status,
      data: {
        message: `Server error (${resp.status}). Response was not JSON.`,
        debug: responseText?.substring(0, 300),
        originalMessage: 'Invalid server response (not JSON).',
      },
      error: true,
      responseText: responseText,
    };
  }

  if (resp.status === 500) {
    return {
      status: 500,
      data: {
        message: json?.message || 'Server error. Please try again or contact support.',
      },
      error: true,
    };
  }

  if (resp.status === 401) {return { status: 401, data: { ...json, message: json?.message || 'Unauthorized. Please log in.' }, error: true, unauthorized: true };
  }
  if (resp.status === 400) return { status: 400, data: { ...json, message: json?.message || 'Invalid request data.' }, error: true };
  if (resp.status === 409) return { status: 409, data: { ...json, message: json?.message || 'This email is already registered.' }, error: true };
  if (resp.status === 404) return { status: 404, data: { ...json, message: json?.message || 'API endpoint not found (404).' }, error: true };
  if (!resp.ok) return { status: resp.status, data: { ...json, message: json?.message || `Request failed (${resp.status})` }, error: true };

  return { status: resp.status, data: json, success: true };
}

/* ---------- auth service ---------- */
export const authService = {
  register: async (userData) => {
    console.log('[DEBUG] Register payload:', userData);
    try {
      const res = await request('/register/', { method: 'POST', body: userData });
      console.log('[DEBUG] Register response:', res);
      if (res.status === 409) {
        res.data.message = 'This email is already registered. Please use a different email or try logging in.';
      }
      return res;
    } catch (err) {
      log('Registration error', COL.err, err);
      return { status: 0, data: { message: 'Registration failed. Please try again.' }, error: true };
    }
  },

  login: async ({ email, password }) => {
    console.log('[DEBUG] Login payload:', { email, password: '***' });
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
    console.log('[DEBUG] getOTP called with userId:', userId);
    if (!userId) return { status: 400, data: { message: 'User ID is required.' }, error: true };
    
    try {
      const res = await request(`/otp/${userId}/`, { 
        method: 'GET',
        auth: false  // Important: No token needed for registration OTP
      });
      console.log('[DEBUG] getOTP response:', res);
      
      if (res.success && res.data?.otp) {
        console.log('🔢 OTP CODE (DEV):', res.data.otp);
      }
      
      return res;
    } catch (err) {
      console.log('[DEBUG] getOTP error:', err);
      return { status: 0, data: { message: 'Failed to send OTP.' }, error: true };
    }
  },

  verifyOTP: async (email, otp) => {
    console.log('[DEBUG] verifyOTP called with:', { email, otp });
    
    if (!email || !otp) {
      return {
        status: 400,
        data: { message: 'Email and OTP are required.' },
        error: true,
      };
    }

    const payload = {
      email: String(email).trim(),
      otp: String(otp).trim(),
    };
    
    console.log('[DEBUG] verifyOTP payload:', payload);
    
    const res = await request('/verify_otp', {
      method: 'POST',
      body: payload,
      auth: false
    });
    
    console.log('[DEBUG] verifyOTP response:', res);
    return res;
  },

  resendOTP: (userId) => {
    console.log('[DEBUG] resendOTP called with userId:', userId);
    return authService.getOTP(userId);
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

  logout: async () => {
    try {
      return await request('/logout/', { method: 'POST' });
    } catch (err) {
      log('Logout API error', COL.warn, err);
      return { status: 0, data: { message: 'Logged out locally.' }, success: true };
    }
  },
};

export default { request, authService };