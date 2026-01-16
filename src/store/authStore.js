import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authApi';

const COL = {
  ok: 'color: #2ecc71; font-weight: bold',
  err: 'color: #e74c3c; font-weight: bold',
  info: 'color: #3498db; font-weight: bold',
  warn: 'color: #f39c12; font-weight: bold',
};
const log = (msg, style = COL.info, ...rest) =>
  console.log(`%c[AuthStore] ${msg}`, style, ...rest);

export const useAuthStore = create(
  persist(
    (set, get) => ({
      /* -------------------- state -------------------- */
      user: null,
      token: null,
      error: null,
      isLoading: false,
      tempRegister: null, 
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
        console.log('[DEBUG] Setting tempRegister:', data);
        set({ tempRegister: data });
        get()._saveTempRegister(data);
      },

      completeRegistration: (userData, token) => {
        console.log('[DEBUG] Completing registration:', { userData, token });
        set({ user: userData, token, tempRegister: null, error: null, rememberMe: true });
        get()._saveToken(token, true);
        get()._saveUser(userData);
        get()._saveTempRegister(null);
      },

      setError: (msg) => set({ error: msg }),
      clearError: () => set({ error: null }),
      setLoading: (loading) => set({ isLoading: loading }),

      clearIncompleteRegistration: () => {
        set({ tempRegister: null, error: null });
        get()._saveTempRegister(null);
        log(' Cleared incomplete registration data', COL.warn);
      },

      /* -------------------- auth flows -------------------- */
      register: async (userData) => {
        console.log('[DEBUG] Register function called with:', userData);
        set({ isLoading: true, error: null });
        
        try {
          log('📝 Starting registration...', COL.info);
          get().clearIncompleteRegistration();
          
          const res = await authService.register(userData);
          console.log('[DEBUG] Register API response:', res);

          if (res.success) {
            const userId = res.data?.id;
            const email = res.data?.email || userData.email;
            const firstName = res.data?.first_name || userData.first_name;
            const lastName = res.data?.last_name || userData.last_name;

            console.log('[DEBUG] Extracted registration data:', { userId,email,firstName,lastName, fullResponseData: res.data });

            if (!userId) {
              log('❌ Registration response missing userId. Full response:', COL.err, res);
              set({ error: 'Invalid registration response: missing user ID', isLoading: false });
              return { success: false, error: 'Invalid response from server' };
            }

            const tempData = { userId, email, firstName, lastName };
            get().setPendingVerification(tempData);

            // Request OTP
            log('📧 Requesting OTP for userId:', COL.info, userId);
            const otpRes = await authService.getOTP(userId);
            console.log('[DEBUG] OTP request response:', otpRes);
            
            if (!otpRes.success) {
              log('❌ OTP request failed:', COL.err, otpRes);
              set({ error: otpRes.data?.message || 'Failed to send OTP', isLoading: false });
              return { success: false, error: otpRes.data?.message };
            }

            log('✅ OTP sent successfully', COL.ok);
            set({ isLoading: false });
            return { success: true, data: { userId, email, firstName, lastName } };
          } else {
            log('❌ Registration failed:', COL.err, res);
            set({ error: res.data?.message || 'Registration failed', isLoading: false });
            return res;
          }
        } catch (err) {
          console.error('[DEBUG] Registration error:', err);
          log('❌ Registration error:', COL.err, err);
          set({ error: 'Registration failed', isLoading: false });
          return { success: false, error: 'Registration failed' };
        }
      },

      getOTP: async (userId) => {
        console.log('[DEBUG] Store getOTP called with userId:', userId);
        if (!userId) {
          const err = { status: 400, data: { message: 'User ID is required' }, error: true };
          set({ error: err.data.message });
          return err;
        }
        
        set({ isLoading: true, error: null });
        log('📧 Fetching OTP for userId:', COL.info, userId);
        
        const res = await authService.getOTP(userId);
        console.log('[DEBUG] Store getOTP response:', res);
        
        if (!res.success) {
          log('❌ OTP fetch failed:', COL.err, res);
          set({ error: res.data?.message || 'Failed to send OTP', isLoading: false });
        } else {
          set({ isLoading: false });
        }
        return res;
      },

      verifyOTP: async (identifier, otp) => {
        console.log('[DEBUG] verifyOTP called with:', { identifier, otp });
        console.log('[DEBUG] Current tempRegister:', get().tempRegister);
        
        set({ isLoading: true, error: null });
        
        // Get email from tempRegister
        const email = get().tempRegister?.email;
        
        if (!email) {
          log('❌ No email available for verification', COL.err);
          set({ error: 'No email found. Please register again.', isLoading: false });
          return { success: false, error: 'No email' };
        }

        console.log('[DEBUG] Using email for verification:', email);
        log('🔢 Verifying OTP for email:', COL.info, email);
        
        try {
          const res = await authService.verifyOTP(email, otp);
          console.log('[DEBUG] verifyOTP API response:', res);

          if (res.success) {
            const { user, token } = res.data;
            
            if (!user || !token) {
              log('❌ Missing user or token in response:', COL.err, res);
              set({ error: 'Invalid server response: missing user or token', isLoading: false, tempRegister: null });
              return { success: false, error: 'Invalid response' };
            }

            log('✅ OTP verification successful', COL.ok);
            get().completeRegistration(user, token);
            return { success: true, data: { user, token } };
          } else {
            log('❌ OTP verification failed:', COL.err, res);
            set({ error: res.data?.message || 'OTP verification failed', isLoading: false });
            return res;
          }
        } catch (err) {
          console.error('[DEBUG] Verify OTP error:', err);
          log('❌ Verify OTP error:', COL.err, err);
          set({ error: 'OTP verification failed', isLoading: false });
          return { success: false, error: 'OTP verification failed' };
        }
      },

      resendOTP: async () => {
        console.log('[DEBUG] resendOTP called');
        set({ error: null });
        const userId = get().tempRegister?.userId;
        console.log('[DEBUG] tempRegister userId:', userId);
        
        if (!userId) {
          const err = { status: 400, data: { message: 'No pending registration. Please register again.' }, error: true };
          set({ error: err.data.message });
          return err;
        }
        
        log('🔄 Resending OTP for userId:', COL.info, userId);
        const res = await authService.getOTP(userId);
        if (!res.success) {
          set({ error: res.data?.message || 'Failed to resend OTP' });
        }
        return res;
      },

      login: async (credentials, { remember = false } = {}) => {
        console.log('[DEBUG] Login called with:', credentials);
        set({ isLoading: true, error: null });
        
        try {
          const loginRes = await authService.login(credentials);
          console.log('[DEBUG] Login API response:', loginRes);
          
          if (!loginRes.success) {
            set({ error: loginRes.data?.message || 'Login failed', isLoading: false });
            return loginRes;
          }

          const token = loginRes.data.token;
          let user = loginRes.data.user;

          if (!user) {
            const userRes = await authService.getUserInfo();
            if (!userRes.success) {
              set({ error: userRes.data?.message || 'Failed to fetch user info', isLoading: false });
              return userRes;
            }
            user = userRes.data.user;
          }

          set({ user, token, isLoading: false,rememberMe: remember,});
          get()._saveToken(token, remember);
          get()._saveUser(user);

          return { success: true, data: { user, token } };
        } catch (err) {
          console.error('[DEBUG] Login error:', err);
          log('❌ Login error:', COL.err, err);
          set({ error: 'Login failed', isLoading: false });
          return { success: false, error: 'Login failed' };
        }
      },

      logout: async (redirect = true) => {
        set({ isLoading: true });
        try { 
          await authService.logout(); 
        } catch (e) {
          log('Logout API error', COL.warn, e);
        }
        
        set({ user: null, token: null, error: null, tempRegister: null, isLoading: false });
        try {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userInfo');
          localStorage.removeItem('tempRegister');
          sessionStorage.clear();
        } catch (e) {
          console.warn('[AuthStore] Storage cleanup error', e);
        }
        
        if (redirect && typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      },

      isAuthenticated: () => !!get().token && !!get().user,
      isAdmin: () => ['admin', true].includes(get().user?.role || get().user?.is_admin),
      getUserId: () => get().user?.id,
      getToken: () => get().token,

      initializeAuth: async () => {
        console.log('[DEBUG] initializeAuth called');
        try {
          const tempData = localStorage.getItem('tempRegister');
          if (tempData) {
            try {
              const tempRegister = JSON.parse(tempData);
              console.log('[DEBUG] Loaded tempRegister from storage:', tempRegister);
              set({ tempRegister });
            } catch (e) {
              console.warn('[AuthStore] Failed to parse tempRegister:', e);
              localStorage.removeItem('tempRegister');
            }
          }

          const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
          console.log('[DEBUG] Token from storage:', token);
          
          if (!token) {
            console.log('[DEBUG] No token found');
            return set({ isLoading: false });
          }

          set({ token, isLoading: true });
          const res = await authService.getUserInfo();

          if (res.success) {
            console.log('[DEBUG] User info loaded:', res.data.user);
            set({ user: res.data.user, isLoading: false });
          } else {
            console.log('[DEBUG] Failed to load user info');
            set({ token: null, user: null, isLoading: false });
            get()._saveToken(null, false);
            get()._saveUser(null);
          }
        } catch (err) {
          console.error('[DEBUG] Init error:', err);
          log('❌ Init error:', COL.err, err);
          set({ token: null, user: null, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (s) => ({ 
        token: s.token, 
        user: s.user, 
        rememberMe: s.rememberMe,
        tempRegister: s.tempRegister 
      }),
    },
  ),
);

if (typeof window !== 'undefined') {
  useAuthStore.getState().initializeAuth();
}

export default useAuthStore;