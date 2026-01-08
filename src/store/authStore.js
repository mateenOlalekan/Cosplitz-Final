// src/store/authStore.js - FULLY DEBUGGED & INTEGRATED
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "../services/authApi";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      error: null,
      isLoading: false,
      tempRegister: null,

      // ==========================================
      // CORE AUTH ACTIONS
      // ==========================================
      setToken: (token, persistToken = true) => {
        set({ token });
        try {
          if (persistToken) {
            localStorage.setItem("authToken", token);
            sessionStorage.removeItem("authToken");
          } else {
            sessionStorage.setItem("authToken", token);
            localStorage.removeItem("authToken");
          }
        } catch (e) {
          console.warn("Storage error:", e);
        }
      },

      setUser: (userObj) => {
        set({ user: userObj });
        try {
          if (userObj) {
            localStorage.setItem("userInfo", JSON.stringify(userObj));
          } else {
            localStorage.removeItem("userInfo");
          }
        } catch (e) {
          console.warn("Storage error:", e);
        }
      },

      setError: (msg) => {
        console.log("Setting error:", msg);
        set({ error: msg });
      },

      clearError: () => {
        set({ error: null });
      },

      // ==========================================
      // REGISTRATION FLOW
      // ==========================================

      register: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          console.log("Starting registration...", userData);
          const response = await authService.register(userData);

          if (response.error) {
            const errorMessage =  response.data?.message || response.data?.error || "Registration failed";
            
            set({ 
              error: errorMessage, 
              isLoading: false 
            });
            
            return { 
              success: false, 
              error: errorMessage,
              status: response.status 
            };
          }

          // Store registration data for OTP verification
          const tempData = {
            email: userData.email,
            userId: response.data?.user?.id || response.data?.id,
            ...response.data
          };

          console.log("Registration successful, storing temp data:", tempData);
          set({ 
            tempRegister: tempData,
            error: null,
            isLoading: false 
          });

          return { 
            success: true, 
            data: response.data,
            requiresVerification: true 
          };

        } catch (err) {
          console.error("Registration error:", err);
          const errorMessage = err.message || "Registration failed";
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      setPendingVerification: (data) => {
        console.log("Setting pending verification:", data);
        set({ tempRegister: data });
      },

      // ==========================================
      // OTP VERIFICATION FLOW
      // ==========================================

      verifyOTP: async (identifier, otp) => {
        set({ isLoading: true, error: null });

        try {
          console.log("Verifying OTP for:", identifier);
          const response = await authService.verifyOTP(identifier, otp);

          if (response.error) {
            const errorMessage =  response.data?.message ||  response.data?.error ||  "Invalid OTP";
            
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
          }

          // Successfully verified - complete registration
          const token = response.data?.token || response.data?.access_token;
          const user = response.data?.user || response.data?.data;

          if (token && user) {
            console.log("OTP verified, completing registration");
            
            // Store auth data
            set({
              user: user,
              token: token,
              tempRegister: null,
              error: null,
              isLoading: false
            });

            // Persist to storage
            try {
              localStorage.setItem("authToken", token);
              localStorage.setItem("userInfo", JSON.stringify(user));
              sessionStorage.removeItem("authToken");
              sessionStorage.removeItem("userInfo");
            } catch (e) {
              console.warn("Storage error:", e);
            }

            return { success: true, data: { user, token } };
          }

          // No token received
          set({ 
            error: "Verification incomplete", 
            isLoading: false 
          });
          return { 
            success: false, 
            error: "Verification incomplete" 
          };

        } catch (err) {
          console.error("OTP verification error:", err);
          const errorMessage = err.message || "OTP verification failed";
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      resendOTP: async (userId) => {
        set({ isLoading: true, error: null });

        try {
          console.log("Resending OTP to user:", userId);
          const response = await authService.resendOTP(userId);

          if (response.error) {
            const errorMessage =  response.data?.message || "Failed to resend OTP";
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
          }

          set({ isLoading: false });
          return { success: true, message: "OTP resent successfully" };

        } catch (err) {
          console.error("Resend OTP error:", err);
          const errorMessage = err.message || "Failed to resend OTP";
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      // ==========================================
      // LOGIN FLOW
      // ==========================================

      login: async (credentials) => {
        set({ isLoading: true, error: null });

        try {
          console.log("Starting login...");
          const response = await authService.login(credentials);

          if (response.error) {
            const errorMessage = 
              response.data?.message || 
              response.data?.error || 
              "Login failed";
            
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
          }

          const token = response.data?.token || response.data?.access_token;
          const user = response.data?.user || response.data?.data;

          if (!token || !user) {
            set({ 
              error: "Invalid response from server", 
              isLoading: false 
            });
            return { 
              success: false, 
              error: "Invalid response from server" 
            };
          }

          console.log("Login successful");
          
          // Store auth data
          set({
            user: user,
            token: token,
            error: null,
            isLoading: false
          });

          // Persist to storage
          try {
            localStorage.setItem("authToken", token);
            localStorage.setItem("userInfo", JSON.stringify(user));
            sessionStorage.removeItem("authToken");
            sessionStorage.removeItem("userInfo");
          } catch (e) {
            console.warn("Storage error:", e);
          }

          return { success: true, data: { user, token } };

        } catch (err) {
          console.error("Login error:", err);
          const errorMessage = err.message || "Login failed";
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      // ==========================================
      // LOGOUT FLOW
      // ==========================================

      logout: async () => {
        console.log("Logging out user");
        set({ isLoading: true });

        try {
          // Call logout API
          await authService.logout();
        } catch (err) {
          console.warn("Logout API error (continuing anyway):", err);
        }

        // Clear state
        set({ 
          user: null, 
          token: null, 
          error: null, 
          tempRegister: null,
          isLoading: false 
        });

        // Clear storage
        try {
          localStorage.removeItem("authToken");
          localStorage.removeItem("userInfo");
          sessionStorage.removeItem("authToken");
          sessionStorage.removeItem("userInfo");
        } catch (e) {
          console.warn("Storage error:", e);
        }

        // Redirect to login if not already there
        if (!window.location.pathname.includes("/login") && 
            !window.location.pathname.includes("/register")) {
          setTimeout(() => {
            window.location.href = "/login";
          }, 100);
        }
      },

      // ==========================================
      // PASSWORD RESET FLOW
      // ==========================================

      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authService.forgotPassword(email);

          if (response.error) {
            const errorMessage = response.data?.message || 
              "Failed to send reset email";
            
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
          }

          set({ isLoading: false });
          return { 
            success: true, 
            message: "Password reset email sent" 
          };

        } catch (err) {
          console.error("Forgot password error:", err);
          const errorMessage = err.message || "Failed to send reset email";
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      resetPassword: async (data) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authService.resetPassword(data);

          if (response.error) {
            const errorMessage = 
              response.data?.message || 
              "Password reset failed";
            
            set({ error: errorMessage, isLoading: false });
            return { success: false, error: errorMessage };
          }

          set({ isLoading: false });
          return { 
            success: true, 
            message: "Password reset successful" 
          };

        } catch (err) {
          console.error("Reset password error:", err);
          const errorMessage = err.message || "Password reset failed";
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      // ==========================================
      // USER INFO & SESSION
      // ==========================================

      fetchUserInfo: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await authService.getUserInfo();

          if (response.error) {
            // Don't set error for 401 (handled by authApi)
            if (response.status !== 401) {
              set({ error: response.data?.message });
            }
            set({ isLoading: false });
            return { success: false };
          }

          const user = response.data?.user || response.data;
          
          set({ 
            user: user,
            isLoading: false 
          });

          // Update storage
          try {
            localStorage.setItem("userInfo", JSON.stringify(user));
          } catch (e) {
            console.warn("Storage error:", e);
          }

          return { success: true, data: user };

        } catch (err) {
          console.error("Fetch user info error:", err);
          set({ isLoading: false });
          return { success: false };
        }
      },

      // ==========================================
      // HELPER METHODS
      // ==========================================

      isAuthenticated: () => {
        const state = get();
        return !!state.token && !!state.user;
      },

      isAdmin: () => {
        const u = get().user;
        return u?.role === "admin" || u?.is_admin === true;
      },

      initializeAuth: () => {
        console.log("Initializing auth...");
        
        try {
          const token =
            localStorage.getItem("authToken") ||
            sessionStorage.getItem("authToken");

          const userRaw =
            localStorage.getItem("userInfo") ||
            sessionStorage.getItem("userInfo");

          const user = userRaw ? JSON.parse(userRaw) : null;

          console.log("Auth initialized:", { 
            hasToken: !!token, 
            hasUser: !!user 
          });

          set({
            token: token || null,
            user: user,
            isLoading: false,
          });

          // If token exists but no user, fetch user info
          if (token && !user) {
            console.log("Token exists but no user data, fetching...");
            get().fetchUserInfo();
          }

        } catch (err) {
          console.error("Auth initialization error:", err);
          set({ 
            token: null, 
            user: null, 
            isLoading: false 
          });
        }
      },

      // ==========================================
      // LEGACY SUPPORT (OPTIONAL)
      // ==========================================

      completeRegistration: (userData, token) => {
        console.log("Completing registration (legacy method):", { userData, token });
        
        set({
          user: userData,
          token: token,
          tempRegister: null,
          error: null,
          isLoading: false
        });
        
        try {
          localStorage.setItem("authToken", token);
          localStorage.setItem("userInfo", JSON.stringify(userData));
          sessionStorage.removeItem("authToken");
          sessionStorage.removeItem("userInfo");
        } catch (e) {
          console.warn("Storage error:", e);
        }
        
        console.log("Registration completed successfully");
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);

export default useAuthStore;