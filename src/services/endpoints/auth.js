// src/services/endpoints/auth.js
// FIXED - Improved error handling and token management

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

  if (options.auth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  try {
    console.log(`📡 API Request: ${options.method || 'GET'} ${url}`);
    const response = await fetch(url, { ...options, headers });
    
    // Handle empty responses
    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    }
    
    if (!response.ok) {
      console.error(`❌ API Error (${response.status}):`, data);
    } else {
      console.log(`✅ API Success:`, data);
    }
    
    return handleApiError(response, data);
  } catch (error) {
    console.error('💥 API Request Error:', error);
    
    // Network errors
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Network error. Please check your connection.');
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
  
  console.log('💾 Saving token:', token.substring(0, 20) + '...');
  
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
  console.log('🗑️ Clearing auth data');
  localStorage.removeItem('authToken');
  sessionStorage.removeItem('authToken');
  localStorage.removeItem('userInfo');
  localStorage.removeItem('tempRegister');
  localStorage.removeItem('onboardingData');
  localStorage.removeItem('kycData');
  localStorage.removeItem('registrationState');
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

export const verifyOTPEndpoint = async ({ email, otp }) => {
  console.log('🔍 Verifying OTP for:', email);
  
  try {
    const data = await makeRequest(`${API_BASE_URL}/verify_otp`, {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
      auth: true,
    });

    // Update token if provided
    if (data?.token) {
      setToken(data.token, true);
    }

    console.log('✅ OTP verification successful');

    return {
      user: data?.user || data?.data,
      token: data?.token,
      isVerified: true,
    };
  } catch (error) {
    console.error('❌ OTP verification failed:', error);
    throw error;
  }
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

// Helper to check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};