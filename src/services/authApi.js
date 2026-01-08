// src/services/authApi.js - PRODUCTION READY REFACTORED
const API_BASE_URL = "https://cosplitz-backend.onrender.com/api";

/* Get authentication token from storage * Prioritizes sessionStorage (short-lived) over localStorage */
function getAuthToken() {
  try {
    return (
      sessionStorage.getItem("authToken") || 
      localStorage.getItem("authToken") || 
      null
    );
  } catch (error) {
    console.error("Error accessing storage:", error);
    return null;
  }
}

/**
 * Generic request handler with comprehensive error handling
 */
async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const token = getAuthToken();
  const isFormData = options.body instanceof FormData;

  // Build headers
  const headers = {
    ...(isFormData ? {} : {
      "Content-Type": "application/json",
      Accept: "application/json",
    }),
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Build request options
  const finalOptions = {
    method: options.method || "GET",
    headers,
    ...options,
  };

  // Stringify body if needed
  if (finalOptions.body && !isFormData && typeof finalOptions.body === "object") {
    finalOptions.body = JSON.stringify(finalOptions.body);
  }

  let response;
  try {
    response = await fetch(url, finalOptions);
  } catch (error) {
    console.error("Network error:", error);
    return {
      status: 0,
      data: { message: "Network error. Please check your connection." },
      error: true,
    };
  }

  // Parse response
  let json = null;
  try {
    const text = await response.text();
    json = text ? JSON.parse(text) : null;
  } catch (parseError) {
    console.error("JSON parse error:", parseError);
    json = { message: "Invalid response from server." };
  }

  // Check if we're in an auth flow
  const isAuthFlow = 
    window.location.pathname.includes("/register") ||
    window.location.pathname.includes("/verify") ||
    window.location.pathname.includes("/login") ||
    path.includes("/verify_otp") ||
    path.includes("/otp/") ||
    path.includes("/register");

  // Handle 401 - Unauthorized
  if (response.status === 401) {
    if (!isAuthFlow) {
      // Clear all auth data
      clearAuthStorage();

      // Redirect to login
      if (!window.location.pathname.includes("/login")) {
        setTimeout(() => {
          window.location.href = "/login";
        }, 100);
      }
    }

    return {
      status: 401,
      data: json || { message: "Unauthorized. Please log in." },
      error: true,
      unauthorized: !isAuthFlow,
    };
  }

  // Handle other status codes
  const statusHandlers = {
    400: { message: "Invalid request data." },
    404: { message: "Resource not found." },
    409: { message: "This email is already registered." },
    500: { message: "Server error. Please try again later." },
  };

  if (statusHandlers[response.status] || response.status >= 500) {
    return {
      status: response.status,
      data: json || statusHandlers[response.status] || statusHandlers[500],
      error: true,
    };
  }

  // Generic error handling
  if (!response.ok) {
    return {
      status: response.status,
      data: json || { message: `Request failed with status ${response.status}` },
      error: true,
    };
  }

  // Success
  return {
    status: response.status,
    data: json,
    success: true,
  };
}

/**
 * Clear all authentication data from storage
 */
function clearAuthStorage() {
  try {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userInfo");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userInfo");
  } catch (error) {
    console.warn("Failed to clear storage:", error);
  }
}

/**
 * Authentication service
 */
export const authService = {
  /**
   * Register new user
   */
  register: async (userData) => {
    try {
      const response = await request("/register/", {
        method: "POST",
        body: userData,
      });
      
      // Enhanced error handling for duplicate emails
      if (response.error && response.status === 409) {
        return {
          ...response,
          data: {
            ...response.data,
            message: "This email address is already registered. Please use a different email or try logging in.",
          },
        };
      }
      
      return response;
    } catch (error) {
      console.error("Registration service error:", error);
      return {
        status: 0,
        data: { message: "Registration failed. Please try again." },
        error: true,
      };
    }
  },

  /**
   * Login user
   */
  login: async (credentials) => {
    try {
      const response = await request("/login/", {
        method: "POST",
        body: {
          email: credentials.email.toLowerCase().trim(),
          password: credentials.password,
        },
      });
      
      return response;
    } catch (error) {
      console.error("Login service error:", error);
      return {
        status: 0,
        data: { message: "Login failed. Please try again." },
        error: true,
      };
    }
  },

  /**
   * Get current user info
   */
  getUserInfo: async () => {
    try {
      return await request("/user/info", { method: "GET" });
    } catch (error) {
      console.error("Get user info error:", error);
      return {
        status: 0,
        data: { message: "Failed to fetch user information." },
        error: true,
      };
    }
  },

  /**
   * Request OTP for user
   */
  getOTP: async (userId) => {
    try {
      if (!userId) {
        return {
          status: 400,
          data: { message: "User ID is required to send OTP." },
          error: true,
        };
      }
      return await request(`/otp/${userId}/`, { method: "GET" });
    } catch (error) {
      console.error("Get OTP error:", error);
      return {
        status: 0,
        data: { message: "Failed to send OTP. Please try again." },
        error: true,
      };
    }
  },

  /**
   * Verify OTP code
   */
  verifyOTP: async (identifier, otp) => {
    try {
      if (!identifier || !otp) {
        return {
          status: 400,
          data: { message: "Email and OTP are required." },
          error: true,
        };
      }
      
      // Accept either email or userId
      const body = /@/.test(identifier) 
        ? { email: identifier.toLowerCase().trim(), otp: otp.toString().trim() }
        : { user_id: identifier, otp: otp.toString().trim() };
      
      return await request("/verify_otp", {
        method: "POST",
        body: body,
      });
    } catch (error) {
      console.error("Verify OTP error:", error);
      return {
        status: 0,
        data: { message: "OTP verification failed. Please try again." },
        error: true,
      };
    }
  },

  /**
   * Resend OTP
   */
  resendOTP: async (userId) => {
    return await authService.getOTP(userId);
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      const response = await request("/logout/", { method: "POST" });
      
      // Clear storage regardless of response
      clearAuthStorage();
      
      return response;
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear storage on error
      clearAuthStorage();
      return {
        status: 0,
        data: { message: "Logout completed locally." },
        success: true,
      };
    }
  },

  /**
   * Request password reset
   */
  forgotPassword: async (email) => {
    try {
      return await request("/forgot-password/", {
        method: "POST",
        body: { email: email.toLowerCase().trim() },
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      return {
        status: 0,
        data: { message: "Failed to send password reset email." },
        error: true,
      };
    }
  },

  /**
   * Reset password with token
   */
  resetPassword: async (data) => {
    try {
      return await request("/reset-password/", {
        method: "POST",
        body: data,
      });
    } catch (error) {
      console.error("Reset password error:", error);
      return {
        status: 0,
        data: { message: "Password reset failed. Please try again." },
        error: true,
      };
    }
  },
};

export default {
  request,
  authService,
  getAuthToken,
  clearAuthStorage,
}; 