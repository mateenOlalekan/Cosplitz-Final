// src/store/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {   authService,   setAuthToken,   clearAuthData } from "../services/authApi";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      error: null,
      isLoading: false,
      isInitialized: false,
      tempRegister: null,
      rememberMe: false,

      // Actions   * Initialize authentication state       */
      initialize: () => {
        console.log("Initializing auth store...");
        try {
          const token = localStorage.getItem("authToken") || 
                       sessionStorage.getItem("authToken");
          
          const userRaw = localStorage.getItem("userInfo");
          const user = userRaw ? JSON.parse(userRaw) : null;
          
          const rememberMe = localStorage.getItem("rememberMe") === "true";

          console.log("Auth initialized:", { hasToken: !!token, hasUser: !!user });

          set({
            token,
            user,
            rememberMe,
            isLoading: false,
            isInitialized: true,
          });
        } catch (error) {
          console.error("Auth initialization error:", error);
          set({ 
            token: null, 
            user: null, 
            isLoading: false,
            isInitialized: true,
          });
        }
      },

      /**       * Register new user       */
      register: async (userData) => {
        set({ isLoading: true, error: null });
        
        const response = await authService.register(userData);
        
        if (response.success) {
          // Check if verification is required
          if (response.data.requires_verification || response.data.user_id) {
            set({
              tempRegister: {
                email: userData.email,
                userId: response.data.user_id,
                firstName: userData.first_name,
                lastName: userData.last_name,
              },
              isLoading: false,
              error: null,
            });
            
            return { 
              success: true, 
              requiresVerification: true,
              userId: response.data.user_id,
            };
          } else {
            // Auto-login if no verification needed
            await get().login({
              email: userData.email,
              password: userData.password,
            });
            
            return { 
              success: true, 
              requiresVerification: false,
            };
          }
        } else {
          set({ 
            error: response.data.message || "Registration failed", 
            isLoading: false,
          });
          
          return { 
            success: false, 
            error: response.data.message,
            errorType: response.errorType,
          };
        }
      },

      /* User login  */
      login: async (credentials, rememberMe = false) => {
        set({ isLoading: true, error: null });
        const response = await authService.login(credentials);
        if (response.success) {
          const { token, user } = response.data;
          setAuthToken(token, rememberMe);
          set({
            user,
            token,
            rememberMe,
            isLoading: false,
            error: null,
            tempRegister: null,
          });
          // Store user info
          try {
            localStorage.setItem("userInfo", JSON.stringify(user));
            localStorage.setItem("rememberMe", rememberMe.toString());
          } catch (error) {
            console.warn("Failed to store user info:", error);
          }
          return { success: true, user };
        } else {
          set({ 
            error: response.data.message || "Login failed", 
            isLoading: false,
          });
          return { 
            success: false, 
            error: response.data.message,
            errorType: response.errorType,
          };
        }
      },
      /* Verify OTP*/
      verifyOTP: async (identifier, otp) => {
        set({ isLoading: true, error: null });
        const response = await authService.verifyOTP(identifier, otp);
        if (response.success) {
          const { token, user } = response.data;
          // Store token
          setAuthToken(token, get().rememberMe);
          // Update state
          set({
            user,
            token,
            isLoading: false,
            error: null,
            tempRegister: null,
          });
          // Store user info
          try {
            localStorage.setItem("userInfo", JSON.stringify(user));
          } catch (error) {
            console.warn("Failed to store user info:", error);
          }
          return { success: true, user };
        } else {
          set({ 
            error: response.data.message || "OTP verification failed", 
            isLoading: false,
          });
          return { 
            success: false, 
            error: response.data.message,
            errorType: response.errorType,
          };
        }
      },
      /* Resend OTP*/
      resendOTP: async (userId) => {
        set({ error: null });
        const response = await authService.resendOTP(userId);
        if (response.success) {
          return { success: true };
        } else {
          set({ error: response.data.message || "Failed to resend OTP" });
          return { 
            success: false, 
            error: response.data.message,
          };
        }
      },
      /**       * User logout       */
      logout: async () => {
        console.log("Logging out user...");    
        try {
          // Call logout API
          await authService.logout();
        } catch (error) {
          console.warn("Logout API call failed:", error);
        }
        // Clear local state regardless
        clearAuthData();
        set({
          user: null,
          token: null,
          error: null,
          isLoading: false,
          tempRegister: null,
          rememberMe: false,
        });
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath.includes("/login") || 
                          currentPath.includes("/register") || 
                          currentPath.includes("/verify");
        
        if (!isAuthPage) {
          window.location.href = "/login";
        }
      },
      /* Update user info */
      updateUser: async (userData) => {
        try {
          const response = await authService.updateUser(userData);
          if (response.success) {
            set({ user: response.data.user });
            // Update stored user info
            try {
              localStorage.setItem("userInfo", JSON.stringify(response.data.user));
            } catch (error) {
              console.warn("Failed to update stored user info:", error);
            }
            return { success: true, user: response.data.user };
          } else {
            return { 
              success: false, 
              error: response.data.message,
            };
          }
        } catch (error) {
          console.error("Update user error:", error);
          return { 
            success: false, 
            error: "Failed to update user information",
          };
        }
      },      /* Set temporary registration data */
      setTempRegister: (data) => {
        console.log("Setting temporary registration data:", data);
        set({ tempRegister: data });
      },
      /* Set authentication error */
      setError: (message) => {
        console.log("Setting auth error:", message);
        set({ error: message });
      },
      /* Clear authentication error  */
      clearError: () => {
        set({ error: null });
      },
      /* Check if user is authenticated */
      isAuthenticated: () => {
        const state = get();
        return !!state.token && !!state.user;
      },
      /* Check if user is admin */
      isAdmin: () => {
        const user = get().user;
        return user?.role === "admin" || user?.is_admin === true;
      },
      /* Refresh user info from API  */
      refreshUserInfo: async () => {
        try {
          const response = await authService.getUserInfo();
          
          if (response.success) {
            set({ user: response.data });
            // Update stored user info
            try {
              localStorage.setItem("userInfo", JSON.stringify(response.data));
            } catch (error) {
              console.warn("Failed to update stored user info:", error);
            }
            return { success: true, user: response.data };
          }
          return { success: false };
        } catch (error) {
          console.error("Refresh user info error:", error);
          return { success: false };
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        rememberMe: state.rememberMe,
        isInitialized: state.isInitialized,
      }),
      version: 1,
      migrate: (persistedState, version) => {
        if (version === 0) {
          // Migration logic from version 0 to 1
          return {
            ...persistedState,
            isInitialized: false,
          };
        }
        return persistedState;
      },
    }
  )
);
// Initialize auth store on import
if (typeof window !== "undefined") {
  const store = useAuthStore.getState();
  if (!store.isInitialized) {
    store.initialize();
  }
}

export default useAuthStore;