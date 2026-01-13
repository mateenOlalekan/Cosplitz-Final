// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authApi';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      /* -------------------- state -------------------- */
      user         : null,
      token        : null,
      error        : null,
      isLoading    : false,
      tempRegister : null, // { userId, email, firstName, lastName }
      rememberMe   : true,

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

      // 1. REGISTER + AUTO-SEND OTP
      register: async (userData) => {
        set({ isLoading: true, error: null });
        const res = await authService.register(userData, () => get().token);

        if (res.success) {
          const pendingUser = res.data.user || userData;
          const userId = pendingUser.id || pendingUser.user_id;

          // Auto-request OTP after successful registration
          const otpRes = await authService.getOTP(userId, () => get().token);
          if (!otpRes.success) {
            set({ error: otpRes.data?.message || 'Failed to send OTP', isLoading: false, tempRegister: null });
            return { success: false, error: otpRes.data?.message };
          }

          // Store pending data for verification step
          set({ 
            tempRegister: { 
              userId, 
              email: pendingUser.email, 
              firstName: userData.first_name,
              lastName: userData.last_name,
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

      // 3. VERIFY OTP + AUTO-LOGIN
      verifyOTP: async (identifier, otp) => {
        set({ isLoading: true, error: null });
        const userId = get().tempRegister?.userId || identifier;
        
        const res = await authService.verifyOTP(userId, otp, () => get().token);

        if (res.success) {
          // Auto-login after verification
          const loginRes = await authService.login(
            { email: get().tempRegister.email, password: '' },
            () => get().token
          );

          if (loginRes.success) {
            const { user, token } = loginRes.data;
            get().completeRegistration(user, token);
            return { success: true, data: { user, token } };
          } else {
            // Fallback: clear temp state if auto-login fails
            set({ tempRegister: null, isLoading: false });
            return { success: true, message: 'Verified! Please log in manually.' };
          }
        } else {
          set({ error: res.data?.message || 'OTP verification failed', isLoading: false });
          return res;
        }
      },

      // 4. RESEND OTP (wraps getOTP)
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
        
        // Step 1: Login to get token
        const loginRes = await authService.login(credentials, () => get().token);
        
        if (!loginRes.success) {
          set({ error: loginRes.data?.message || 'Login failed', isLoading: false });
          return loginRes;
        }

        const token = loginRes.data.token;
        
        // Step 2: Fetch full user info if not provided
        let user = loginRes.data.user;
        if (!user) {
          const userRes = await authService.getUserInfo(() => token);
          if (!userRes.success) {
            set({ error: userRes.data?.message || 'Failed to fetch user info', isLoading: false });
            return userRes;
          }
          user = userRes.data.user;
        }

        // Step 3: Save everything
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
      isAdmin         : () => ['admin', true].includes(get().user?.role || get().user?.is_admin),
      getUserId       : () => get().user?.id,
      getToken        : () => get().token,

      /* -------------------- re-hydrate auth -------------------- */
      initializeAuth: async () => {
        try {
          const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
          const userRaw = localStorage.getItem('userInfo');
          if (!token) return set({ isLoading: false });

          set({ token, isLoading: true });
          const res = await authService.getUserInfo(() => token);

          if (res.success) {
            set({ user: res.data.user, isLoading: false });
          } else {
            // Invalid token
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

// Auto-initialize on module load (browser only)
if (typeof window !== 'undefined') {
  useAuthStore.getState().initializeAuth();
}

export default useAuthStore;