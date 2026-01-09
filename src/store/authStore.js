// src/store/authStore.js - DEBUGGED AND ENHANCED
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "../services/authApi"; // Add this import

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      error: null,
      isLoading: true,
      tempRegister: null,

      // REGISTER ACTION
      register: async (userData) => {
        set({ isLoading: true, error: null });
        const response = await authService.register(userData);
        
        if (response.success) {
          // If registration requires email verification
          if (response.data.requires_verification || response.data.user_id) {
            set({
              tempRegister: {
                email: userData.email,
                userId: response.data.user_id,
                firstName: userData.first_name,
                lastName: userData.last_name
              },
              isLoading: false,
              error: null
            });
            return { success: true, requiresVerification: true };
          } else {
            // Auto-login if no verification needed
            set({
              user: response.data.user,
              token: response.data.token,
              isLoading: false,
              error: null
            });
            localStorage.setItem("authToken", response.data.token);
            localStorage.setItem("userInfo", JSON.stringify(response.data.user));
            return { success: true, requiresVerification: false };
          }
        } else {
          set({ 
            error: response.data.message || "Registration failed", 
            isLoading: false 
          });
          return { success: false, error: response.data.message };
        }
      },

      // LOGIN ACTION
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        const response = await authService.login(credentials);
        
        if (response.success) {
          set({
            user: response.data.user,
            token: response.data.token,
            isLoading: false,
            error: null
          });
          localStorage.setItem("authToken", response.data.token);
          localStorage.setItem("userInfo", JSON.stringify(response.data.user));
          return { success: true };
        } else {
          set({ 
            error: response.data.message || "Login failed", 
            isLoading: false 
          });
          return { success: false, error: response.data.message };
        }
      },

      // VERIFY OTP ACTION
      verifyOTP: async (identifier, otp) => {
        set({ isLoading: true, error: null });
        const response = await authService.verifyOTP(identifier, otp);
        
        if (response.success) {
          set({
            user: response.data.user,
            token: response.data.token,
            tempRegister: null,
            isLoading: false,
            error: null
          });
          localStorage.setItem("authToken", response.data.token);
          localStorage.setItem("userInfo", JSON.stringify(response.data.user));
          return { success: true };
        } else {
          set({ 
            error: response.data.message || "OTP verification failed", 
            isLoading: false 
          });
          return { success: false, error: response.data.message };
        }
      },

      // RESEND OTP ACTION
      resendOTP: async (userId) => {
        set({ error: null });
        const response = await authService.resendOTP(userId);
        
        if (response.success) {
          return { success: true };
        } else {
          set({ error: response.data.message || "Failed to resend OTP" });
          return { success: false, error: response.data.message };
        }
      },

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

      setPendingVerification: (data) => {
        console.log("Setting pending verification:", data);
        set({ tempRegister: data });
      },

      completeRegistration: (userData, token) => {
        console.log("Completing registration with:", { userData, token });
        
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

      logout: () => {
        console.log("Logging out user");
        
        set({ 
          user: null, 
          token: null, 
          error: null, 
          tempRegister: null,
          isLoading: false 
        });
        
        try {
          localStorage.removeItem("authToken");
          localStorage.removeItem("userInfo");
          sessionStorage.removeItem("authToken");
          sessionStorage.removeItem("userInfo");
        } catch (e) {
          console.warn("Storage error:", e);
        }
        
        // Only redirect to login if not already on auth pages
        if (!window.location.pathname.includes("/login") && 
            !window.location.pathname.includes("/register")) {
          window.location.href = "/login";
        }
      },

      setError: (msg) => {
        console.log("Setting error:", msg);
        set({ error: msg });
      },
      
      clearError: () => {
        set({ error: null });
      },

      isAuthenticated: () => {
        const state = get();
        return !!state.token;
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

          console.log("Auth initialized:", { hasToken: !!token, hasUser: !!user });

          set({
            token: token || null,
            user: user,
            isLoading: false,
          });
        } catch (err) {
          console.error("Auth initialization error:", err);
          set({ token: null, user: null, isLoading: false });
        }
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