/* src/store/authStore.js – bullet-proof auto-login + first-class getOTP */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "../services/authApi";

/* ---------- tiny coloured logger ---------- */
const COL = {
  ok: "color: #2ecc71; font-weight: bold",
  warn: "color: #f39c12; font-weight: bold",
  err: "color: #e74c3c; font-weight: bold",
  info: "color: #3498db; font-weight: bold",
};
const log = (msg, style = COL.info, ...rest) =>
  console.log(`%c[AuthStore] ${msg}`, style, ...rest);

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
        log(`setToken (${persist ? "local" : "session"}) ➜ …${token?.slice(-6)}`, COL.ok);
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
          log("setToken localStorage error", COL.err, e);
        }
      },

      setUser: (u) => {
        log("setUser", COL.ok, u);
        set({ user: u });
        try {
          u
            ? localStorage.setItem("userInfo", JSON.stringify(u))
            : localStorage.removeItem("userInfo");
        } catch (e) {
          log("setUser localStorage error", COL.err, e);
        }
      },

      setError: (msg) => {
        log("setError", COL.err, msg);
        set({ error: msg });
      },
      clearError: () => {
        log("clearError", COL.warn);
        set({ error: null });
      },

      /* ---------- registration → auto-login → auto-getOTP ---------- */
      register: async (userData) => {
        log("register called with", userData);
        set({ isLoading: true, error: null });
        const res = await authService.register(userData);
        if (res.error) {
          const msg = res.data?.message || res.data?.error || "Registration failed";
          log("register FAILED", COL.err, msg);
          set({ error: msg, isLoading: false });
          return { success: false, error: msg, status: res.status };
        }
        const temp = { email: userData.email, userId: res.data?.user?.id || res.data?.id, ...res.data };
        log("register SUCCESS – tempRegister", COL.ok, temp);
        set({ tempRegister: temp, error: null, isLoading: false, cameThroughAuth: true });

        /* 1.  AUTO-LOGIN with same credentials  */
        log("auto-login with registered credentials");
        const loginRes = await get().login({
          email: userData.email,
          password: userData.password,
        });
        if (!loginRes.success) {
          log("auto-login failed – surface error", COL.err, loginRes.error);
          set({ error: loginRes.error });
          return { success: false, error: loginRes.error };
        }

        /* 2.  AUTO-getOTP (now that we have a token)  */
        const userId = loginRes.data.user.id;
        log("auto-getOTP for logged-in user", userId);
        const otpRes = await get().getOTP(userId);
        if (!otpRes.success) {
          log("auto-getOTP failed – surface error", COL.err, otpRes.error);
          set({ error: otpRes.error || "Server did not send OTP. Please tap Resend Code." });
        }
        return { success: true, data: res.data, requiresVerification: true };
      },

      setPendingVerification: (data) => set({ tempRegister: data }),

      /* ---------- NEW: first-class getOTP ---------- */
      getOTP: async (userId) => {
        log("getOTP – userId", userId);
        set({ isLoading: true, error: null });
        const res = await authService.getOTP(userId);
        if (res.error) {
          const msg = res.data?.message || "Failed to get OTP";
          log("getOTP FAILED", COL.err, msg);
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
        /* insist backend really says “sent” */
        if (res.data?.message !== "OTP sent") {
          log('getOTP backend did NOT return { message: "OTP sent" }', COL.warn, res.data);
          const msg = res.data?.message || "OTP not dispatched by server";
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
        log("getOTP SUCCESS – server claims OTP was sent", COL.ok);
        set({ isLoading: false });
        return { success: true, message: "OTP sent" };
      },

      /* ---------- resendOTP now DELEGATES to getOTP ---------- */
      resendOTP: async (userId) => {
        /* simply call the new method */
        return get().getOTP(userId);
      },

      /* ---------- login (BULLET-PROOF) ---------- */
      login: async (credentials) => {
        log("login called with", credentials);
        set({ isLoading: true, error: null });
        const res = await authService.login(credentials);
        if (res.error) {
          const msg = res.data?.message || res.data?.error || "Login failed";
          log("login FAILED", COL.err, msg);
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }

        /* ---------- BULLET-PROOF extractor ---------- */
        const token = res.data?.token || res.data?.access_token || res.data?.accessToken;
        const user = res.data?.user || res.data?.data?.user || res.data?.data;

        if (!token || !user) {
          log("login incomplete – missing token/user", COL.err, { token, user, data: res.data });
          set({ error: "Invalid response from server", isLoading: false });
          return { success: false, error: "Invalid response from server" };
        }

        log("login SUCCESS – token …%s user", token.slice(-6), user);
        set({ user, token, error: null, isLoading: false, cameThroughAuth: true });
        try {
          localStorage.setItem("authToken", token);
          localStorage.setItem("userInfo", JSON.stringify(user));
          sessionStorage.removeItem("authToken");
          sessionStorage.removeItem("userInfo");
        } catch (e) {
          log("login localStorage error", COL.err, e);
        }
        return { success: true, data: { user, token } };
      },

      /* ---------- logout ---------- */
      logout: async () => {
        log("logout called", COL.warn);
        set({ isLoading: true });
        try {
          await authService.logout();
        } catch (e) {
          log("logout API error (ignored)", COL.warn, e);
        }
        set({ user: null, token: null, error: null, tempRegister: null, isLoading: false, cameThroughAuth: false });
        try {
          localStorage.removeItem("authToken");
          localStorage.removeItem("userInfo");
          sessionStorage.removeItem("authToken");
          sessionStorage.removeItem("userInfo");
        } catch (e) {
          log("logout localStorage error", COL.warn, e);
        }
        if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/register")) {
          setTimeout(() => (window.location.href = "/login"), 100);
        }
      },

      /* ---------- password reset ---------- */
      forgotPassword: async (email) => {
        log("forgotPassword – email", email);
        set({ isLoading: true, error: null });
        const res = await authService.forgotPassword(email);
        if (res.error) {
          const msg = res.data?.message || "Failed to send reset email";
          log("forgotPassword FAILED", COL.err, msg);
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
        log("forgotPassword SUCCESS", COL.ok);
        set({ isLoading: false });
        return { success: true, message: "Password reset email sent" };
      },

      resetPassword: async (data) => {
        log("resetPassword – data", data);
        set({ isLoading: true, error: null });
        const res = await authService.resetPassword(data);
        if (res.error) {
          const msg = res.data?.message || "Password reset failed";
          log("resetPassword FAILED", COL.err, msg);
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
        log("resetPassword SUCCESS", COL.ok);
        set({ isLoading: false });
        return { success: true, message: "Password reset successful" };
      },

      /* ---------- user info ---------- */
      fetchUserInfo: async () => {
        log("fetchUserInfo started");
        set({ isLoading: true, error: null });
        const res = await authService.getUserInfo();
        if (res.error) {
          if (res.status !== 401) set({ error: res.data?.message });
          log("fetchUserInfo FAILED (non-401)", COL.warn, res.data?.message);
          set({ isLoading: false });
          return { success: false };
        }
        const user = res.data?.user || res.data;
        log("fetchUserInfo SUCCESS – user", COL.ok, user);
        set({ user, isLoading: false });
        try {
          localStorage.setItem("userInfo", JSON.stringify(user));
        } catch (e) {
          log("fetchUserInfo localStorage error", COL.err, e);
        }
        return { success: true, data: user };
      },

      /* ---------- helpers ---------- */
      isAuthenticated: () => {
        const ok = !!get().token && !!get().user;
        log("isAuthenticated ->", ok);
        return ok;
      },
      isAdmin: () => {
        const u = get().user;
        const ok = u?.role === "admin" || u?.is_admin === true;
        log("isAdmin ->", ok);
        return ok;
      },
      initializeAuth: () => {
        log("initializeAuth started");
        try {
          const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
          const userRaw = localStorage.getItem("userInfo");
          const user = userRaw ? JSON.parse(userRaw) : null;
          set({ token: token || null, user, _authInitialized: true });
          if (token && !user) get().fetchUserInfo();
        } catch (err) {
          log("initializeAuth error", COL.err, err);
          set({ token: null, user: null, _authInitialized: true });
        }
      },
      isAuthInitialized: () => get()._authInitialized,
    }),
    {
      name: "auth-storage",
      partialize: (s) => ({ token: s.token, user: s.user }),
    }
  )
);

// global off-switch for production
if (typeof window !== "undefined") window.DEBUG_AUTH = true; // set false to silence
export default useAuthStore;