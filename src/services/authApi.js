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
    console.log('[DEBUG] Request Body:', body);
  }
  const config = { method, headers, body };
  let resp;
  try {resp = await fetch(url, config);
  } catch (netErr) {
    console.error('[DEBUG] Network error:', netErr);
    return { status: 0, data: { message: 'Network error. Check connection.' }, error: true };
  }
  
  const responseText = await resp.text();
  if (responseText.trim().startsWith('<!DOCTYPE') || 
      responseText.trim().startsWith('<html') ||
      responseText.includes('</html>')) {
    console.error('[DEBUG] Server returned HTML error page instead of JSON');
    let errorMessage = `Server error (${resp.status})`;
    
    // Look for common error patterns in HTML
    const errorMatch = responseText.match(/<pre[^>]*>([\s\S]*?)<\/pre>|Error:([^<]+)/i);
    if (errorMatch) {
      errorMessage += `: ${errorMatch[1] || errorMatch[2]}`;
    } else if (responseText.includes('500 Internal Server Error')) {
      errorMessage = 'Internal server error (500). Please try again later.';
    }
    return {
      status: resp.status,
      data: {message: errorMessage,htmlResponse: true},
      error: true,
      responseText: responseText,
    };
  }
  
  // Try to parse as JSON
  let json = null;
  try {
    json = responseText ? JSON.parse(responseText) : null;
  } catch (parseError) {
    console.error('[DEBUG] JSON Parse Error:', parseError);
    return {
      status: resp.status,
      data: {
        message: `Server returned invalid response (${resp.status})`,
        debug: responseText?.substring(0, 300),
      },
      error: true,
      responseText: responseText,
    };
  }

  // Handle specific status codes
  if (resp.status === 500) {return {status: 500,data: {message: json?.message || 'Internal server error. Please try again or contact support.',},error: true, };}
  if (resp.status === 401) {return {status: 401,data: { ...json, message: json?.message || 'Unauthorized. Please log in.' },error: true,unauthorized: true };}  
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

  // UPDATED: Get OTP using email as query parameter
  getOTP: async (email) => {
    console.log('[DEBUG] getOTP called with email:', email);
    if (!email) return { status: 400, data: { message: 'Email is required.' }, error: true };
    
    try {
      const res = await request(`/otp/?email=${encodeURIComponent(email.toLowerCase().trim())}`, {
        method: 'GET',
        auth: false
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

  // UPDATED: Verify OTP with email in body
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
      email: email.toLowerCase().trim(),
      otp: String(otp).trim(),
    };
    
    console.log('[DEBUG] verifyOTP payload:', payload);
    
    const res = await request('/verify_otp/', {
      method: 'POST',
      body: payload,
      auth: false
    });
    
    console.log('[DEBUG] verifyOTP response:', res);
    return res;
  },

  resendOTP: (email) => {
    console.log('[DEBUG] resendOTP called with email:', email);
    return authService.getOTP(email);
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