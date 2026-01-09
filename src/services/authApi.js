// src/services/authApi.js - PRODUCTION READY
const API_BASE_URL = "https://cosplitz-backend.onrender.com/api";

function getAuthToken() {
  try {
    return sessionStorage.getItem("authToken") || null;
  } catch {
    return null;
  }
}

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;

  const defaultHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const token = getAuthToken();
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : defaultHeaders),
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const finalOptions = {
    method: options.method || "GET",
    headers,
    ...options,
  };

  if (finalOptions.body && !isFormData && typeof finalOptions.body === "object") {
    finalOptions.body = JSON.stringify(finalOptions.body);
  }

  let response;
  try {
    response = await fetch(url, finalOptions);
  } catch (err) {
    console.error("Network error:", err);
    return {
      status: 0,
      data: { message: "Network error. Please check your connection and try again." },
      error: true,
    };
  }

  let json = null;
  try {
    const text = await response.text();
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { message: "Invalid response from server." };
  }

  // Identify auth flow pages
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
      try {
        sessionStorage.clear();
      } catch (e) {
        console.warn("Failed to clear storage:", e);
      }

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

  // Handle 400 - Bad Request
  if (response.status === 400) {
    return {
      status: 400,
      data: json || { message: "Invalid request data." },
      error: true,
    };
  }

  // Handle 409 - Conflict (duplicate email)
  if (response.status === 409) {
    return {
      status: 409,
      data: json || { message: "This email is already registered." },
      error: true,
    };
  }

  // Handle 404 - Not Found
  if (response.status === 404) {
    return {
      status: 404,
      data: json || { message: "Resource not found." },
      error: true,
    };
  }

  // Handle 500 - Server Error
  if (response.status >= 500) {
    return {
      status: response.status,
      data: json || { message: "Server error. Please try again later." },
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

  return {
    status: response.status,
    data: json,
    success: true,
  };
}

export const authService = {
  /** REGISTER – POST /api/register/ */
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
    } catch (err) {
      console.error("Registration service error:", err);
      return {
        status: 0,
        data: { message: "Registration failed. Please try again." },
        error: true,
      };
    }
  },

  /** LOGIN – POST /api/login/ */
  login: async (credentials) => {
    try {
      const response = await request("/login/", {
        method: "POST",
        body: {
          email: credentials.email.toLowerCase().trim(),
          password: credentials.password,
        },
      });
      
      if (response.success && response.data?.token) {
        // Store token in sessionStorage
        try {
          sessionStorage.setItem("authToken", response.data.token);
        } catch (e) {
          console.warn("Failed to store token:", e);
        }
      }
      
      return response;
    } catch (err) {
      console.error("Login service error:", err);
      return {
        status: 0,
        data: { message: "Login failed. Please try again." },
        error: true,
      };
    }
  },

  /** USER INFO – GET /api/user/info */
  getUserInfo: async () => {
    try {
      return await request("/user/info", { method: "GET" });
    } catch (err) {
      console.error("Get user info error:", err);
      return {
        status: 0,
        data: { message: "Failed to fetch user information." },
        error: true,
      };
    }
  },

  /** GET OTP – GET /api/otp/{id}/ */
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
    } catch (err) {
      console.error("Get OTP error:", err);
      return {
        status: 0,
        data: { message: "Failed to send OTP. Please try again." },
        error: true,
      };
    }
  },

  /** VERIFY OTP – POST /api/verify_otp */
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
    } catch (err) {
      console.error("Verify OTP error:", err);
      return {
        status: 0,
        data: { message: "OTP verification failed. Please try again." },
        error: true,
      };
    }
  },

  /** RESEND OTP – Same as getOTP */
  resendOTP: async (userId) => {
    return await authService.getOTP(userId);
  },

  /** LOGOUT */
  logout: async () => {
    try {
      const response = await request("/logout/", { method: "POST" });
      
      // Clear storage regardless of response
      try {
        sessionStorage.clear();
      } catch (e) {
        console.warn("Failed to clear storage:", e);
      }
      
      return response;
    } catch (err) {
      console.error("Logout error:", err);
      // Still clear storage on error
      try {
        sessionStorage.clear();
      } catch (e) {
        console.warn("Failed to clear storage:", e);
      }
      return {
        status: 0,
        data: { message: "Logout completed locally." },
        success: true,
      };
    }
  },

  /** FORGOT PASSWORD */
  forgotPassword: async (email) => {
    try {
      return await request("/forgot-password/", {
        method: "POST",
        body: { email: email.toLowerCase().trim() },
      });
    } catch (err) {
      console.error("Forgot password error:", err);
      return {
        status: 0,
        data: { message: "Failed to send password reset email." },
        error: true,
      };
    }
  },

  /** RESET PASSWORD */
  resetPassword: async (data) => {
    try {
      return await request("/reset-password/", {
        method: "POST",
        body: data,
      });
    } catch (err) {
      console.error("Reset password error:", err);
      return {
        status: 0,
        data: { message: "Password reset failed. Please try again." },
        error: true,
      };
    }
  },
};

export const dashboardService = {
  getOverview: async () => {
    try {
      return await request("/dashboard/overview", { method: "GET" });
    } catch (err) {
      console.error("Dashboard overview error:", err);
      return {
        status: 0,
        data: { message: "Failed to load dashboard." },
        error: true,
      };
    }
  },

  getAnalytics: async (period = "monthly") => {
    try {
      return await request(`/dashboard/analytics?period=${period}`, {
        method: "GET",
      });
    } catch (err) {
      console.error("Analytics error:", err);
      return {
        status: 0,
        data: { message: "Failed to load analytics." },
        error: true,
      };
    }
  },

  createSplit: async (splitData) => {
    try {
      return await request("/splits/create", {
        method: "POST",
        body: splitData,
      });
    } catch (err) {
      console.error("Create split error:", err);
      return {
        status: 0,
        data: { message: "Failed to create split." },
        error: true,
      };
    }
  },

  getWalletBalance: async () => {
    try {
      return await request("/wallet/balance", { method: "GET" });
    } catch (err) {
      console.error("Wallet balance error:", err);
      return {
        status: 0,
        data: { message: "Failed to load wallet balance." },
        error: true,
      };
    }
  },

  getNotifications: async () => {
    try {
      return await request("/notifications", { method: "GET" });
    } catch (err) {
      console.error("Notifications error:", err);
      return {
        status: 0,
        data: { message: "Failed to load notifications." },
        error: true,
      };
    }
  },
};

export const adminService = {
  getDashboardStats: async () => {
    try {
      return await request("/admin/dashboard", { method: "GET" });
    } catch (err) {
      console.error("Admin dashboard error:", err);
      return {
        status: 0,
        data: { message: "Failed to load admin dashboard." },
        error: true,
      };
    }
  },

  getUsers: async (page = 1, limit = 20) => {
    try {
      return await request(`/admin/users?page=${page}&limit=${limit}`, {
        method: "GET",
      });
    } catch (err) {
      console.error("Admin users error:", err);
      return {
        status: 0,
        data: { message: "Failed to load users." },
        error: true,
      };
    }
  },

  getSplits: async (page = 1, limit = 20) => {
    try {
      return await request(`/admin/splits?page=${page}&limit=${limit}`, {
        method: "GET",
      });
    } catch (err) {
      console.error("Admin splits error:", err);
      return {
        status: 0,
        data: { message: "Failed to load splits." },
        error: true,
      };
    }
  },
};

export default {
  request,
  authService,
  dashboardService,
  adminService,
};