/* src/services/authApi.js – UNIFIED & PRODUCTION READY */
const API_BASE_URL = "https://cosplitz-backend.onrender.com/api"; // ← NO trailing slash

/* ---------- helpers ---------- */
const getAuthToken = () => {
  try {
    return localStorage.getItem("authToken") || sessionStorage.getItem("authToken") || null;
  } catch {
    return null;
  }
};

const isAuthPath = (path = "") =>
  ["/register", "/verify", "/login", "/verify_otp"].some((p) => path.includes(p));

/* ---------- core fetch wrapper (unchanged behaviour) ---------- */
async function request(path, options = {}) {
  /*  strip leading slash so we never build “//”  */
  const cleanPath = path.replace(/^\/+/, "");
  const url = `${API_BASE_URL}/${cleanPath}`;

  const token = getAuthToken();
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json", Accept: "application/json" }),
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const config = { method: options.method || "GET", headers, ...options };
  if (config.body && !isFormData && typeof config.body === "object") {
    config.body = JSON.stringify(config.body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (netErr) {
    console.error("Network error:", netErr);
    return { status: 0, data: { message: "Network error. Check connection." }, error: true };
  }

  let json = null;
  try {
    const text = await response.text();
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { message: "Invalid server response." };
  }

  if (!response.ok) {
    const { status } = response;

    if (status === 401 && !isAuthPath(window.location.pathname) && !isAuthPath(path)) {
      try {
        ["authToken", "userInfo"].forEach((k) => {
          localStorage.removeItem(k);
          sessionStorage.removeItem(k);
        });
      } catch {}
      if (!window.location.pathname.includes("/login")) {
        setTimeout(() => (window.location.href = "/login"), 100);
      }
    }

    const message =
      status === 401
        ? "Unauthorized. Please log in."
        : status === 400
        ? "Invalid request data."
        : status === 409
        ? "This email is already registered."
        : status === 404
        ? "Resource not found."
        : status >= 500
        ? "Server error. Please try again later."
        : json?.message || `Request failed (${status})`;

    return { status, data: { ...json, message }, error: true };
  }
  return { status: response.status, data: json, success: true };
}

/* ============================================================
 * AUTHENTICATION
 * ============================================================ */
export const authService = {
  register: (userData) => request("register/", { method: "POST", body: userData }),
  login: ({ email, password }) =>
    request("login/", {
      method: "POST",
      body: { email: email.toLowerCase().trim(), password },
    }),
  logout: () => request("logout/", { method: "POST" }),
  getUserInfo: () => request("user/info", { method: "GET" }),
  getOTP: (userId) => request(`otp/${userId}/`, { method: "GET" }),
  verifyOTP: (identifier, otp) => {
    const body = /@/.test(identifier)
      ? { email: identifier.toLowerCase().trim(), otp: otp.toString().trim() }
      : { user_id: identifier, otp: otp.toString().trim() };
    return request("verify_otp/", { method: "POST", body });
  },
  resendOTP: (userId) => authService.getOTP(userId),
  forgotPassword: (email) =>
    request("forgot-password/", { method: "POST", body: { email: email.toLowerCase().trim() } }),
  resetPassword: (data) => request("reset-password/", { method: "POST", body: data }),
};

/* ============================================================
 * KYC
 * ============================================================ */
export const kycService = {
  submit: (formData) => request("kyc/submit/", { method: "POST", body: formData }),
};

/* ============================================================
 * SPLITS
 * ============================================================ */
export const splitsService = {
  list: () => request("api/splits/"), // public available splits
  create: (splitData) => request("api/splits/", { method: "POST", body: splitData }),
  update: (id, splitData) => request(`splits/${id}/`, { method: "PATCH", body: splitData }),
  remove: (id) => request(`splits/${id}/`, { method: "DELETE" }),
  join: (id) => request(`splits/${id}/join_splits/`, { method: "POST" }),
  mine: () => request("splits/my_splits/"), // authenticated user splits
};

/* ============================================================
 * NOTIFICATIONS
 * ============================================================ */
export const notificationService = {
  list: () => request("notifications/"),
  single: (id) => request(`notifications/${id}/`),
  markAllRead: () => request("notifications/mark_all_read/", { method: "POST" }),
};

/* ============================================================
 * DASHBOARD (wallet, analytics …)
 * ============================================================ */
export const dashboardService = {
  getOverview: () => request("dashboard/overview"),
  getAnalytics: (period = "monthly") => request(`dashboard/analytics?period=${period}`),
  getWalletBalance: () => request("wallet/balance"),
  createSplit: (splitData) => request("splits/create", { method: "POST", body: splitData }),
  getNotifications: () => request("notifications"),
};

/* ============================================================
 * ADMIN
 * ============================================================ */
export const adminService = {
  login: (cred) => request("admin-api/login/", { method: "POST", body: cred }),
  forgotPassword: (email) => request("admin-api/forget_password/", { method: "POST", body: { email } }),
  resetPassword: (data) => request("admin-api/reset_password/", { method: "POST", body: data }),
  getDashboardStats: () => request("admin/dashboard"),
  getUsers: (page = 1, limit = 20) => request(`admin/users?page=${page}&limit=${limit}`),
  getSplits: (page = 1, limit = 20) => request(`admin/splits?page=${page}&limit=${limit}`),
};

/* ============================================================
 * DEFAULT EXPORT (back-compat)
 * ============================================================ */
export default { request, authService, kycService, splitsService, notificationService, dashboardService, adminService };