const API_BASE_URL = 'https://cosplitz-backend.onrender.com/api';
import { COL } from "../utils/LoggerDefinition";

const log = (msg, style = COL.info, ...rest) =>
  console.log(`%c[AuthService] ${msg}`, style, ...rest);

async function request(
  path,
  { method = 'GET', body, auth = false } = {}
) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';

  if (auth) {
    try {
      const token =
        localStorage.getItem('authToken') ||
        sessionStorage.getItem('authToken');

      if (token) headers.Authorization = `Bearer ${token}`;
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
    request('/register/', { method: 'POST', body: payload }),

  login: (payload) =>
    request('/login/', { method: 'POST', body: payload }),

  getUserInfo: () =>
    request('/user/info', { auth: true }),

  // ✅ NO AUTH
  getOTP: (userId) =>
    request(`/otp/${userId}/`, { auth:true }),

  // ✅ FIXED SLASH + NO AUTH
  verifyOTP: (payload) =>
    request('/verify_otp', {
      method: 'POST',
      body: payload,
      auth: true,
    }),

  logout: () =>
    request('/logout/', { method: 'POST', auth: true }),

  resendOTP: (userId) =>
    request(`/otp/${userId}/`, { auth: true }),
};

export default authService;
