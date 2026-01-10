/* src/store/authStore.js – drop-in replacement – keeps every existing action */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "../services/authApi";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      error: null,
      isLoading: false,
      tempRegister: null,

      /* ---------- low-level setters ---------- */
      setToken: (token, persist = true) => {
        set({ token });
        try {
          if (persist) {
            localStorage.setItem("authToken", token);
            sessionStorage.removeItem("authToken");
          } else {
            sessionStorage.setItem("authToken", token);
            localStorage.removeItem("authToken");
          }
        } catch {}
      },

      setUser: (u) => {
        set({ user: u });
        try {
          u
            ? localStorage.setItem("userInfo", JSON.stringify(u))
            : localStorage.removeItem("userInfo");
        } catch {}
      },

      setError: (msg) => set({ error: msg }),
      clearError: () => set({ error: null }),

      /* ---------- registration ---------- */
      register: async (userData) => {
        set({ isLoading: true, error: null });
        const res = await authService.register(userData);
        if (res.error) {
          const msg = res.data?.message || res.data?.error || "Registration failed";
          set({ error: msg, isLoading: false });
          return { success: false, error: msg, status: res.status };
        }
        const temp = { email: userData.email, userId: res.data?.user?.id || res.data?.id, ...res.data };
        set({ tempRegister: temp, error: null, isLoading: false });
        return { success: true, data: res.data, requiresVerification: true };
      },

      setPendingVerification: (data) => set({ tempRegister: data }),

      /* ---------- otp ---------- */
      verifyOTP: async (identifier, otp) => {
        set({ isLoading: true, error: null });
        const res = await authService.verifyOTP(identifier, otp);
        if (res.error) {
          const msg = res.data?.message || "Invalid OTP";
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
        const { token, user } = res.data?.token ? res.data : { token: res.data?.access_token, user: res.data?.user || res.data?.data };
        if (!token || !user) {
          set({ error: "Verification incomplete", isLoading: false });
          return { success: false, error: "Verification incomplete" };
        }
        set({ user, token, tempRegister: null, error: null, isLoading: false });
        try {
          localStorage.setItem("authToken", token);
          localStorage.setItem("userInfo", JSON.stringify(user));
          sessionStorage.removeItem("authToken");
          sessionStorage.removeItem("userInfo");
        } catch {}
        return { success: true, data: { user, token } };
      },

      resendOTP: async (userId) => {
        set({ isLoading: true, error: null });
        const res = await authService.resendOTP(userId);
        if (res.error) {
          const msg = res.data?.message || "Failed to resend OTP";
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
        set({ isLoading: false });
        return { success: true, message: "OTP resent successfully" };
      },

      /* ---------- login ---------- */
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        const res = await authService.login(credentials);
        if (res.error) {
          const msg = res.data?.message || res.data?.error || "Login failed";
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
        const { token, user } = res.data?.token ? res.data : { token: res.data?.access_token, user: res.data?.user || res.data?.data };
        if (!token || !user) {
          set({ error: "Invalid response from server", isLoading: false });
          return { success: false, error: "Invalid response from server" };
        }
        set({ user, token, error: null, isLoading: false });
        try {
          localStorage.setItem("authToken", token);
          localStorage.setItem("userInfo", JSON.stringify(user));
          sessionStorage.removeItem("authToken");
          sessionStorage.removeItem("userInfo");
        } catch {}
        return { success: true, data: { user, token } };
      },

      /* ---------- logout ---------- */
      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
        } catch {}
        set({ user: null, token: null, error: null, tempRegister: null, isLoading: false });
        try {
          localStorage.removeItem("authToken");
          localStorage.removeItem("userInfo");
          sessionStorage.removeItem("authToken");
          sessionStorage.removeItem("userInfo");
        } catch {}
        if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/register")) {
          setTimeout(() => (window.location.href = "/login"), 100);
        }
      },

      /* ---------- password reset ---------- */
      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        const res = await authService.forgotPassword(email);
        if (res.error) {
          const msg = res.data?.message || "Failed to send reset email";
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
        set({ isLoading: false });
        return { success: true, message: "Password reset email sent" };
      },

      resetPassword: async (data) => {
        set({ isLoading: true, error: null });
        const res = await authService.resetPassword(data);
        if (res.error) {
          const msg = res.data?.message || "Password reset failed";
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
        set({ isLoading: false });
        return { success: true, message: "Password reset successful" };
      },

      /* ---------- user info ---------- */
      fetchUserInfo: async () => {
        set({ isLoading: true, error: null });
        const res = await authService.getUserInfo();
        if (res.error) {
          if (res.status !== 401) set({ error: res.data?.message });
          set({ isLoading: false });
          return { success: false };
        }
        const user = res.data?.user || res.data;
        set({ user, isLoading: false });
        try {
          localStorage.setItem("userInfo", JSON.stringify(user));
        } catch {}
        return { success: true, data: user };
      },

      /* ---------- helpers ---------- */
      isAuthenticated: () => !!get().token && !!get().user,
      isAdmin: () => {
        const u = get().user;
        return u?.role === "admin" || u?.is_admin === true;
      },

      /* ---------- hydration-safe initializer ---------- */
      initializeAuth: async () => {
        try {
          const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
          const userRaw = localStorage.getItem("userInfo") || sessionStorage.getItem("userInfo");
          const user = userRaw ? JSON.parse(userRaw) : null;
          set({ token: token || null, user, isLoading: false });
          if (token && !user) {
            await get().fetchUserInfo();
          }
        } catch (err) {
          // Only log in development
          if (process.env.NODE_ENV === "development") {
            console.error("Auth init error:", err);
          }
          set({ token: null, user: null, isLoading: false });
        }
      },

      /* ---------- legacy support ---------- */
      completeRegistration: (userData, token) => {
        set({ user: userData, token, tempRegister: null, error: null, isLoading: false });
        try {
          localStorage.setItem("authToken", token);
          localStorage.setItem("userInfo", JSON.stringify(userData));
          sessionStorage.removeItem("authToken");
          sessionStorage.removeItem("userInfo");
        } catch {}
      },
    }),
    {
      name: "auth-storage",
      partialize: (s) => ({ token: s.token, user: s.user }),
    }
  )
);

export default useAuthStore;