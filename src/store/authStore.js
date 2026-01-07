// src/store/authStore.js - DEBUGGED
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      error: null,
      isLoading: true,
      tempRegister: null,

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

      register: (payload) => {
        console.log("Register payload:", payload);
        set({ tempRegister: payload });
      },

      // Complete registration flow after email verification
      completeRegistration: (userData, token) => {
        console.log("Completing registration with:", { userData, token });
        
        set({
          user: userData,
          token: token,
          tempRegister: null,
          error: null
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
        
        set({ user: null, token: null, error: null, tempRegister: null });
        
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