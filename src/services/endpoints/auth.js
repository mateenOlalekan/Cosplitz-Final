// src/services/endpoints/auth.js - FIXED OTP ISSUES
const API_BASE_URL = 'https://cosplitz-backend.onrender.com/api';

const handleApiError = (response, data) => {
  if (!response.ok) {
    // Don't clear auth on 401 during registration flow
    // Only clear on non-OTP endpoints
    const isOTPEndpoint = response.url.includes('/otp/') || response.url.includes('/verify');
    if (response.status === 401 && !isOTPEndpoint) {
      clearAuth();
    }
    
    // Extract error message from various possible formats
    let errorMessage = 'Request failed';
    
    if (data?.message) {
      errorMessage = data.message;
    } else if (data?.detail) {
      errorMessage = data.detail;
    } else if (data?.error) {
      errorMessage = data.error;
    } else if (data?.errors && Array.isArray(data.errors)) {
      errorMessage = data.errors.join(', ');
    } else if (data?.email && Array.isArray(data.email)) {
      // Handle Django-style field errors
      errorMessage = `Email: ${data.email.join(', ')}`;
    } else {
      errorMessage = `Request failed with status ${response.status}`;
    }
    
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

  if (options.auth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json().catch(() => null);
    return handleApiError(response, data);
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError = new Error('Network error. Please check your internet connection.');
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw error;
  }
}

// ============ TOKEN HELPERS ============
export const getToken = () => {
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

  return {
    userId: data?.user?.id,
    email: data?.user?.email,
    firstName: data?.user?.first_name,
    lastName: data?.user?.last_name,
    username: data?.user?.username,
    message: data?.message || 'Registration successful',
  };
};

export const loginEndpoint = async (credentials, remember = true) => {
  const data = await makeRequest(`${API_BASE_URL}/login/`, {
    method: 'POST',
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
    auth: false,
  });

  const { token } = data;
  
  if (!token) {
    throw new Error('No token received from server');
  }

  setToken(token, remember);

  return {
    token,
    user: data?.data,
  };
};

export const getOTPEndpoint = async (userId) => {
  const data = await makeRequest(`${API_BASE_URL}/otp/${userId}/`, {
    method: 'GET',
    auth: true,
  });
  return data;
};

// FIXED: Changed endpoint from /verify_otp/ to /verify-otp/
export const verifyOTPEndpoint = async ({ email, otp }) => {
  // Try both possible endpoint formats
  let data;
  
  try {
    // Try with hyphen first (RESTful convention)
    data = await makeRequest(`${API_BASE_URL}/verify-otp/`, {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
      auth: true,
    });
  } catch (error) {
    if (error?.status === 404) {
      // If 404, try with underscore
      data = await makeRequest(`${API_BASE_URL}/verify_otp/`, {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
        auth: true,
      });
    } else {
      throw error;
    }
  }

  if (data?.token) {
    setToken(data.token, true);
  }

  return {
    user: data?.user || data?.data,
    token: data?.token,
    isVerified: true,
  };
};

export const resendOTPEndpoint = async (userId) => {
  return getOTPEndpoint(userId);
};

export const getUserInfoEndpoint = async () => {
  const data = await makeRequest(`${API_BASE_URL}/user/info`, {
    method: 'GET',
    auth: true,
  });
  return data;
};

export const logoutEndpoint = () => {
  clearAuth();
  return { success: true };
};