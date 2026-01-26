const API_BASE_URL = 'https://cosplitz-backend.onrender.com/api';


const handleApiError = (response, data) => {
  if (!response.ok) {
    const errorMessage = data?.message || data?.detail || data?.error || `Request failed (${response.status})`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};


async function makeRequest(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...options.headers,
  };

  // Add auth token if needed
  if (options.auth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });



  const data = await response.json().catch(() => null);
  
  // Handle errors
  return handleApiError(response, data);
}
// ============ TOKEN HELPERS ============
const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

const setToken = (token, remember = true) => {
  if (typeof window === 'undefined') return;
  
  if (!token) {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    return;
  }
  
  if (remember) {
    localStorage.setItem('authToken', token);
    sessionStorage.removeItem('authToken');
  } else {
    sessionStorage.setItem('authToken', token);
    localStorage.removeItem('authToken');
  }
};

const clearAuth = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
  sessionStorage.removeItem('authToken');
  localStorage.removeItem('userInfo');
  localStorage.removeItem('tempRegister');
};





// ============ ENDPOINTS ============

/**
 * Step 1: Register user
 * POST /api/register/
 */
export const registerEndpoint = async (userData) => {
  const payload = {
    email: userData.email,
    password: userData.password,
    first_name: userData.first_name,
    last_name: userData.last_name,
    nationality: userData.nationality,
  };

  const data = await makeRequest(`${API_BASE_URL}/register/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  // API returns: { user: { id, email, first_name, last_name, ... } }
  return {
    userId: data?.user?.id,
    email: data?.user?.email,
    firstName: data?.user?.first_name,
    lastName: data?.user?.last_name,
    username: data?.user?.username,
    message: data?.message || 'Registration successful',
  };
};

/**
 * Step 2: Login (returns token)
 * POST /api/login/
 */
export const loginEndpoint = async (credentials, remember = true) => {
  const data = await makeRequest(`${API_BASE_URL}/login/`, {
    method: 'POST',
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
    auth: false,
  });

  // API returns: { token, data: { id, email, first_name, last_name, ... } }
  const { token } = data;
  
  if (!token) {
    throw new Error('No token received from server');
  }

  // Store token immediately
  setToken(token, remember);

  return {
    token,
    user: data?.data, // User data is in 'data' field
  };
};

/**
 * Step 3: Request OTP
 * GET /api/otp/{userId}/
 */
export const getOTPEndpoint = async (userId) => {
  const data = await makeRequest(`${API_BASE_URL}/otp/${userId}/`, {
    method: 'GET',
    auth: true, // Requires token from login
  });

  // API returns: { message: "OTP sent" }
  return data;
};

/**
 * Step 4: Verify OTP
 * POST /api/verify_otp/
 */
export const verifyOTPEndpoint = async ({ email, otp }) => {
  const data = await makeRequest(`${API_BASE_URL}/verify_otp/`, {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
    auth: true, // Requires token
  });

  // Update token if new one provided
  if (data?.token) {
    setToken(data.token, true);
  }

  return {
    user: data?.user || data?.data,
    token: data?.token,
    isVerified: true,
  };
};

/**
 * Resend OTP - same as get OTP
 */
export const resendOTPEndpoint = async (userId) => {
  return getOTPEndpoint(userId);
};

/**
 * Get user info
 * GET /api/user/info
 */
export const getUserInfoEndpoint = async () => {
  const data = await makeRequest(`${API_BASE_URL}/user/info`, {
    method: 'GET',
    auth: true,
  });

  // API returns user object directly
  return data;
};

/**
 * Logout
 */
export const logoutEndpoint = () => {
  clearAuth();
  return { success: true };
};