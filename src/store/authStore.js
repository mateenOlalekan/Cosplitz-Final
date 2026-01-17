import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "../services/authApi";

const COL = {
    ok: "color: #2ecc71; font-weight: bold",
    err: "color: #e74c3c; font-weight: bold",
    info: "color: #3498db; font-weight: bold",
    warn: "color: #f39c12; font-weight: bold",
};
// const log = (msg, style = COL.info, ...rest) =>
//     console.log(`%c[AuthStore] ${msg}`, style, ...rest);

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
                        localStorage.setItem("authToken", token);
                        sessionStorage.removeItem("authToken");
                    } else {
                        sessionStorage.setItem("authToken", token);
                        localStorage.removeItem("authToken");
                    }
                } catch (e) {
                    console.warn("[AuthStore] storage error", e);
                }
            },

            _saveUser(userObj) {
                try {
                    if (userObj)
                        localStorage.setItem(
                            "userInfo",
                            JSON.stringify(userObj),
                        );
                    else localStorage.removeItem("userInfo");
                } catch (e) {
                    console.warn("[AuthStore] storage error", e);
                }
            },

            _saveTempRegister(data) {
                try {
                    if (data) {
                        localStorage.setItem(
                            "tempRegister",
                            JSON.stringify(data),
                        );
                    } else {
                        localStorage.removeItem("tempRegister");
                    }
                } catch (e) {
                    console.warn("[AuthStore] Temp storage error:", e);
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
                console.log("[DEBUG] Setting tempRegister:", data);
                set({ tempRegister: data });
                get()._saveTempRegister(data);
            },

            completeRegistration: (userData, token) => {
                console.log("[DEBUG] Completing registration:", {
                    userData,
                    token,
                });
                set({
                    user: userData,
                    token,
                    tempRegister: null,
                    error: null,
                    rememberMe: true,
                });
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
                console.log(" Cleared incomplete registration data", COL.warn);
            },

            /* -------------------- auth flows -------------------- */
            register: async (userData) => {
                set({ isLoading: true, error: null });

                try {
                    console.log("📝 Starting registration...", COL.info);
                    get().clearIncompleteRegistration();

                    const res = await authService.register(userData);
                    console.log("[DEBUG] Register API response:", res);

                    if (res.success) {
                        const userId =
                            res.data?.user?.id ||
                            res.data?.user_id ||
                            res.data?.user?.user_id;
                        const email = res.data?.email || userData.email;
                        const firstName =
                            res.data?.first_name || userData.first_name;
                        const lastName =
                            res.data?.last_name || userData.last_name;

                        console.log("[DEBUG] Extracted registration data:", {
                            userId,
                            email,
                            firstName,
                            lastName,
                        });

                        if (!userId || !email) {
                            console.log(
                                "❌ Registration response missing required data",
                                COL.err,
                                res,
                            );
                            set({
                                error: "Invalid registration response",
                                isLoading: false,
                            });
                            return {
                                success: false,
                                error: "Invalid response from server",
                            };
                        }

                        const tempData = { userId, email, firstName, lastName };
                        get().setPendingVerification(tempData);

                        // Request OTP using email
                        console.log(
                            "📧 Requesting OTP for email:",
                            COL.info,
                            email,
                        );
                        const otpRes = await authService.getOTP(email);
                        console.log("[DEBUG] OTP request response:", otpRes);

                        if (!otpRes.success) {
                            console.log(
                                "❌ OTP request failed:",
                                COL.err,
                                otpRes,
                            );
                            set({
                                error:
                                    otpRes.data?.message ||
                                    "Failed to send OTP",
                                isLoading: false,
                            });
                            return {
                                success: false,
                                error: otpRes.data?.message,
                            };
                        }

                        console.log("✅ OTP sent successfully", COL.ok);
                        set({ isLoading: false });
                        return {
                            success: true,
                            data: { userId, email, firstName, lastName },
                        };
                    } else {
                        console.log("❌ Registration failed:", COL.err, res);
                        set({
                            error: res.data?.message || "Registration failed",
                            isLoading: false,
                        });
                        return res;
                    }
                } catch (err) {
                    console.error("[DEBUG] Registration error:", err);
                    console.log("❌ Registration error:", COL.err, err);
                    set({ error: "Registration failed", isLoading: false });
                    return { success: false, error: "Registration failed" };
                }
            },

            // UPDATED: Get OTP using email
            getOTP: async (email) => {
                console.log("[DEBUG] Store getOTP called with email:", email);
                if (!email) {
                    const err = {
                        status: 400,
                        data: { message: "Email is required" },
                        error: true,
                    };
                    set({ error: err.data.message });
                    return err;
                }

                set({ isLoading: true, error: null });
                console.log("📧 Fetching OTP for email:", COL.info, email);

                const res = await authService.getOTP(email);
                console.log("[DEBUG] Store getOTP response:", res);

                if (!res.success) {
                    console.log("❌ OTP fetch failed:", COL.err, res);
                    set({
                        error: res.data?.message || "Failed to send OTP",
                        isLoading: false,
                    });
                } else {
                    set({ isLoading: false });
                }
                return res;
            },

            // UPDATED: Verify OTP using email from tempRegister
            verifyOTP: async (otp) => {
                console.log("[DEBUG] verifyOTP called with OTP:", otp);
                console.log(
                    "[DEBUG] Current tempRegister:",
                    get().tempRegister,
                );

                set({ isLoading: true, error: null });

                const email = get().tempRegister?.email;

                if (!email) {
                    console.log(
                        "❌ No email available for verification",
                        COL.err,
                    );
                    set({
                        error: "No email found. Please register again.",
                        isLoading: false,
                    });
                    return { success: false, error: "No email found" };
                }

                console.log("[DEBUG] Using email for verification:", email);
                console.log("🔢 Verifying OTP for email:", COL.info, email);

                try {
                    const res = await authService.verifyOTP(email, otp);
                    console.log("[DEBUG] verifyOTP API response:", res);

                    if (res.success) {
                        const { user, token } = res.data;

                        if (!user || !token) {
                            console.log(
                                "❌ Missing user or token in response:",
                                COL.err,
                                res,
                            );
                            set({
                                error: "Invalid server response: missing user or token",
                                isLoading: false,
                                tempRegister: null,
                            });
                            return {
                                success: false,
                                error: "Invalid response",
                            };
                        }

                        console.log("✅ OTP verification successful", COL.ok);
                        get().completeRegistration(user, token);
                        return { success: true, data: { user, token } };
                    } else {
                        // If we get a 500 error with HTML, show a better error message
                        if (
                            res.status === 500 &&
                            res.responseText?.includes("<!DOCTYPE html>")
                        ) {
                            const errorMsg =
                                "Server error during OTP verification. Please try again or contact support.";
                            console.log(
                                "❌ Server returned HTML error page (500)",
                                COL.err,
                            );
                            set({ error: errorMsg, isLoading: false });
                            return { success: false, error: errorMsg };
                        }

                        console.log(
                            "❌ OTP verification failed:",
                            COL.err,
                            res,
                        );
                        set({
                            error:
                                res.data?.message || "OTP verification failed",
                            isLoading: false,
                        });
                        return res;
                    }
                } catch (err) {
                    console.error("[DEBUG] Verify OTP error:", err);
                    console.log("❌ Verify OTP error:", COL.err, err);
                    set({ error: "OTP verification failed", isLoading: false });
                    return { success: false, error: "OTP verification failed" };
                }
            },

            // UPDATED: Resend OTP using email
            resendOTP: async () => {
                console.log("[DEBUG] resendOTP called");
                set({ error: null });
                const email = get().tempRegister?.email;
                console.log("[DEBUG] tempRegister email:", email);

                if (!email) {
                    const err = {
                        status: 400,
                        data: {
                            message:
                                "No pending registration. Please register again.",
                        },
                        error: true,
                    };
                    set({ error: err.data.message });
                    return err;
                }

                console.log("🔄 Resending OTP for email:", COL.info, email);
                const res = await authService.getOTP(email);
                if (!res.success) {
                    set({ error: res.data?.message || "Failed to resend OTP" });
                }
                return res;
            },

            login: async (credentials, { remember = false } = {}) => {
                console.log("[DEBUG] Login called with:", credentials);
                set({ isLoading: true, error: null });

                try {
                    const loginRes = await authService.login(credentials);
                    console.log("[DEBUG] Login API response:", loginRes);

                    if (!loginRes.success) {
                        set({
                            error: loginRes.data?.message || "Login failed",
                            isLoading: false,
                        });
                        return loginRes;
                    }

                    const token = loginRes.data.token;
                    let user = loginRes.data.user;

                    if (!user) {
                        const userRes = await authService.getUserInfo();
                        if (!userRes.success) {
                            set({
                                error:
                                    userRes.data?.message ||
                                    "Failed to fetch user info",
                                isLoading: false,
                            });
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
                    console.error("[DEBUG] Login error:", err);
                    console.log("❌ Login error:", COL.err, err);
                    set({ error: "Login failed", isLoading: false });
                    return { success: false, error: "Login failed" };
                }
            },

            logout: async (redirect = true) => {
                set({ isLoading: true });
                try {
                    await authService.logout();
                } catch (e) {
                    console.log("Logout API error", COL.warn, e);
                }

                set({
                    user: null,
                    token: null,
                    error: null,
                    tempRegister: null,
                    isLoading: false,
                });
                try {
                    localStorage.removeItem("authToken");
                    localStorage.removeItem("userInfo");
                    localStorage.removeItem("tempRegister");
                    sessionStorage.clear();
                } catch (e) {
                    console.warn("[AuthStore] Storage cleanup error", e);
                }

                if (redirect && typeof window !== "undefined") {
                    window.location.href = "/login";
                }
            },

            isAuthenticated: () => !!get().token && !!get().user,
            isAdmin: () =>
                ["admin", true].includes(
                    get().user?.role || get().user?.is_admin,
                ),
            getUserId: () => get().user?.id,
            getToken: () => get().token,

            initializeAuth: async () => {
                console.log("[DEBUG] initializeAuth called");
                try {
                    const tempData = localStorage.getItem("tempRegister");
                    if (tempData) {
                        try {
                            const tempRegister = JSON.parse(tempData);
                            console.log(
                                "[DEBUG] Loaded tempRegister from storage:",
                                tempRegister,
                            );
                            set({ tempRegister });
                        } catch (e) {
                            console.warn(
                                "[AuthStore] Failed to parse tempRegister:",
                                e,
                            );
                            localStorage.removeItem("tempRegister");
                        }
                    }

                    const token =
                        localStorage.getItem("authToken") ||
                        sessionStorage.getItem("authToken");
                    console.log("[DEBUG] Token from storage:", token);

                    if (!token) {
                        console.log("[DEBUG] No token found");
                        return set({ isLoading: false });
                    }

                    set({ token, isLoading: true });
                    const res = await authService.getUserInfo();

                    if (res.success) {
                        console.log("[DEBUG] User info loaded:", res.data.user);
                        set({ user: res.data.user, isLoading: false });
                    } else {
                        console.log("[DEBUG] Failed to load user info");
                        set({ token: null, user: null, isLoading: false });
                        get()._saveToken(null, false);
                        get()._saveUser(null);
                    }
                } catch (err) {
                    console.error("[DEBUG] Init error:", err);
                    console.log("❌ Init error:", COL.err, err);
                    set({ token: null, user: null, isLoading: false });
                }
            },
        }),
        {
            name: "auth-storage",
            partialize: (s) => ({
                token: s.token,
                user: s.user,
                rememberMe: s.rememberMe,
                tempRegister: s.tempRegister,
            }),
        },
    ),
);

if (typeof window !== "undefined") {
    useAuthStore.getState().initializeAuth();
}

export default useAuthStore;
