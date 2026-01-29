const API_BASE_URL = 'https://cosplitz-backend.onrender.com/api';

const handleApiError = (response, data) => {
  if (!response.ok) {
    const isOTPEndpoint = response.url.includes('/otp') || response.url.includes('/verify');
    if (response.status === 401 && !isOTPEndpoint) {
      clearAuth();
    }
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
    } else if (data?.otp && Array.isArray(data.otp)) {
      errorMessage = `OTP: ${data.otp.join(', ')}`;
    } else {
      errorMessage = `Request failed with status ${response.status}`;
    }
  
    console.error('API Error:', {
      url: response.url,
      status: response.status,
      statusText: response.statusText,
      data: data,
      errorMessage: errorMessage
    });
    
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
 
  console.log('API Request:', {
    url: url,
    method: options.method || 'GET',
    hasAuth: !!headers.Authorization,
    body: options.body ? JSON.parse(options.body) : null
  });

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json().catch(() => null);
    console.log('API Response:', {
      url: url,
      status: response.status,
      data: data
    });
    
    return handleApiError(response, data);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError = new Error('Network error. Please check your internet connection.');
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw error;
  }
}

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

// VERIFY OTP - with detailed logging and validation
export const verifyOTPEndpoint = async ({ email, otp }) => {
  // Validate inputs before sending
  if (!email || typeof email !== 'string') {
    console.error('Invalid email:', email);
    throw new Error('Email is required and must be a string');
  }
  
  if (!otp || typeof otp !== 'string') {
    console.error('Invalid OTP:', otp);
    throw new Error('OTP is required and must be a string');
  }
  
  // Log what we're sending
  console.log('Verifying OTP:', {
    email: email,
    otp: otp,
    otpLength: otp.length,
    otpType: typeof otp
  });
  
  const payload = {
    email: email.trim().toLowerCase(),
    otp: otp.trim()
  };
  
  console.log('Sending payload:', payload);
  
  const data = await makeRequest(`${API_BASE_URL}/verify_otp`, {
    method: 'POST',
    body: JSON.stringify(payload),
    auth: true,
  });

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