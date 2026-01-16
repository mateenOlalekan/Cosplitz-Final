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
      user: null,
      token: null,
      error: null,
      isLoading: false,
      tempRegister: null,
      rememberMe: true,

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

      setToken: (token, persist = true) => {
        set({ token, rememberMe: persist });
        get()._saveToken(token, persist);
      },

      setUser: (userObj, persist = true) => {
        set({ user: userObj });
        if (persist) get()._saveUser(userObj);
      },

      setPendingVerification: (data) => {
        log('📋 Storing temp registration data', COL.info, data);
        set({ tempRegister: data });
        get()._saveTempRegister(data);
      },

      completeRegistration: (userData, token) => {
        set({ user: userData, token, tempRegister: null, error: null, rememberMe: true });
        get()._saveToken(token, true);
        get()._saveUser(userData);
        get()._saveTempRegister(null);
      },

      setError: (msg) => set({ error: msg }),
      clearError: () => set({ error: null }),
      setLoading: (loading) => set({ isLoading: loading }),

      clearIncompleteRegistration: () => {
        log('🧹 Clearing incomplete registration', COL.warn);
        set({ tempRegister: null, error: null });
        get()._saveTempRegister(null);
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          log('📝 Starting registration...', COL.info);
          get().clearIncompleteRegistration();
          
          const res = await authService.register(userData);

          if (res.success) {
            // ✅ FIXED: Handle direct user object response
            const userDataFromApi = res.data?.user || res.data;
            const userId = userDataFromApi?.id || userDataFromApi?.user_id;
            const email = userDataFromApi?.email || userData.email;
            const firstName = userDataFromApi?.first_name || userData.first_name;
            const lastName = userDataFromApi?.last_name || userData.last_name;

            if (!userId) {
              log('❌ Registration response missing userId', COL.err, res);
              set({ error: 'Invalid registration response: missing user ID', isLoading: false });
              return { success: false, error: 'Invalid response from server' };
            }

            get().setPendingVerification({ userId, email, firstName, lastName });
            
            log('📧 Requesting OTP...', COL.info);
            const otpRes = await authService.getOTP();
            
            if (!otpRes.success) {
              log('❌ OTP request failed', COL.err, otpRes);
              set({ error: otpRes.data?.message || 'Failed to send OTP', isLoading: false });
              return { success: false, error: otpRes.data?.message };
            }

            log('✅ OTP sent successfully', COL.ok);
            set({ isLoading: false });
            return { success: true, data: { userId, email, firstName, lastName } };
          } else {
            log('❌ Registration failed', COL.err, res);
            set({ error: res.data?.message || 'Registration failed', isLoading: false });
            return res;
          }
        } catch (err) {
          log('❌ Registration error', COL.err, err);
          set({ error: 'Registration failed', isLoading: false });
          return { success: false, error: 'Registration failed' };
        }
      },

      // ✅ FIXED: No userId parameter needed
      getOTP: async () => {
        set({ isLoading: true, error: null });
        log('📧 Fetching OTP...', COL.info);
        
        const res = await authService.getOTP();
        
        if (!res.success) {
          log('❌ OTP fetch failed', COL.err, res);
          set({ error: res.data?.message || 'Failed to send OTP', isLoading: false });
        } else {
          set({ isLoading: false });
        }
        return res;
      },

      // ✅ FIXED: Use email from tempRegister
      verifyOTP: async (identifier, otp) => {
        set({ isLoading: true, error: null });
        
        const temp = get().tempRegister;
        if (!temp?.email) {
          log('❌ No registration data found', COL.err);
          set({ error: 'No registration data. Please register again.', isLoading: false });
          return { success: false, error: 'No registration data' };
        }

        log('🔢 Verifying OTP...', COL.info, { email: temp.email });
        
        try {
          const res = await authService.verifyOTP(otp);
          
          if (res.success) {
            const { user, token } = res.data;
            
            if (!user || !token) {
              log('❌ Missing user or token', COL.err, res);
              set({ error: 'Invalid server response', isLoading: false, tempRegister: null });
              return { success: false, error: 'Invalid response' };
            }

            log('✅ OTP verification successful', COL.ok);
            get().completeRegistration(user, token);
            return { success: true, data: { user, token } };
          } else {
            if (res.status === 500 && res.responseText?.includes('<!DOCTYPE')) {
              const errorMsg = 'Server error during verification. Try again.';
              log('❌ Server HTML error', COL.err);
              set({ error: errorMsg, isLoading: false });
              return { success: false, error: errorMsg };
            }
            
            log('❌ OTP verification failed', COL.err, res);
            set({ error: res.data?.message || 'OTP verification failed', isLoading: false });
            return res;
          }
        } catch (err) {
          log('❌ Verify OTP error', COL.err, err);
          set({ error: 'OTP verification failed', isLoading: false });
          return { success: false, error: 'OTP verification failed' };
        }
      },

      // ✅ FIXED: No userId parameter needed
      resendOTP: async () => {
        set({ error: null });
        log('🔄 Resending OTP...', COL.info);
        
        const res = await authService.getOTP();
        if (!res.success) {
          set({ error: res.data?.message || 'Failed to resend OTP' });
        }
        return res;
      },

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

          if (!user) {
            const userRes = await authService.getUserInfo();
            if (!userRes.success) {
              set({ error: userRes.data?.message || 'Failed to fetch user info', isLoading: false });
              return userRes;
            }
            user = userRes.data.user;
          }

          set({ user, token, isLoading: false, rememberMe: remember });
          get()._saveToken(token, remember);
          get()._saveUser(user);

          return { success: true, data: { user, token } };
        } catch (err) {
          log('❌ Login error', COL.err, err);
          set({ error: 'Login failed', isLoading: false });
          return { success: false, error: 'Login failed' };
        }
      },

      logout: async (redirect = true) => {
        set({ isLoading: true });
        try { await authService.logout(); } catch (e) {
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
        log('🔄 Initializing auth...', COL.info);
        try {
          const tempData = localStorage.getItem('tempRegister');
          if (tempData) {
            try {
              const tempRegister = JSON.parse(tempData);
              set({ tempRegister });
            } catch (e) {
              console.warn('[AuthStore] Failed to parse tempRegister:', e);
              localStorage.removeItem('tempRegister');
            }
          }

          const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
          if (!token) return set({ isLoading: false });

          set({ token, isLoading: true });
          const res = await authService.getUserInfo();

          if (res.success) {
            set({ user: res.data.user, isLoading: false });
          } else {
            set({ token: null, user: null, isLoading: false });
            get()._saveToken(null, false);
            get()._saveUser(null);
          }
        } catch (err) {
          log('❌ Init error', COL.err, err);
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