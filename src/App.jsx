import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { useAuthStore } from "./store/authStore";
import AuthGuard from "./components/Layout/AuthGuard"; // ← your new single guard

/* ---------- lazy pages ---------- */
const Home                  = lazy(() => import("./pages/Public/Home"));
const PreOnboard            = lazy(() => import("./pages/Public/pre-onboard"));
const PostOnboard           = lazy(() => import("./pages/Public/post-onboard"));
const Register              = lazy(() => import("./pages/Auth/Register"));
const Login                 = lazy(() => import("./pages/Auth/Login"));
const ForgetPassword        = lazy(() => import("./pages/Auth/ForgetPassword"));
const VerifyEmail           = lazy(() => import("./pages/Auth/VerifyEmail"));
const PasswordResetSuccess  = lazy(() => import("./pages/Auth/PasswordReset"));
const LoadingScreen         = lazy(() => import("./pages/Public/LoadingScreen"));
const KYCFlow               = lazy(() => import("./components/Identification/KYCFlow"));

/* ---------- dashboard shells ---------- */
const DashboardLayout       = lazy(() => import("./components/Layout/DashoardLayout"));
const SettingsLayout        = lazy(() => import("./components/Layout/DashboardSettingLayout"));

/* ---------- dashboard pages ---------- */
const MainOverview          = lazy(() => import("./pages/Dashboard/Main"));
const Messages              = lazy(() => import("./pages/Dashboard/Messages"));
const Analytics             = lazy(() => import("./pages/Dashboard/Analytics"));
const Payment               = lazy(() => import("./pages/Dashboard/Payment"));
const Wallet                = lazy(() => import("./pages/Dashboard/Wallet"));
const Notification          = lazy(() => import("./pages/Dashboard/Notification"));
const MyProfile             = lazy(() => import("./pages/Dashboard/Settings/MyProfile"));
const NotificationSettings  = lazy(() => import("./pages/Dashboard/Settings/Notifications"));
const Verification          = lazy(() => import("./pages/Dashboard/Settings/Verification"));
const Support               = lazy(() => import("./pages/Dashboard/Settings/Support"));
const ResetPassword         = lazy(() => import("./pages/Dashboard/Settings/ResetPassword"));

/* ---------- 404 ---------- */
const NotFound              = lazy(() => import("./pages/NotFound"));

/* ---------- tiny public-only wrapper ---------- */
function PublicOnly({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}


export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* ---------- PUBLIC ---------- */}
        <Route path="/" element={<Home />} />
        <Route path="/pre-onboard" element={<PreOnboard />} />
        <Route path="/post-onboard" element={<PostOnboard />} />
        <Route path="/kyc-flow" element={<KYCFlow />} />

        <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
        <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/password-reset-success" element={<PasswordResetSuccess />} />

        {/* ---------- PROTECTED (only after login/register) ---------- */}
        <Route element={<AuthGuard />}>
          <Route element={<DashboardLayout />}>
            <Route path="kyc-verification" element={<div>KYC</div>} />
            <Route path="/dashboard" element={<MainOverview />} />
            <Route path="main" element={<MainOverview />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="messages" element={<Messages />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="payment" element={<Payment />} />
            <Route path="notification" element={<Notification />} />
            <Route path="kyc-flow" element={<KYCFlow />} />
            <Route path="post-onboarding" element={<PostOnboard />} />

            <Route path="settings" element={<SettingsLayout />}>
              <Route index element={<MyProfile />} />
              <Route path="profile" element={<MyProfile />} />
              <Route path="notifications" element={<NotificationSettings />} />
              <Route path="verification" element={<Verification />} />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route path="support" element={<Support />} />
            </Route>
          </Route>

          {/* -------------------- ADMIN (same gate) -------------------- */}
          <Route path="/admin" element={<DashboardLayout />}>
            <Route index element={<div>Admin Overview</div>} />
            <Route path="allsplitz" element={<div>All Splits</div>} />
          </Route>
        </Route>

        {/* ---------- 404 ---------- */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}