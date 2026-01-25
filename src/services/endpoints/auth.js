// src/services/endpoints/auth.js

const API_BASE_URL = 'https://cosplitz-backend.onrender.com/api';

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

// ============ REQUEST HELPER ============

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

  if (!response.ok) {
    const error = new Error(data?.message || data?.detail || `Request failed (${response.status})`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ============ ENDPOINTS ============

/**
 * Step 1: Register user
 */
export const registerEndpoint = async (userData) => {
  const data = await makeRequest(`${API_BASE_URL}/register/`, {
    method: 'POST',
    body: JSON.stringify(userData),
  });

  return {
    userId: data?.user?.id || data?.user_id,
    email: userData.email,
    firstName: userData.first_name,
    lastName: userData.last_name,
    message: data?.message || 'Registration successful',
  };
};

/**
 * Step 2: Login (returns token)
 */
export const loginEndpoint = async (credentials, remember = true) => {
  const data = await makeRequest(`${API_BASE_URL}/login/`, {
    method: 'POST',
    body: JSON.stringify(credentials),
    auth: false, // No token needed for login
  });

  const { token, refresh_token } = data;
  
  if (!token) {
    throw new Error('No token received from server');
  }

  // Store token immediately
  setToken(token, remember);

  return {
    token,
    refreshToken: refresh_token,
    user: data?.data || data?.user || data,
  };
};

/**
 * Step 3: Request OTP
 */
export const getOTPEndpoint = async (userId) => {
  const data = await makeRequest(`${API_BASE_URL}/otp/${userId}/`, {
    method: 'GET',
    auth: true, // Requires token
  });

  return data;
};

/**
 * Step 4: Verify OTP
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
    user: data?.user || data,
    token: data?.token,
    isVerified: true,
  };
};

/**
 * Resend OTP
 */
export const resendOTPEndpoint = async (userId) => {
  return getOTPEndpoint(userId);
};

/**
 * Get user info
 */
export const getUserInfoEndpoint = async () => {
  const data = await makeRequest(`${API_BASE_URL}/user/info`, {
    method: 'GET',
    auth: true,
  });

  return data;
};

/**
 * Logout
 */
export const logoutEndpoint = () => {
  clearAuth();
  return { success: true };
};