const API_BASE_URL = 'https://cosplitz-backend.onrender.com/api';

const getToken = () => 
  localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

const setToken = (token, remember = true) => {
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
  localStorage.removeItem('authToken');
  sessionStorage.removeItem('authToken');
  localStorage.removeItem('userInfo');
  localStorage.removeItem('tempRegister');
};

const handleResponse = async (response) => {
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = data?.message || data?.detail || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return { success: true, status: response.status, data };
};

// ============ ENDPOINTS ============
/**Step 1: Register user POST /api/register/ */
export const registerEndpoint = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/register/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const result = await handleResponse(response);
  
  return {
    userId: result.data?.user?.id || result.data?.user_id,
    email: userData.email,
    firstName: userData.first_name,
    lastName: userData.last_name,
    message: result.data?.message || 'Registration successful',
  };
};

/** Step 2: Auto-login (hidden from user) POST /api/login/ */
export const loginEndpoint = async (credentials, remember = true) => {
  const response = await fetch(`${API_BASE_URL}/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const result = await handleResponse(response);
  
  const { token, refresh_token, data } = result.data;
  
  // Store token immediately
  setToken(token, remember);

  return {
    token,
    refreshToken: refresh_token,
    user: data || result.data?.user || result.data,
  };
};

/**
 * Step 3: Request OTP
 * GET /api/otp/{userId}/
 */
export const getOTPEndpoint = async (userId) => {
  const token = getToken();
  
  if (!token) throw new Error('Authentication required');

  const response = await fetch(`${API_BASE_URL}/otp/${userId}/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
};

/**
 * Step 4: Verify OTP
 * POST /api/verify_otp/
 */
export const verifyOTPEndpoint = async ({ email, otp }) => {
  const token = getToken();
  
  if (!token) throw new Error('Authentication required');

  const response = await fetch(`${API_BASE_URL}/verify_otp/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ email, otp }),
  });

  const result = await handleResponse(response);
  
  // Update with final verified token if provided
  if (result.data?.token) {
    setToken(result.data.token, true);
  }

  return {
    user: result.data?.user || result.data,
    token: result.data?.token,
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
 * GET /api/user/info
 */
export const getUserInfoEndpoint = async () => {
  const token = getToken();
  if (!token) throw new Error('No token found');

  const response = await fetch(`${API_BASE_URL}/user/info`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
};

/**
 * Logout
 */
export const logoutEndpoint = () => {
  clearAuth();
  return { success: true };
};