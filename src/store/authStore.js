// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authApi';
import { COL } from '../utils/LoggerDefinition';

const log = (msg, style = COL.info, ...rest) =>
  console.log(`%c[AuthStore] ${msg}`, style, ...rest);

export const useAuthStore = create(
  persist(
    (set, get) => ({
      /* -------------------- STATE -------------------- */
      user: null,
      authToken: null,
      userId: null,
      tempRegister: null,
      otpSent: false,
      isVerified: false,
      rememberMe: true,
      isLoading: false,
      error: null,

      /* -------------------- STORAGE HELPERS -------------------- */
      _saveToken: (token, persistFlag) => {
        try {
          if (!token) {
            localStorage.removeItem('authToken');
            sessionStorage.removeItem('authToken');
            return;
          }
          if (persistFlag) {
            localStorage.setItem('authToken', token);
            sessionStorage.removeItem('authToken');
          } else {
            sessionStorage.setItem('authToken', token);
            localStorage.removeItem('authToken');
          }
        } catch (e) {
          console.warn('[AuthStore] token storage error', e);
        }
      },

      _saveUser: (user) => {
        try {
          if (user) localStorage.setItem('userInfo', JSON.stringify(user));
          else localStorage.removeItem('userInfo');
        } catch (e) {
          console.warn('[AuthStore] user storage error', e);
        }
      },

      _saveTempRegister: (data) => {
        try {
          if (data) localStorage.setItem('tempRegister', JSON.stringify(data));
          else localStorage.removeItem('tempRegister');
        } catch (e) {
          console.warn('[AuthStore] tempRegister storage error', e);
        }
      },

      /* -------------------- SETTERS -------------------- */
      setLoading: (v) => set({ isLoading: v }),
      setError: (msg) => set({ error: msg }),
      clearError: () => set({ error: null }),
      clearIncompleteRegistration: () => {
        set({ tempRegister: null, otpSent: false, isVerified: false, error: null });
        get()._saveTempRegister(null);
        log('Cleared incomplete registration', COL.warn);
      },

      /* -------------------- AUTH FLOWS -------------------- */

      // ✅ REGISTER
      register: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          get().clearIncompleteRegistration();
          log('Registering user...', COL.info);

          const res = await authService.register(payload);
          if (!res.success) {
            set({ error: res.data?.message || 'Registration failed', isLoading: false });
            return res;
          }

          const userId = res.data?.user?.id || res.data?.user_id;
          if (!userId) {
            set({ error: 'Invalid register response', isLoading: false });
            return { success: false };
          }

          const tempData = {
            userId,
            email: payload.email,
            firstName: payload.first_name,
            lastName: payload.last_name,
          };

          set({ tempRegister: tempData });
          get()._saveTempRegister(tempData);

          log('Requesting OTP...', COL.info);
          const otpRes = await authService.getOTP(userId);

          if (!otpRes.success) {
            set({ error: 'Failed to send OTP', isLoading: false });
            return otpRes;
          }

          set({ otpSent: true, isLoading: false });
          log('OTP sent', COL.ok);
          return { success: true, data: tempData };
        } catch (e) {
          log('Register error', COL.err, e);
          set({ error: 'Registration failed', isLoading: false });
          return { success: false };
        }
      },

      // ✅ VERIFY OTP
      verifyOTP: async ({ email, otp }) => {
        set({ isLoading: true, error: null });
        const finalEmail = email || get().tempRegister?.email;
        if (!finalEmail) {
          const msg = 'No email found. Please register again.';
          set({ error: msg, isLoading: false });
          return { success: false, message: msg };
        }

        try {
          const res = await authService.verifyOTP({ email: finalEmail, otp });
          if (!res.success) {
            const msg = res.data?.message || 'OTP verification failed';
            set({ error: msg, isLoading: false });
            return { success: false, message: msg };
          }

          const { user, token } = res.data;
          if (!user || !token) {
            const msg = 'Invalid OTP response';
            set({ error: msg, isLoading: false });
            return { success: false, message: msg };
          }

          const persist = get().rememberMe;
          set({
            user,
            authToken: token,
            userId: user.id,
            tempRegister: null,
            otpSent: false,
            isVerified: true,
            isLoading: false,
          });

          get()._saveToken(token, persist);
          get()._saveUser(user);
          get()._saveTempRegister(null);

          return { success: true, data: { user, token } };
        } catch (e) {
          set({ error: 'OTP verification failed', isLoading: false });
          return { success: false, message: 'OTP verification failed' };
        }
      },

      // 🔄 RESEND OTP
      resendOTP: async () => {
        const userId = get().tempRegister?.userId;
        if (!userId) {
          set({ error: 'No pending registration found' });
          return { success: false };
        }
        set({ isLoading: true, error: null });
        log('Resending OTP...', COL.info);

        try {
          const res = await authService.getOTP(userId);
          set({ isLoading: false });
          if (!res.success) set({ error: res.data?.message || 'Failed to resend OTP' });
          return res;
        } catch (e) {
          set({ isLoading: false, error: 'Failed to resend OTP' });
          return { success: false };
        }
      },

      // ✅ LOGIN
      login: async (credentials, { remember = false } = {}) => {
        set({ isLoading: true, error: null, rememberMe: remember });
        try {
          const res = await authService.login(credentials);
          if (!res.success) {
            set({ error: res.data?.message || 'Login failed', isLoading: false });
            return res;
          }

          const { user, token } = res.data;
          if (!token) {
            set({ error: 'No token received', isLoading: false });
            return { success: false };
          }

          set({ user, authToken: token, userId: user.id, isLoading: false });
          get()._saveToken(token, remember);
          get()._saveUser(user);
          log('Login successful', COL.ok);

          return { success: true, data: { user, token } };
        } catch (e) {
          set({ error: 'Login failed', isLoading: false });
          log('Login error', COL.err, e);
          return { success: false };
        }
      },

      // ✅ LOGOUT
      logout: () => {
        try {
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          localStorage.removeItem('userInfo');
          localStorage.removeItem('tempRegister');
          set({ user: null, authToken: null, userId: null, tempRegister: null, otpSent: false, isVerified: false });
          log('Logged out successfully', COL.warn);
          return true;
        } catch (err) {
          log('Logout failed', COL.err, err);
          return false;
        }
      },

      /* -------------------- DERIVED HELPERS -------------------- */
      isAuthenticated: () => !!get().authToken && !!get().user,
      getToken: () => get().authToken,
      getUserId: () => get().userId || get().user?.id,

      /* -------------------- INITIALIZE -------------------- */
      initializeAuth: async () => {
        try {
          const temp = localStorage.getItem('tempRegister');
          if (temp) set({ tempRegister: JSON.parse(temp) });

          const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
          if (!token) return;

          set({ authToken: token, isLoading: true });
          const res = await authService.getUserInfo();

          if (res.success) set({ user: res.data, userId: res.data.id, isLoading: false });
          else get().logout();
        } catch {
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (s) => ({
        authToken: s.authToken,
        user: s.user,
        rememberMe: s.rememberMe,
        tempRegister: s.tempRegister,
      }),
    }
  )
);

/* 🔥 Auto-init */
if (typeof window !== 'undefined') useAuthStore.getState().initializeAuth();

export default useAuthStore;
