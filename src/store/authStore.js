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

      // ✅ NEW: Save temp registration data
      _saveTempRegister(data) {
        try {
          if (data) {
            localStorage.setItem('tempRegister', JSON.stringify(data));
          } else {
            localStorage.removeItem('tempRegister');
          }
        } catch (e) {
          console.warn('[AuthStore] Temp storage error:', e);
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

      setPendingVerification: (data) => {
        set({ tempRegister: data });
        get()._saveTempRegister(data); // ✅ Persist to survive refresh
      },

      completeRegistration: (userData, token) => {
        set({ user: userData, token, tempRegister: null, error: null, rememberMe: true });
        get()._saveToken(token, true);
        get()._saveUser(userData);
        get()._saveTempRegister(null); // Clear temp data
      },

      setError: (msg) => set({ error: msg }),
      clearError: () => set({ error: null }),
      setLoading: (loading) => set({ isLoading: loading }),

      /* -------------------- auth flows -------------------- */

      // 1. REGISTER + AUTO-SEND OTP (NO TOKEN NEEDED)
      register: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          const res = await authService.register(userData);

          if (res.success) {
            // ✅ FIXED: More robust userId extraction
            const userId = res.data?.user?.id || res.data?.user_id || res.data?.user?.user_id;
            const email = res.data?.user?.email || userData.email;

            if (!userId) {
              console.error('❌ Registration response missing userId:', res);
              set({ error: 'Invalid registration response: missing user ID', isLoading: false });
              return { success: false, error: 'Invalid response from server' };
            }

            // ✅ FIXED: Store verification data BEFORE OTP request
            get().setPendingVerification({ userId, email });

            // Auto-request OTP (no token needed during registration)
            const otpRes = await authService.getOTP(userId);
            
            if (!otpRes.success) {
              console.error('❌ OTP request failed:', otpRes);
              set({ error: otpRes.data?.message || 'Failed to send OTP', tempRegister: null });
              get()._saveTempRegister(null); // Clear on failure
              return { success: false, error: otpRes.data?.message };
            }

            log('✅ Registration successful, OTP sent', COL.ok);
            return { success: true, data: { userId } };
          } else {
            console.error('❌ Registration failed:', res);
            set({ error: res.data?.message || 'Registration failed', isLoading: false });
            return res;
          }
        } catch (err) {
          console.error('❌ [AuthStore] Registration error:', err);
          set({ error: 'Registration failed', isLoading: false });
          return { success: false, error: 'Registration failed' };
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
        const res = await authService.getOTP(userId);
        
        if (!res.success) {
          set({ error: res.data?.message || 'Failed to send OTP', isLoading: false });
        } else {
          set({ isLoading: false });
        }
        return res;
      },

      // 3. VERIFY OTP - ✅ FIXED: Better error handling and logging
      verifyOTP: async (identifier, otp) => {
        set({ isLoading: true, error: null });
        
        // ✅ FIXED: Try multiple sources for identifier
        const userId = get().tempRegister?.userId || identifier;
        const email = get().tempRegister?.email;
        const verifyIdentifier = userId || identifier || email;

        // ✅ FIXED: Detailed logging for debugging
        console.log('[AuthStore] Verifying OTP with:', { 
          identifier, 
          tempRegister: get().tempRegister,
          verifyIdentifier 
        });

        if (!verifyIdentifier) {
          console.error('❌ No verification identifier available');
          set({ error: 'No verification identifier. Please register again.', isLoading: false });
          return { success: false, error: 'No identifier' };
        }

        try {
          const res = await authService.verifyOTP(verifyIdentifier, otp);

          if (res.success) {
            const { user, token } = res.data;
            
            if (!user || !token) {
              console.error('❌ Missing user or token in response:', res);
              set({ error: 'Invalid server response: missing user or token', isLoading: false, tempRegister: null });
              return { success: false, error: 'Invalid response' };
            }

            get().completeRegistration(user, token);
            log('✅ OTP verification successful', COL.ok);
            return { success: true, data: { user, token } };
          } else {
            console.error('❌ OTP verification failed:', res);
            set({ error: res.data?.message || 'OTP verification failed', isLoading: false });
            return res;
          }
        } catch (err) {
          console.error('❌ [AuthStore] Verify OTP error:', err);
          set({ error: 'OTP verification failed', isLoading: false });
          return { success: false, error: 'OTP verification failed' };
        }
      },

      // 4. RESEND OTP
      resendOTP: async () => {
        set({ error: null });
        const userId = get().tempRegister?.userId;
        
        if (!userId) {
          const err = { status: 400, data: { message: 'No pending registration. Please register again.' }, error: true };
          set({ error: err.data.message });
          return err;
        }
        
        const res = await authService.getOTP(userId);
        if (!res.success) {
          set({ error: res.data?.message || 'Failed to resend OTP' });
        }
        return res;
      },

      // 5. LOGIN + FETCH USER INFO
      login: async (credentials, { remember = false } = {}) => {
        set({ isLoading: true, error: null });
        
        try {
          const loginRes = await authService.login(credentials);
          
          if (!loginRes.success) {
            set({ error: loginRes.data?.message || 'Login failed', isLoading: false });
            return loginRes;
          }

          const token = loginRes.data.token;
          let user = loginRes.data.user;

          // Fetch full user info if not provided
          if (!user) {
            const userRes = await authService.getUserInfo();
            if (!userRes.success) {
              set({ error: userRes.data?.message || 'Failed to fetch user info', isLoading: false });
              return userRes;
            }
            user = userRes.data.user;
          }

          set({ 
            user, 
            token, 
            isLoading: false,
            rememberMe: remember,
          });
          get()._saveToken(token, remember);
          get()._saveUser(user);

          return { success: true, data: { user, token } };
        } catch (err) {
          console.error('❌ [AuthStore] Login error:', err);
          set({ error: 'Login failed', isLoading: false });
          return { success: false, error: 'Login failed' };
        }
      },

      // 6. LOGOUT
      logout: async (redirect = true) => {
        set({ isLoading: true });
        try { 
          await authService.logout(); 
        } catch (e) {
          console.warn('[AuthStore] Logout API error:', e);
        }
        
        set({ user: null, token: null, error: null, tempRegister: null, isLoading: false });
        try {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userInfo');
          localStorage.removeItem('tempRegister'); // ✅ Clear temp data
          sessionStorage.clear();
        } catch (e) {
          console.warn('[AuthStore] Storage cleanup error:', e);
        }
        
        if (redirect && typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      },

      /* -------------------- getters -------------------- */
      isAuthenticated: () => !!get().token && !!get().user,
      isAdmin: () => ['admin', true].includes(get().user?.role || get().user?.is_admin),
      getUserId: () => get().user?.id,
      getToken: () => get().token,

      /* -------------------- re-hydrate auth -------------------- */
      initializeAuth: async () => {
        try {
          // ✅ NEW: Restore temp registration data
          const tempData = localStorage.getItem('tempRegister');
          if (tempData) {
            try {
              const tempRegister = JSON.parse(tempData);
              set({ tempRegister });
            } catch (e) {
              console.warn('[AuthStore] Failed to parse tempRegister:', e);
            }
          }

          const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
          if (!token) return set({ isLoading: false });

          set({ token, isLoading: true });
          const res = await authService.getUserInfo();

          if (res.success) {
            set({ user: res.data.user, isLoading: false });
          } else {
            // Clear invalid token
            set({ token: null, user: null, isLoading: false });
            get()._saveToken(null, false);
            get()._saveUser(null);
          }
        } catch (err) {
          console.error('[AuthStore] init error:', err);
          set({ token: null, user: null, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      // ✅ NEW: Persist tempRegister to survive page refreshes
      partialize: (s) => ({ 
        token: s.token, 
        user: s.user, 
        rememberMe: s.rememberMe,
        tempRegister: s.tempRegister // ✅ Persist temp registration data
      }),
    },
  ),
);

// Auto-initialize on module load (browser only)
if (typeof window !== 'undefined') {
  useAuthStore.getState().initializeAuth();
}

export default useAuthStore;