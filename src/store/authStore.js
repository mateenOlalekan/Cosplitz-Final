/* src/store/authStore.js – with console.log breadcrumbs */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "../services/authApi";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      /* ---------- state ---------- */
      user: null,
      token: null,
      error: null,
      isLoading: false,
      tempRegister: null,
      _authInitialized: false,
      cameThroughAuth: false,

      /* ---------- low-level setters ---------- */
      setToken: (token, persist = true) => {
        console.log("[AuthStore] setToken ->", token?.slice(-6), "persist:", persist);
        set({ token });
        try {
          if (persist) {
            localStorage.setItem("authToken", token);
            sessionStorage.removeItem("authToken");
          } else {
            sessionStorage.setItem("authToken", token);
            localStorage.removeItem("authToken");
          }
        } catch (e) {
          console.warn("[AuthStore] setToken localStorage error:", e);
        }
      },

      setUser: (u) => {
        console.log("[AuthStore] setUser ->", u);
        set({ user: u });
        try {
          u
            ? localStorage.setItem("userInfo", JSON.stringify(u))
            : localStorage.removeItem("userInfo");
        } catch (e) {
          console.warn("[AuthStore] setUser localStorage error:", e);
        }
      },

      setError: (msg) => {
        console.warn("[AuthStore] setError ->", msg);
        set({ error: msg });
      },
      clearError: () => {
        console.log("[AuthStore] clearError");
        set({ error: null });
      },

      /* ---------- registration ---------- */
      register: async (userData) => {
        console.log("[AuthStore] register called with ->", userData);
        set({ isLoading: true, error: null });
        const res = await authService.register(userData);
        console.log("[AuthStore] register response ->", res);
        if (res.error) {
          const msg = res.data?.message || res.data?.error || "Registration failed";
          console.error("[AuthStore] register FAILED ->", msg);
          set({ error: msg, isLoading: false });
          return { success: false, error: msg, status: res.status };
        }
        const temp = { email: userData.email, userId: res.data?.user?.id || res.data?.id, ...res.data };
        console.log("[AuthStore] register SUCCESS – tempRegister ->", temp);
        set({ tempRegister: temp, error: null, isLoading: false, cameThroughAuth: true });
        return { success: true, data: res.data, requiresVerification: true };
      },

      setPendingVerification: (data) => {
        console.log("[AuthStore] setPendingVerification ->", data);
        set({ tempRegister: data });
      },

      /* ---------- otp ---------- */
      verifyOTP: async (identifier, otp) => {
        console.log("[AuthStore] verifyOTP -> identifier:", identifier, "otp:", otp);
        set({ isLoading: true, error: null });
        const res = await authService.verifyOTP(identifier, otp);
        console.log("[AuthStore] verifyOTP response ->", res);
        if (res.error) {
          const msg = res.data?.message || "Invalid OTP";
          console.error("[AuthStore] verifyOTP FAILED ->", msg);
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
        const { token, user } = res.data?.token ? res.data : { token: res.data?.access_token, user: res.data?.user || res.data?.data };
        if (!token || !user) {
          console.error("[AuthStore] verifyOTP incomplete – missing token/user");
          set({ error: "Verification incomplete", isLoading: false });
          return { success: false, error: "Verification incomplete" };
        }
        console.log("[AuthStore] verifyOTP SUCCESS – token:", token.slice(-6), "user:", user);
        set({ user, token, tempRegister: null, error: null, isLoading: false });
        try {
          localStorage.setItem("authToken", token);
          localStorage.setItem("userInfo", JSON.stringify(user));
          sessionStorage.removeItem("authToken");
          sessionStorage.removeItem("userInfo");
        } catch (e) {
          console.warn("[AuthStore] verifyOTP localStorage error:", e);
        }
        return { success: true, data: { user, token } };
      },

      resendOTP: async (userId) => {
        console.log("[AuthStore] resendOTP -> userId:", userId);
        set({ isLoading: true, error: null });
        const res = await authService.resendOTP(userId);
        console.log("[AuthStore] resendOTP response ->", res);
        if (res.error) {
          const msg = res.data?.message || "Failed to resend OTP";
          console.error("[AuthStore] resendOTP FAILED ->", msg);
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
        console.log("[AuthStore] resendOTP SUCCESS");
        set({ isLoading: false });
        return { success: true, message: "OTP resent successfully" };
      },

      /* ---------- login ---------- */
      login: async (credentials) => {
        console.log("[AuthStore] login called with ->", credentials);
        set({ isLoading: true, error: null });
        const res = await authService.login(credentials);
        console.log("[AuthStore] login response ->", res);
        if (res.error) {
          const msg = res.data?.message || res.data?.error || "Login failed";
          console.error("[AuthStore] login FAILED ->", msg);
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
        const { token, user } = res.data?.token ? res.data : { token: res.data?.access_token, user: res.data?.user || res.data?.data };
        if (!token || !user) {
          console.error("[AuthStore] login incomplete – missing token/user");
          set({ error: "Invalid response from server", isLoading: false });
          return { success: false, error: "Invalid response from server" };
        }
        console.log("[AuthStore] login SUCCESS – token:", token.slice(-6), "user:", user);
        set({ user, token, error: null, isLoading: false, cameThroughAuth: true });
        try {
          localStorage.setItem("authToken", token);
          localStorage.setItem("userInfo", JSON.stringify(user));
          sessionStorage.removeItem("authToken");
          sessionStorage.removeItem("userInfo");
        } catch (e) {
          console.warn("[AuthStore] login localStorage error:", e);
        }
        return { success: true, data: { user, token } };
      },

      /* ---------- logout ---------- */
      logout: async () => {
        console.log("[AuthStore] logout called");
        set({ isLoading: true });
        try {
          await authService.logout();
          console.log("[AuthStore] logout API call finished");
        } catch (e) {
          console.warn("[AuthStore] logout API error (ignored):", e);
        }
        set({ user: null, token: null, error: null, tempRegister: null, isLoading: false, cameThroughAuth: false });
        try {
          localStorage.removeItem("authToken");
          localStorage.removeItem("userInfo");
          sessionStorage.removeItem("authToken");
          sessionStorage.removeItem("userInfo");
        } catch (e) {
          console.warn("[AuthStore] logout localStorage error:", e);
        }
        if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/register")) {
          console.log("[AuthStore] redirecting to /login");
          setTimeout(() => (window.location.href = "/login"), 100);
        }
      },

      /* ---------- password reset ---------- */
      forgotPassword: async (email) => {
        console.log("[AuthStore] forgotPassword -> email:", email);
        set({ isLoading: true, error: null });
        const res = await authService.forgotPassword(email);
        console.log("[AuthStore] forgotPassword response ->", res);
        if (res.error) {
          const msg = res.data?.message || "Failed to send reset email";
          console.error("[AuthStore] forgotPassword FAILED ->", msg);
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
        console.log("[AuthStore] forgotPassword SUCCESS");
        set({ isLoading: false });
        return { success: true, message: "Password reset email sent" };
      },

      resetPassword: async (data) => {
        console.log("[AuthStore] resetPassword -> data:", data);
        set({ isLoading: true, error: null });
        const res = await authService.resetPassword(data);
        console.log("[AuthStore] resetPassword response ->", res);
        if (res.error) {
          const msg = res.data?.message || "Password reset failed";
          console.error("[AuthStore] resetPassword FAILED ->", msg);
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
        console.log("[AuthStore] resetPassword SUCCESS");
        set({ isLoading: false });
        return { success: true, message: "Password reset successful" };
      },

      /* ---------- user info ---------- */
      fetchUserInfo: async () => {
        console.log("[AuthStore] fetchUserInfo called");
        set({ isLoading: true, error: null });
        const res = await authService.getUserInfo();
        console.log("[AuthStore] fetchUserInfo response ->", res);
        if (res.error) {
          if (res.status !== 401) set({ error: res.data?.message });
          console.warn("[AuthStore] fetchUserInfo FAILED (non-401) ->", res.data?.message);
          set({ isLoading: false });
          return { success: false };
        }
        const user = res.data?.user || res.data;
        console.log("[AuthStore] fetchUserInfo SUCCESS -> user:", user);
        set({ user, isLoading: false });
        try {
          localStorage.setItem("userInfo", JSON.stringify(user));
        } catch (e) {
          console.warn("[AuthStore] fetchUserInfo localStorage error:", e);
        }
        return { success: true, data: user };
      },

      /* ---------- helpers ---------- */
      isAuthenticated: () => {
        const ok = !!get().token && !!get().user;
        console.log("[AuthStore] isAuthenticated ->", ok);
        return ok;
      },
      isAdmin: () => {
        const u = get().user;
        const ok = u?.role === "admin" || u?.is_admin === true;
        console.log("[AuthStore] isAdmin ->", ok);
        return ok;
      },

      /* ---------- hydration-safe initializer ---------- */
      initializeAuth: () => {
        console.log("[AuthStore] initializeAuth started");
        try {
          const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
          const userRaw = localStorage.getItem("userInfo");
          const user = userRaw ? JSON.parse(userRaw) : null;
          console.log("[AuthStore] initializeAuth – token:", token?.slice(-6), "user:", user);
          set({ token: token || null, user, _authInitialized: true });
          if (token && !user) {
            console.log("[AuthStore] token exists but no user – fetching user info");
            get().fetchUserInfo();
          }
        } catch (err) {
          console.error("[AuthStore] initializeAuth error:", err);
          set({ token: null, user: null, _authInitialized: true });
        }
      },

      isAuthInitialized: () => get()._authInitialized,

      /* ---------- legacy support ---------- */
      completeRegistration: (userData, token) => {
        console.log("[AuthStore] completeRegistration -> user:", userData, "token:", token?.slice(-6));
        set({ user: userData, token, tempRegister: null, error: null, isLoading: false });
        try {
          localStorage.setItem("authToken", token);
          localStorage.setItem("userInfo", JSON.stringify(userData));
          sessionStorage.removeItem("authToken");
          sessionStorage.removeItem("userInfo");
        } catch (e) {
          console.warn("[AuthStore] completeRegistration localStorage error:", e);
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (s) => ({ token: s.token, user: s.user }),
    }
  )
);

export default useAuthStore;