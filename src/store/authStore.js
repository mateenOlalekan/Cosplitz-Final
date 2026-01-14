// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authApi';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      /* -------------------- state -------------------- */
      user: null,
      token: null,
      error: null,
      isLoading: false,
      tempRegister: null, // { userId, email }
      rememberMe: true,

      /* -------------------- helpers -------------------- */
      _saveToken(token, persist) {
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

      _saveUser(userObj) {
        try {
          if (userObj) localStorage.setItem('userInfo', JSON.stringify(userObj));
          else localStorage.removeItem('userInfo');
        } catch (e) {
          console.warn('[AuthStore] storage error', e);
        }
      },

      /* -------------------- low-level setters -------------------- */
      setToken: (token, persist = true) => {
        set({ token, rememberMe: persist });
        get()._saveToken(token, persist);
      },

      setUser: (userObj, persist = true) => {
        set({ user: userObj });
        if (persist) get()._saveUser(userObj);
      },

      setPendingVerification: (data) => set({ tempRegister: data }),

      completeRegistration: (userData, token) => {
        set({ user: userData, token, tempRegister: null, error: null, rememberMe: true });
        get()._saveToken(token, true);
        get()._saveUser(userData);
      },

      setError: (msg) => set({ error: msg }),
      clearError: () => set({ error: null }),
      setLoading: (loading) => set({ isLoading: loading }),

      /* -------------------- auth flows -------------------- */

      // 1. REGISTER + AUTO-SEND OTP (NO TOKEN NEEDED)
      register: async (userData) => {
        set({ isLoading: true, error: null });
        const res = await authService.register(userData, () => get().token);

        if (res.success) {
          const pendingUser = res.data.user || userData;
          const userId = pendingUser.id || pendingUser.user_id;

          // FIXED: Auto-request OTP without token
          const otpRes = await authService.getOTP(userId, () => null);
          if (!otpRes.success) {
            set({ error: otpRes.data?.message || 'Failed to send OTP', isLoading: false, tempRegister: null });
            return { success: false, error: otpRes.data?.message };
          }

          // Store minimal pending data
          set({ 
            tempRegister: { 
              userId, 
              email: userData.email 
            }, 
            isLoading: false 
          });

          return { success: true, data: { userId } };
        } else {
          set({ error: res.data?.message || 'Registration failed', isLoading: false });
          return res;
        }
      },

      // 2. GET OTP (manual)
      getOTP: async (userId) => {
        if (!userId) {
          const err = { status: 400, data: { message: 'User ID is required' }, error: true };
          set({ error: err.data.message });
          return err;
        }
        set({ isLoading: true, error: null });
        const res = await authService.getOTP(userId, () => get().token);
        if (!res.success) {
          set({ error: res.data?.message || 'Failed to send OTP', isLoading: false });
        } else {
          set({ isLoading: false });
        }
        return res;
      },

      // 3. VERIFY OTP - FIXED: Handle direct response
      verifyOTP: async (identifier, otp) => {
        set({ isLoading: true, error: null });
        const userId = get().tempRegister?.userId || identifier;
        
        const res = await authService.verifyOTP(userId, otp, () => get().token);

        if (res.success) {
          // Backend returns { user, token } after verification
          const { user, token } = res.data;
          
          if (!user || !token) {
            set({ error: 'Invalid server response', isLoading: false, tempRegister: null });
            return { success: false, error: 'Invalid response' };
          }

          get().completeRegistration(user, token);
          return { success: true, data: { user, token } };
        } else {
          set({ error: res.data?.message || 'OTP verification failed', isLoading: false });
          return res;
        }
      },

      // 4. RESEND OTP
      resendOTP: async () => {
        set({ error: null });
        const userId = get().tempRegister?.userId;
        if (!userId) {
          const err = { status: 400, data: { message: 'No pending registration' }, error: true };
          set({ error: err.data.message });
          return err;
        }
        
        const res = await authService.getOTP(userId, () => get().token);
        if (!res.success) {
          set({ error: res.data?.message || 'Failed to resend OTP' });
        }
        return res;
      },

      // 5. LOGIN + FETCH USER INFO
      login: async (credentials, { remember = false } = {}) => {
        set({ isLoading: true, error: null });
        
        const loginRes = await authService.login(credentials, () => get().token);
        
        if (!loginRes.success) {
          set({ error: loginRes.data?.message || 'Login failed', isLoading: false });
          return loginRes;
        }

        const token = loginRes.data.token;
        
        // Fetch full user info if not provided
        let user = loginRes.data.user;
        if (!user) {
          const userRes = await authService.getUserInfo(() => token);
          if (!userRes.success) {
            set({ error: userRes.data?.message || 'Failed to fetch user info', isLoading: false });
            return userRes;
          }
          user = userRes.data.user;
        }

        // Save everything
        set({ 
          user, 
          token, 
          isLoading: false,
          rememberMe: remember,
        });
        get()._saveToken(token, remember);
        get()._saveUser(user);

        return { success: true, data: { user, token } };
      },

      // 6. LOGOUT
      logout: async (redirect = true) => {
        set({ isLoading: true });
        try { await authService.logout(() => get().token); } catch (e) {}
        set({ user: null, token: null, error: null, tempRegister: null, isLoading: false });
        try {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userInfo');
          sessionStorage.clear();
        } catch (e) {}
        if (redirect && typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      },

      // 7. FORGOT PASSWORD
      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        const res = await authService.forgotPassword(email, () => get().token);
        if (!res.success) {
          set({ error: res.data?.message || 'Failed to send reset email', isLoading: false });
        } else {
          set({ isLoading: false });
        }
        return res;
      },

      // 8. RESET PASSWORD
      resetPassword: async (data) => {
        set({ isLoading: true, error: null });
        const res = await authService.resetPassword(data, () => get().token);
        if (!res.success) {
          set({ error: res.data?.message || 'Password reset failed', isLoading: false });
        } else {
          set({ isLoading: false });
        }
        return res;
      },

      /* -------------------- getters -------------------- */
      isAuthenticated: () => !!get().token && !!get().user,
      isAdmin: () => ['admin', true].includes(get().user?.role || get().user?.is_admin),
      getUserId: () => get().user?.id,
      getToken: () => get().token,

      /* -------------------- re-hydrate auth -------------------- */
      initializeAuth: async () => {
        try {
          const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
          if (!token) return set({ isLoading: false });

          set({ token, isLoading: true });
          const res = await authService.getUserInfo(() => token);

          if (res.success) {
            set({ user: res.data.user, isLoading: false });
          } else {
            set({ token: null, user: null, isLoading: false });
            localStorage.removeItem('authToken');
            localStorage.removeItem('userInfo');
            sessionStorage.clear();
          }
        } catch (err) {
          console.error('[AuthStore] init error', err);
          set({ token: null, user: null, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (s) => ({ token: s.token, user: s.user, rememberMe: s.rememberMe }),
    },
  ),
);

// Auto-initialize on module load
if (typeof window !== 'undefined') {
  useAuthStore.getState().initializeAuth();
}

export default useAuthStore;