const API_BASE_URL = 'https://cosplitz-backend.onrender.com/api';

/* ================= REQUEST HELPER ================= */
async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const token =
      localStorage.getItem('authToken') ||
      sessionStorage.getItem('authToken');

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let response;

  /* ---------- NETWORK ERROR ---------- */
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
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
  } catch {
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

    return {
      success: false,
      error: true,
      status: response.status,
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
    request("/register/", {
      method: "POST",
      body: payload,
      auth: false,
    }),

  login: (payload) =>
    request("/login/", {
      method: "POST",
      body: payload,
      auth: false,
    }),

  getUserInfo: () =>
    request("/user/info", {
      method: "GET",
    }),

  // GET OTP using userId
  getOTP: (userId) =>
    request(`/otp/${userId}/`, {
      method: "GET",
      auth: false,
    }),

  verifyOTP: (payload) =>
    request("/verify_otp", {
      method: "POST",
      body: payload,
      auth: false,
    }),
};

export default authService;



