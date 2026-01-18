import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authApi';

// ✅ Logger definition
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
      authToken: null,
      userId: null,
      otpSent: false,
      isLoading: false,
      error: null,
      tempRegister: null, // { userId, email, firstName, lastName }
      rememberMe: true,
      isVerified: false,

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
        set({ authToken: token, rememberMe: persist });
        get()._saveToken(token, persist);
      },

      setUser: (userObj, persist = true) => {
        set({ user: userObj });
        if (persist) get()._saveUser(userObj);
      },

      setPendingVerification: (data) => {
        set({ tempRegister: data });
        get()._saveTempRegister(data);
      },

      completeRegistration: (userData, token) => {
        set({ 
          user: userData, 
          authToken: token, 
          userId: userData.id,
          tempRegister: null, 
          error: null, 
          rememberMe: true,
          otpSent: false,
          isVerified: true
        });
        get()._saveToken(token, true);
        get()._saveUser(userData);
        get()._saveTempRegister(null);
      },

      setError: (msg) => set({ error: msg }),
      clearError: () => set({ error: null }),
      setLoading: (loading) => set({ isLoading: loading }),

      /* ✅ Clear incomplete registration */
      clearIncompleteRegistration: () => {
        set({ 
          tempRegister: null, 
          error: null, 
          userId: null,
          otpSent: false,
          isVerified: false
        });
        get()._saveTempRegister(null);
        log('🧹 Cleared incomplete registration data', COL.warn);
      },

      /* -------------------- auth flows -------------------- */

      register: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          log('📝 Starting registration...', COL.info);
          
          // ✅ Clear any existing incomplete registration first
          get().clearIncompleteRegistration();
          
          const res = await authService.register(userData);

          if (res.success) {
            const userId = res.data?.user?.id || res.data?.user_id || res.data?.user?.user_id;
            const email = res.data?.user?.email || userData.email;
            const firstName = res.data?.user?.first_name || userData.first_name;
            const lastName = res.data?.user?.last_name || userData.last_name;

            if (!userId) {
              log('❌ Registration response missing userId:', COL.err, res);
              set({ error: 'Invalid registration response: missing user ID', isLoading: false });
              return { success: false, error: 'Invalid response from server' };
            }

            // Store verification data BEFORE OTP request
            get().setPendingVerification({ userId, email, firstName, lastName });

            // Request OTP
            log('📧 Requesting OTP for userId:', COL.info, userId);
            const otpRes = await authService.getOTP(userId);
            
            if (!otpRes.success) {
              log('❌ OTP request failed:', COL.err, otpRes);
              set({ error: otpRes.data?.message || 'Failed to send OTP', isLoading: false });
              return { success: false, error: otpRes.data?.message };
            }

            log('✅ OTP sent successfully', COL.ok);
            set({ isLoading: false, otpSent: true });
            return { success: true, data: { userId, email, firstName, lastName } };
          } else {
            log('❌ Registration failed:', COL.err, res);
            set({ error: res.data?.message || 'Registration failed', isLoading: false });
            return res;
          }
        } catch (err) {
          log('❌ Registration error:', COL.err, err);
          set({ error: 'Registration failed', isLoading: false });
          return { success: false, error: 'Registration failed' };
        }
      },

      getOTP: async (userId) => {
        if (!userId) {
          const err = { status: 400, data: { message: 'User ID is required' }, error: true };
          set({ error: err.data.message });
          return err;
        }
        
        set({ isLoading: true, error: null });
        log('📧 Fetching OTP for userId:', COL.info, userId);
        
        const res = await authService.getOTP(userId);
        
        if (!res.success) {
          log('❌ OTP fetch failed:', COL.err, res);
          set({ error: res.data?.message || 'Failed to send OTP', isLoading: false });
        } else {
          set({ isLoading: false, otpSent: true });
        }
        return res;
      },

verifyOTP: async (identifier, otp) => {
  set({ isLoading: true, error: null });

  // Pull stored email if identifier is not provided
  const storedEmail = get().tempRegister?.email;

  // Final email to use
  const finalEmail = identifier || storedEmail;

  if (!finalEmail) {
    log('❌ No email available for OTP verification', COL.err);
    set({
      error: 'No email found. Please start registration again.',
      isLoading: false,
    });
    return { success: false, error: 'No email' };
  }

  log('🔢 Verifying OTP for:', COL.info, finalEmail);

  try {
    const payload = { email: finalEmail, otp };

    const res = await authService.verifyOTP(payload);
    console.log("message :", res);

    if (res.success) {
      const { user, token } = res.data;

      if (!user || !token) {
        log('❌ Missing user or token in response', COL.err, res);
        set({
          error: 'Invalid response from server',
          isLoading: false,
          tempRegister: null,
        });
        return { success: false, error: 'Invalid response' };
      }

      log('✅ OTP verification successful', COL.ok);
      get().completeRegistration(user, token);

      return { success: true, data: { user, token } };
    }

    // If the server responds with success: false
    log('❌ OTP verification failed:', COL.err, res);
    set({
      error: res.data?.message || 'OTP verification failed',
      isLoading: false,
    });
    return res;

  } catch (err) {
    log('❌ Verify OTP error:', COL.err, err);
    set({ error: 'OTP verification failed', isLoading: false });
    return { success: false, error: 'OTP verification failed' };
  }
},


      resendOTP: async () => {
        set({ error: null });
        const userId = get().tempRegister?.userId;
        
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
        set({ isLoading: true, error: null });
        
        try {
          const loginRes = await authService.login(credentials);
          
          if (!loginRes.success) {
            set({ error: loginRes.data?.message || 'Login failed', isLoading: false });
            return loginRes;
          }

          const token = loginRes.data?.token;
          const user = loginRes.data?.user;

          if (!token) {
            set({ error: 'No token received', isLoading: false });
            return { success: false, error: 'No token received' };
          }

          set({ 
            user, 
            authToken: token, 
            userId: user?.id,
            isLoading: false,
            rememberMe: remember,
          });
          get()._saveToken(token, remember);
          get()._saveUser(user);

          return { success: true, data: { user, token } };
        } catch (err) {
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
        
        set({ 
          user: null, 
          authToken: null, 
          userId: null, 
          error: null, 
          tempRegister: null, 
          isLoading: false,
          otpSent: false,
          isVerified: false
        });
        
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

      isAuthenticated: () => !!get().authToken && !!get().user,
      isAdmin: () => ['admin', true].includes(get().user?.role || get().user?.is_admin),
      getUserId: () => get().userId || get().user?.id,
      getToken: () => get().authToken,

      initializeAuth: async () => {
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

          set({ authToken: token, isLoading: true });
          const res = await authService.getUserInfo();

          if (res.success) {
            set({ user: res.data, isLoading: false });
          } else {
            set({ authToken: null, user: null, isLoading: false });
            get()._saveToken(null, false);
            get()._saveUser(null);
          }
        } catch (err) {
          log('❌ Init error:', COL.err, err);
          set({ authToken: null, user: null, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (s) => ({ 
        authToken: s.authToken, 
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