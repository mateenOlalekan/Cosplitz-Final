const API_BASE_URL = 'https://cosplitz-backend.onrender.com/api';


const COL = {
  ok: 'color: #2ecc71; font-weight: bold',
  err: 'color: #e74c3c; font-weight: bold',
  info: 'color: #3498db; font-weight: bold',
  warn: 'color: #f39c12; font-weight: bold',
};
const log = (msg, style = COL.info, ...rest) =>
  console.log(`%c[AuthService] ${msg}`, style, ...rest);

/* ================= REQUEST HELPER ================= */
async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let response;

  /* ---------- NETWORK ERROR ---------- */
  try {
    log(`📡 ${method} ${API_BASE_URL}${path}`, COL.info);
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    log('❌ Network error:', COL.err, error);
    return {
      success: false,
      error: true,
      status: 0,
      data: { message: 'Network error. Please check your connection.' },
    };
  }

  /* ---------- PARSE RESPONSE ---------- */
  let data = null;
  try {
    data = await response.json();
    log(`📊 Response ${response.status}:`, COL.ok, data);
  } catch (parseError) {
    log('⚠️ Failed to parse response:', COL.warn, parseError);
    data = null;
  }

  /* ---------- STATUS CODE HANDLING ---------- */
  if (!response.ok) {
    let message = 'Request failed';

    switch (response.status) {
      case 400:
        message = data?.message || 'Invalid request data';
        break;
      case 401:
        message = 'Unauthorized. Please login again.';
        break;
      case 403:
        message = 'Access denied.';
        break;
      case 404:
        message = 'Endpoint not found.';
        break;
      case 409:
        message = data?.message || 'Conflict occurred.';
        break;
      case 500:
        message = 'Server error. Please try again later.';
        break;
      default:
        message = `Request failed (${response.status})`;
    }

    log(`❌ Request failed: ${message}`, COL.err);
    return {
      success: false,
      error: true,
      status: response.status,
      data: { ...data, message },
    };
  }

  /* ---------- SUCCESS ---------- */
  log(`✅ Request successful`, COL.ok);
  return {
    success: true,
    status: response.status,
    data,
  };
}

/* ================= AUTH SERVICE ================= */
export const authService = {
  register: (payload) =>
    request("/register/", {
      method: "POST",
      body: payload,
      auth: true,
    }),

  login: (payload) =>
    request("/login/", {
      method: "POST",
      body: payload,
      auth: true,
    }),

  getUserInfo: () =>
    request("/user/info", {
      method: "GET",
    }),

  // GET OTP using userId
  getOTP: (userId) =>
    request(`/otp/${userId}/`, {
      method: "GET",
      auth: true,
    }),

  verifyOTP: (payload) =>
    request("/verify_otp", {
      method: "POST",
      body: payload,
      auth: true,
    }),

  logout: () =>
    request("/logout/", {
      method: "POST",
    }),

  // Additional utility methods
  resendOTP: (userId) =>
    request(`/otp/${userId}/`, {
      method: "GET",
      auth: false,
    }),

  // // Password reset methods
  // forgotPassword: (email) =>
  //   request("/forgot-password/", {
  //     method: "POST",
  //     body: { email },
  //     auth: false,
  //   }),

  // resetPassword: (token, newPassword) =>
  //   request("/reset-password/", {
  //     method: "POST",
  //     body: { token, new_password: newPassword },
  //     auth: false,
  //   }),
};

export default authService;