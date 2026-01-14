const API_BASE_URL = 'https://cosplitz-backend.onrender.com/api'; // ✅ Removed trailing space

/* ---------- logger ---------- */
const COL = {
  ok: 'color: #2ecc71; font-weight: bold',
  err: 'color: #e74c3c; font-weight: bold',
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

  log(`→ ${config.method} ${url}`, COL.info, config.body ? 'Has body' : 'No body');

  let resp;
  try {
    resp = await fetch(url, config);
  } catch (netErr) {
    log('× NETWORK FAIL', COL.err, netErr);
    return { status: 0, data: { message: 'Network error. Check connection.' }, error: true };
  }

  // ✅ FIXED: Get raw text first for debugging
  const responseText = await resp.text();
  
  // ✅ FIXED: Show raw response in logs for debugging
  const isJson = responseText && responseText.trim().startsWith('{');
  log(`← ${resp.status} ${resp.statusText}`, resp.ok ? COL.ok : COL.err, 
    isJson ? responseText : `Non-JSON response: ${responseText.substring(0, 100)}...`);

  let json = null;
  try {
    json = responseText ? JSON.parse(responseText) : null;
  } catch (parseError) {
    // ✅ FIXED: Return actual response text in error
    console.error('❌ JSON Parse Error:', parseError);
    return {
      status: resp.status,
      data: { 
        message: `Server error (${resp.status}). Response was not JSON.`,
        debug: responseText.substring(0, 300),
        originalMessage: 'Invalid server response (not JSON).'
      },
      error: true,
      responseText: responseText
    };
  }

  // ==== HANDLE ERRORS GRACEFULLY ====
  if (resp.status === 500) {
    return { 
      status: 500, 
      data: { 
        message: json?.message || 'Server error. Please try again or contact support.' 
      }, 
      error: true 
    };
  }
  
  if (resp.status === 401) {
    return { status: 401, data: { ...json, message: json?.message || 'Unauthorized. Please log in.' }, error: true, unauthorized: true };
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
    const res = await request(`/otp/${userId}/`, { method: 'GET' });
    
    // ✅ TEMP: Show OTP in console for testing
    if (res.success && res.data?.otp) {
      console.log('🔢 OTP CODE (DEV):', res.data.otp);
    }
    
    return res;
  } catch (err) {
    return { status: 0, data: { message: 'Failed to send OTP.' }, error: true };
  }
}, 

verifyOTP: async (userId, otp) => {
  if (!userId || !otp) {
    return {
      status: 400,
      data: { message: 'User ID and OTP are required.' },
      error: true,
    };
  }

  return await request('/verify_otp', {
    method: 'POST',
    body: {
      user_id: Number(userId),
      otp: String(otp).trim(),
    },
  });
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
};

export default { request, authService };
// forgotPassword: async (email) => {
  //   try {
  //     return await request('/forgot-password/', { method: 'POST', body: { email: email.toLowerCase().trim() } });
  //   } catch (err) {
  //     log('Forgot password error', COL.err, err);
  //     return { status: 0, data: { message: 'Failed to send reset email.' }, error: true };
  //   }
  // },

  // resetPassword: async (data) => {
  //   try {
  //     return await request('/reset-password/', { method: 'POST', body: data });
  //   } catch (err) {
  //     log('Reset password error', COL.err, err);
  //     return { status: 0, data: { message: 'Password reset failed.' }, error: true };
  //   }
  

