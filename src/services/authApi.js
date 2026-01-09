// src/services/authApi.js
const API_BASE_URL = "https://cosplitz-backend.onrender.com/api";

/** * Get authentication token from storage */
const getAuthToken = () => {
  try {
    return (
      sessionStorage.getItem("authToken") ||
      localStorage.getItem("authToken") ||
      null
    );
  } catch (error) {
    console.warn("Failed to access storage:", error);
    return null;
  }
};

/** * Set authentication token to storage */
const setAuthToken = (token, rememberMe = false) => {
  try {
    if (rememberMe) {
      localStorage.setItem("authToken", token);
      sessionStorage.removeItem("authToken");
    } else {
      sessionStorage.setItem("authToken", token);
      localStorage.removeItem("authToken");
    }
  } catch (error) {
    console.warn("Failed to set auth token:", error);
  }
};

/** * Clear all authentication data */
const clearAuthData = () => {
  try {
    sessionStorage.clear();
    localStorage.removeItem("authToken");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("rememberMe");
  } catch (error) {
    console.warn("Failed to clear auth data:", error);
  }
};

/* Generic API request handler */
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  const isFormData = options.body instanceof FormData;

  // Prepare headers
  const headers = {
    ...(!isFormData && { "Content-Type": "application/json" }),
    Accept: "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // Prepare body
  let body = options.body;
  if (body && !isFormData && typeof body === "object") {
    body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, {
      method: options.method || "GET",
      headers,
      body,
      credentials: "include",
      ...options,
    });

    return await handleResponse(response, endpoint);
  } catch (error) {
    return handleNetworkError(error);
  }
};

/* Handle API response */
const handleResponse = async (response, endpoint) => {
  let data;
  try {
    const text = await response.text();
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: "Invalid server response" };
  }

  const baseResult = {
    status: response.status,
    data,
    success: response.ok,
    error: !response.ok,
  };

  // Handle specific HTTP status codes
  switch (response.status) {
    case 400:
      return { ...baseResult, errorType: "VALIDATION_ERROR" };
    
    case 401:
      if (!isAuthEndpoint(endpoint)) {
        clearAuthData();
        setTimeout(() => {
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
        }, 100);
      }
      return { ...baseResult, errorType: "UNAUTHORIZED" };
    
    case 403:
      return { ...baseResult, errorType: "FORBIDDEN" };
    
    case 404:
      return { ...baseResult, errorType: "NOT_FOUND" };
    
    case 409:
      return { ...baseResult, errorType: "CONFLICT" };
    
    case 422:
      return { ...baseResult, errorType: "VALIDATION_ERROR" };
    
    case 429:
      return { ...baseResult, errorType: "RATE_LIMITED" };
    
    case 500:
    case 502:
    case 503:
    case 504:
      return { ...baseResult, errorType: "SERVER_ERROR" };
    
    default:
      return baseResult;
  }
};

/*Handle network errors */
const handleNetworkError = (error) => {
  console.error("Network error:", error);
  return {
    status: 0,
    data: { 
      message: "Network error. Please check your internet connection and try again." 
    },
    error: true,
    errorType: "NETWORK_ERROR",
    success: false,
  };
};

/* Check if endpoint is related to authentication */
const isAuthEndpoint = (endpoint) => {
  const authEndpoints = [
    "/register",
    "/login",
    "/verify_otp",
    "/otp/",
    "/forgot-password",
    "/reset-password",
    "/logout",
  ];
  
  return authEndpoints.some(authEndpoint => 
    endpoint.includes(authEndpoint)
  );
};

/*Authentication Service */
export const authService = {
  /*Register a new user POST /api/register/ */
  register: async (userData) => {
    const payload = {
      email: userData.email.toLowerCase().trim(),
      password: userData.password,
      first_name: userData.first_name,
      last_name: userData.last_name,
      ...(userData.username && { username: userData.username }),
      ...(userData.nationality && { nationality: userData.nationality }),
    };
    return await request("/register/", {
      method: "POST",
      body: payload,
    });
  },

  /* User login * POST /api/login/ */
  login: async (credentials) => {
    const payload = {
      email: credentials.email.toLowerCase().trim(),
      password: credentials.password,
    };
    return await request("/login/", {
      method: "POST",
      body: payload,
    });
  },

  /** Get current user info   * GET /api/user/info*/
  getUserInfo: async () => {
    return await request("/user/info", { method: "GET" });
  },

  /* Get OTP for user * GET /api/otp/{userId}/ */
  getOTP: async (userId) => {
    if (!userId) {
      return {
        status: 400,
        data: { message: "User ID is required" },
        error: true,
        errorType: "VALIDATION_ERROR",
      };
    }

    return await request(`/otp/${userId}/`, { method: "GET" });
  },

  /**   * Verify OTP * POST /api/verify_otp
   */
  verifyOTP: async (identifier, otp) => {
    if (!identifier || !otp) {
      return {
        status: 400,
        data: { message: "Identifier and OTP are required" },
        error: true,
        errorType: "VALIDATION_ERROR",
      };
    }

    const payload = {
      otp: otp.toString().trim(),
      ...(identifier.includes("@") 
        ? { email: identifier.toLowerCase().trim() }
        : { user_id: identifier }
      ),
    };

    return await request("/verify_otp", {
      method: "POST",
      body: payload,
    });
  },
  /**   * Resend OTP   */
  resendOTP: async (userId) => {
    return await authService.getOTP(userId);
  },
  /**   * User logout   * POST /api/logout/   */
  logout: async () => {
    const response = await request("/logout/", { method: "POST" });
    clearAuthData();
    return response;
  },

  /**   * Forgot password   * POST /api/forgot-password/   */
  forgotPassword: async (email) => {
    return await request("/forgot-password/", {
      method: "POST",
      body: { email: email.toLowerCase().trim() },
    });
  },

  /**
   * Reset password   * POST /api/reset-password/   */
  resetPassword: async (data) => {
    return await request("/reset-password/", {
      method: "POST",
      body: data,
    });
  },

  /**
   * Submit KYC   * POST /api/kyc/submit/   */
  submitKYC: async (formData) => {
    return await request("/kyc/submit/", {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set multipart headers
    });
  },

  /** Admin login   * POST /admin-api/login/   */
  adminLogin: async (credentials) => {
    return await request("/admin-api/login/", {
      method: "POST",
      body: credentials,
    });
  },
};

/* Splits Service */
export const splitsService = {
  /**   * Get all available splits   * GET /api/splits/   */
  getAllSplits: async () => {
    return await request("/splits/", { method: "GET" });
  },
  /**   * Create a new split   * POST /api/splits/   */
  createSplit: async (splitData) => {
    return await request("/splits/", {
      method: "POST",
      body: splitData,
    });
  },

  /**   * Update a split   * PATCH /api/splits/{id}/   */
  updateSplit: async (splitId, splitData) => {
    return await request(`/splits/${splitId}/`, {
      method: "PATCH",
      body: splitData,
    });
  },

  /**   * Delete a split   * DELETE /api/splits/{id}/   */
  deleteSplit: async (splitId) => {
    return await request(`/splits/${splitId}/`, {
      method: "DELETE",
    });
  },

  /**   * Join a split   * POST /api/splits/{id}/join_splits/   */
  joinSplit: async (splitId) => {
    return await request(`/splits/${splitId}/join_splits/`, {
      method: "POST",
    });
  },

  /**   * Get user's splits   * GET /api/splits/my_splits/   */
  getMySplits: async () => {
    return await request("/splits/my_splits/", { method: "GET" });
  },
};

/** * Notifications Service */
export const notificationsService = {
  /**   * Get user notifications   * GET /api/notifications/   */
  getNotifications: async () => {
    return await request("/notifications/", { method: "GET" });
  },

  /**   * Get single notification   * GET /api/notifications/{id}/   */
  getNotification: async (notificationId) => {
    return await request(`/notifications/${notificationId}/`, { method: "GET" });
  },

  /**   * Mark all notifications as read   * POST /api/notifications/mark_all_read/   */
  markAllAsRead: async () => {
    return await request("/notifications/mark_all_read/", {
      method: "POST",
    });
  },
};

/** * Dashboard Service */
export const dashboardService = {
  /**  * Get dashboard overview   * GET /api/dashboard/overview   */
  getOverview: async () => {
    return await request("/dashboard/overview", { method: "GET" });
  },
};

// Export utilities
export { getAuthToken, setAuthToken, clearAuthData };

export default {
  authService,
  splitsService,
  notificationsService,
  dashboardService,
  request,
};