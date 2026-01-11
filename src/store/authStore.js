/* src/store/authStore.js – refactored but still 100 % API-compatible */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authApi';

/* ---------- tiny helpers (internal only) ---------- */
const _catch = (cb) => (...a) => cb(...a).catch(() => ({ error: true, data: { message: 'Network error' } }));

const _normalizeAuthRes = (res) => {
  /* the backend sometimes returns the payload under `data`, sometimes flat */
  const src = res.data?.data || res.data;
  return {
    token: src?.access_token || src?.token,
    user:  src?.user       || src,
  };
};

/* ============================================================
 * STORE
 * ============================================================ */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      error: null,
      isLoading: false,
      tempRegister: null,

      /* ---------- low-level helpers ---------- */
      _setLoading: (v) => set({ isLoading: v }),
      _setError:   (m) => set({ error: m }),
      clearError:  ()  => set({ error: null }),

      /* ---------- registration ---------- */
      register: async (payload) => {
        set({ isLoading: true, error: null });
        const res = await authService.register(payload);
        if (res.error) {
          const msg = res.data?.message || 'Registration failed';
          set({ error: msg, isLoading: false });
          return { success: false, error: msg, status: res.status };
        }
        const temp = { email: payload.email, userId: res.data?.id };
        set({ tempRegister: temp, isLoading: false });
        return { success: true, data: res.data, requiresVerification: true };
      },

      setPendingVerification: (d) => set({ tempRegister: d }),

      /* ---------- OTP ---------- */
      verifyOTP: async (identifier, otp) => {
        set({ isLoading: true, error: null });
        const res = await authService.verifyOTP(identifier, otp);
        if (res.error) {
          const msg = res.data?.message || 'Invalid OTP';
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
        const { token, user } = _normalizeAuthRes(res);
        if (!token || !user) {
          set({ error: 'Verification incomplete', isLoading: false });
          return { success: false, error: 'Verification incomplete' };
        }
        set({ user, token, tempRegister: null, error: null, isLoading: false });
        return { success: true, data: { user, token } };
      },

      resendOTP: async (userId) => {
        set({ isLoading: true, error: null });
        const res = await authService.resendOTP(userId);
        if (res.error) {
          const msg = res.data?.message || 'Failed to resend OTP';
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
        set({ isLoading: false });
        return { success: true, message: 'OTP resent successfully' };
      },

      /* ---------- login ---------- */
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        const res = await authService.login(credentials);
        if (res.error) {
          const msg = res.data?.message || 'Login failed';
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
        const { token, user } = _normalizeAuthRes(res);
        if (!token || !user) {
          set({ error: 'Invalid server response', isLoading: false });
          return { success: false, error: 'Invalid server response' };
        }
        set({ user, token, error: null, isLoading: false });
        return { success: true, data: { user, token } };
      },

      /* ---------- logout ---------- */
      logout: async () => {
        set({ isLoading: true });
        await _catch(authService.logout)(); // fire-and-forget
        set({ user: null, token: null, error: null, tempRegister: null, isLoading: false });
        if (!['/login','/register'].some(p => window.location.pathname.includes(p))) {
          setTimeout(() => (window.location.href = '/login'), 100);
        }
      },

      /* ---------- password reset ---------- */
      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        const res = await authService.forgotPassword(email);
        if (res.error) {
          const msg = res.data?.message || 'Failed to send reset email';
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
        set({ isLoading: false });
        return { success: true, message: 'Password reset email sent' };
      },

      resetPassword: async (data) => {
        set({ isLoading: true, error: null });
        const res = await authService.resetPassword(data);
        if (res.error) {
          const msg = res.data?.message || 'Password reset failed';
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
        set({ isLoading: false });
        return { success: true, message: 'Password reset successful' };
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
        return { success: true, data: user };
      },

      /* ---------- simple getters ---------- */
      isAuthenticated: () => !!get().token && !!get().user,
      isAdmin: () => {
        const u = get().user;
        return u?.role === 'admin' || u?.is_admin === true;
      },

      /* ---------- hydration-safe init ---------- */
      initializeAuth: () => {
        try {
          const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
          const userRaw = localStorage.getItem('userInfo');
          const user = userRaw ? JSON.parse(userRaw) : null;
          set({ token: token || null, user, isLoading: false });
          if (token && !user) get().fetchUserInfo();
        } catch (e) {
          console.error('Auth init error:', e);
          set({ token: null, user: null, isLoading: false });
        }
      },

      /* ---------- legacy support (unchanged signature) ---------- */
      completeRegistration: (userData, token) => {
        set({ user: userData, token, tempRegister: null, error: null, isLoading: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (s) => ({ token: s.token, user: s.user }),
    }
  )
);

export default useAuthStore;