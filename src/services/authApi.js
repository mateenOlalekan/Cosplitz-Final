const API_BASE_URL = 'https://cosplitz-backend.onrender.com/api';
import {COL} from "../utils/LoggerDefinition"

const log = (msg, style = COL.info, ...rest) =>
  console.log(`%c[AuthService] ${msg}`, style, ...rest);

/* ================= REQUEST HELPER ================= */
async function request(path,{ method = 'GET', body, auth = false } = {},) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';

  // Attach token if needed
  if (auth) {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      log('⚠️ Token access error', COL.warn, e);
    }
  }

  let response;

  /* ---------- NETWORK ---------- */
  try {
    log(`📡 ${method} ${API_BASE_URL}${path}`, COL.info);
    response = await fetch(`${API_BASE_URL}${path}`, {
      method, headers, body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    log('❌ Network error', COL.err, err);
    return {success: false,status: 0,error: true,data: { message: 'Network error. Please check your connection.' },
    };
  }

  /* ---------- PARSE ---------- */
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  log(`📊 ${response.status} response`, response.ok ? COL.ok : COL.warn, data);

  /* ---------- ERROR HANDLING ---------- */
  if (!response.ok) {
    let message = data?.message || 'Request failed';

    switch (response.status) {
      case 400:
        message = data?.message || 'Invalid request';
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

    log(`❌ ${message}`, COL.err);
    return {
      success: false,
      status: response.status,
      error: true,
      data: { ...data, message },
    };
  }

  /* ---------- SUCCESS ---------- */
  return {
    success: true,
    status: response.status,
    data,
  };
}

/* ================= AUTH SERVICE ================= */
export const authService = {
  register: (payload) =>
    request('/register/', {
      method: 'POST',
      body: payload,
      auth: false,
    }),

  login: (payload) =>
    request('/login/', {
      method: 'POST',
      body: payload,
      auth: true,
    }),

  getUserInfo: () =>
    request('/user/info', {
      method: 'GET',
      auth: true,
    }),

  getOTP: (userId) =>
    request(`/otp/${userId}/`, {
      method: 'GET',
      auth: true,
    }),

  verifyOTP: async (payload) => {
    const res = await request('/verify_otp', {
      method: 'POST',
      body: payload,
      auth: true,
    });
    if (res.success && res.data?.token && res.data?.user) {
      return {
        success: true,
        data: {token: res.data.token,user: res.data.user,},
      };
    }

    return {
      success: false,status: res.status,error: true, data: res.data || { message: 'OTP verification failed' },
    };
  },


  logout: () =>
    request('/logout/', {
      method: 'POST',
      auth: true,
    }),

  resendOTP: (userId) =>
    request(`/otp/${userId}/`, {
      method: 'GET',
      auth: true,
    }),
};

export default authService;
