// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { z } from 'zod';
import { authService } from '../services/authApi';

// Zod schemas remain unchanged
export const registrationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  nationality: z.string().optional(),
  password: z.string().min(8, 'Password must be ≥ 8 characters')
            .regex(/[A-Z]/, 'Password must contain an uppercase letter')
            .regex(/\d/, 'Password must contain a number'),
  agreeToTerms: z.boolean().refine(Boolean, {
    message: 'You must agree to the terms and conditions',
  }),
});

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      error: null,
      isLoading: false,
      tempRegister: null,

      // Internal helpers
      _saveToken: (token, persist = true) => {
        try {
          if (persist) {
            localStorage.setItem('authToken', token);
            sessionStorage.removeItem('authToken');
          } else {
            sessionStorage.setItem('authToken', token);
            localStorage.removeItem('authToken');
          }
        } catch (e) {
          console.warn('[AuthStore] storage error', e);
        }
      },
      _saveUser: (userObj) => {
        try {
          if (userObj) localStorage.setItem('userInfo', JSON.stringify(userObj));
          else localStorage.removeItem('userInfo');
        } catch (e) {
          console.warn('[AuthStore] storage error', e);
        }
      },

      // Actions
      setToken: (token, persist = true) => {
        set({ token });
        get()._saveToken(token, persist);
      },
      setUser: (userObj) => {
        set({ user: userObj });
        get()._saveUser(userObj);
      },
      setPendingVerification: (data) => set({ tempRegister: data }),
      completeRegistration: (userData, token) => {
        set({ user: userData, token, tempRegister: null, error: null });
        get()._saveToken(token, true);
        get()._saveUser(userData);
      },
      setError: (msg) => set({ error: msg }),
      clearError: () => set({ error: null }),
      setLoading: (loading) => set({ isLoading: loading }),

      // ✅ **NEW** – Register action that matches your UI flow
      register: async (userData) => {
        set({ isLoading: true, error: null });
        const res = await authService.register(userData);
        if (res.success) {
          set({ isLoading: false });
        } else {
          set({ error: res.data?.message || 'Registration failed', isLoading: false });
        }
        return res;
      },

      // ✅ **FIXED** – Login action (ensure token persists)
      login: async (credentials, { remember = false } = {}) => {
        set({ isLoading: true, error: null });
        const res = await authService.login(credentials);
        if (res.success) {
          set({
            user: res.data.user,
            token: res.data.token,
            isLoading: false,
          });
          get()._saveToken(res.data.token, remember);
          get()._saveUser(res.data.user);
        } else {
          set({ error: res.data?.message || 'Login failed', isLoading: false });
        }
        return res;
      },

      // ✅ **ENHANCED** – Logout clears ALL storage
      logout: () => {
        set({ user: null, token: null, error: null, tempRegister: null, isLoading: false });
        try {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userInfo');
          sessionStorage.clear();
        } catch (e) {
          console.warn('[AuthStore] storage error', e);
        }
        window.location.href = '/login';
      },

      // ✅ **CORRECT** – Getters
      isAuthenticated: () => !!get().token,
      isAdmin: () => {
        const u = get().user;
        return u?.role === 'admin' || u?.is_admin === true;
      },

      // ✅ **ROBUST** – Hydrate on app start
      initializeAuth: () => {
        try {
          const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
          const userRaw = localStorage.getItem('userInfo');
          set({
            token: token || null,
            user: userRaw ? JSON.parse(userRaw) : null,
            isLoading: false,
          });
        } catch (err) {
          console.error('[AuthStore] init error', err);
          set({ token: null, user: null, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);

export default useAuthStore;